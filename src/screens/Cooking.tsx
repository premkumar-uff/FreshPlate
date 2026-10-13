import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Volume2,
  Pause,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mic,
} from "lucide-react";
import { getRecipe } from "../data/recipes";
import { useFreshPlate } from "../state/store";
import {
  BackHeader,
  PackageCard,
  ProgressStrip,
  ShelfStrip,
  TagButton,
  InkStamp,
} from "../components/ui";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function Cooking() {
  const { recipeId = "" } = useParams();
  const navigate = useNavigate();
  const { customRecipe, completeMeal } = useFreshPlate();
  const recipe = recipeId === "custom" ? customRecipe : getRecipe(recipeId);

  const cookSteps = useMemo(
    () => (recipe ? recipe.steps.filter((step) => !step.prep) : []),
    [recipe]
  );

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const spokenRef = useRef("");
  const prevRemainingRef = useRef<number | null>(null);

  const step = cookSteps[index];

  useEffect(() => {
    if (!step) return;
    const text = `${step.title}. ${step.detail}`;
    if (spokenRef.current !== text) {
      spokenRef.current = text;
      speak(text);
    }
    prevRemainingRef.current = null;
    setRemaining(step.seconds ?? null);
    setRunning(Boolean(step.seconds));
  }, [step]);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      if (running) setRunning(false);
      if (prevRemainingRef.current !== 0) {
        const nextStep = cookSteps[index + 1];
        speak(
          nextStep ? `Time is up. Next: ${nextStep.title}` : "Time is up. Your dish should be ready."
        );
      }
      prevRemainingRef.current = remaining;
      return;
    }
    if (!running) return;
    const timer = window.setTimeout(
      () => setRemaining((value) => Math.max(0, (value ?? 1) - 1)),
      1000
    );
    prevRemainingRef.current = remaining;
    return () => window.clearTimeout(timer);
  }, [running, remaining, index, cookSteps]);

  if (!recipe || !step) {
    return (
      <div className="min-h-full px-4 pb-12 pt-4 lg:px-8">
        <div className="mx-auto w-full max-w-xl space-y-4">
          <BackHeader title="Cooking" />
          <PackageCard className="p-5 text-sm text-soft">This recipe is no longer available.</PackageCard>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-full px-4 pb-12 pt-4 lg:px-8">
        <div className="mx-auto w-full max-w-xl space-y-5">
          <BackHeader title="After cooking" subtitle={recipe.name} />
          <PackageCard className="space-y-3 p-6 text-center">
            <div className="flex justify-center">
              <InkStamp on tone="green">
                Plated
              </InkStamp>
            </div>
            <p className="text-[24px] font-black uppercase leading-none">Nice cooking</p>
            <p className="text-sm text-soft">
              You turned {recipe.ingredients.length} tracked ingredients into a real meal instead of
              letting them spoil.
            </p>
          </PackageCard>
          <PackageCard className="space-y-3 p-4">
            <ShelfStrip>How did it turn out?</ShelfStrip>
            <div className="flex justify-center gap-2">
              {[
                { face: "😐", label: "Okay" },
                { face: "🙂", label: "Good" },
                { face: "😋", label: "Great" },
                { face: "🤩", label: "Amazing" },
              ].map(({ face, label }) => (
                <button
                  key={label}
                  onClick={() => speak(`${label}. Thanks for the feedback.`)}
                  className="flex flex-col items-center gap-1 rounded-[8px] border border-rule bg-card px-3 py-2 text-lg transition hover:border-ink"
                >
                  <span aria-hidden>{face}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-soft">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-soft">
              Feedback tunes future freshness estimates and suggestions.
            </p>
          </PackageCard>
          <TagButton
            full
            onClick={() => {
              completeMeal(
                recipe.ingredients.map((ingredient) => ({
                  name: ingredient.name,
                  amount: ingredient.amount,
                }))
              );
              navigate("/impact");
            }}
          >
            Log meal &amp; see impact
          </TagButton>
        </div>
      </div>
    );
  }

  const progress = (index / Math.max(1, cookSteps.length - 1)) * 100;

  return (
    <div className="min-h-full px-4 pb-10 pt-4 lg:px-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <BackHeader
          title="On the line"
          subtitle={recipe.name}
          right={
            <Link
              to="/voice"
              aria-label="Voice help"
              className="grid h-9 w-9 place-items-center rounded-[8px] border-[1.5px] border-ink bg-tag-canary text-ink"
            >
              <Mic size={17} />
            </Link>
          }
        />

        <div className="flex items-center gap-3">
          <ProgressStrip value={progress} />
          <span className="tabular shrink-0 font-mono text-[11px] font-semibold">
            {String(index + 1).padStart(2, "0")}/{String(cookSteps.length).padStart(2, "0")}
          </span>
        </div>

        <PackageCard raised className="flex-1 space-y-4 p-4">
          <div className="grid h-40 w-full place-items-center rounded-[8px] border border-rule bg-ground text-5xl">
            {step.image}
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
              Step {index + 1} of {cookSteps.length}
            </span>
            <h2 className="mt-1 text-[24px] font-black uppercase leading-none">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-soft">{step.detail}</p>
          </div>

          {step.seconds ? (
            <div className="rounded-[10px] border-[1.5px] border-ink bg-ink p-4 text-ground">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ground/70">
                  Timer
                </span>
                <span className="tabular font-mono text-[34px] font-bold leading-none text-tag-canary">
                  {remaining !== null ? format(remaining) : "00:00"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <TagButton
                  variant="outline"
                  full
                  className="!border-ground/40 !bg-transparent !text-ground hover:!bg-ground/10 hover:!text-ground"
                  onClick={() => {
                    if (remaining !== null && remaining <= 0) {
                      prevRemainingRef.current = null;
                      setRemaining(step.seconds ?? 0);
                      setRunning(true);
                    } else {
                      setRunning((value) => !value);
                    }
                  }}
                >
                  {remaining !== null && remaining <= 0 ? (
                    <RotateCcw size={14} />
                  ) : running ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                  {remaining !== null && remaining <= 0 ? "Restart" : running ? "Pause" : "Resume"}
                </TagButton>
                <TagButton
                  variant="outline"
                  full
                  className="!border-ground/40 !bg-transparent !text-ground hover:!bg-ground/10 hover:!text-ground"
                  onClick={() => {
                    prevRemainingRef.current = null;
                    setRemaining(step.seconds ?? 0);
                    setRunning(false);
                  }}
                >
                  <RotateCcw size={14} /> Reset
                </TagButton>
              </div>
            </div>
          ) : null}

          <TagButton variant="quiet" onClick={() => speak(`${step.title}. ${step.detail}`)}>
            <Volume2 size={14} /> Read this step aloud
          </TagButton>
        </PackageCard>

        <div className="flex gap-2">
          <TagButton
            variant="outline"
            full
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft size={16} /> Back
          </TagButton>
          {index === cookSteps.length - 1 ? (
            <TagButton
              full
              onClick={() => {
                window.speechSynthesis?.cancel();
                setFinished(true);
              }}
            >
              <CheckCircle2 size={16} /> Finish
            </TagButton>
          ) : (
            <TagButton
              full
              onClick={() => setIndex((value) => Math.min(cookSteps.length - 1, value + 1))}
            >
              Next step <ArrowRight size={16} />
            </TagButton>
          )}
        </div>
      </div>
    </div>
  );
}

function format(total: number): string {
  const safe = Math.max(0, total);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}
