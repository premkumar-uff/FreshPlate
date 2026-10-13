import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Volume2, Check, ArrowRight } from "lucide-react";
import { getRecipe } from "../data/recipes";
import { useFreshPlate } from "../state/store";
import {
  BackHeader,
  PackageCard,
  ProgressStrip,
  ShelfStrip,
  TagButton,
} from "../components/ui";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function Prep() {
  const { recipeId = "" } = useParams();
  const navigate = useNavigate();
  const { customRecipe } = useFreshPlate();
  const recipe = recipeId === "custom" ? customRecipe : getRecipe(recipeId);
  const [done, setDone] = useState<string[]>([]);

  if (!recipe) {
    return (
      <div className="min-h-full px-4 pb-12 pt-4 lg:px-8">
        <div className="mx-auto w-full max-w-xl space-y-4">
          <BackHeader title="Preparation" />
          <PackageCard className="p-5 text-sm text-soft">
            This recipe is no longer available. Build a new one from Make something.
          </PackageCard>
        </div>
      </div>
    );
  }

  const prepSteps = recipe.steps.filter((step) => step.prep);
  const progress = prepSteps.length ? (done.length / prepSteps.length) * 100 : 0;

  return (
    <div className="min-h-full px-4 pb-12 pt-4 lg:px-8">
      <div className="mx-auto w-full max-xl:max-w-2xl space-y-5">
        <BackHeader title="Mise en place" subtitle={recipe.name} />

        <PackageCard className="space-y-2.5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-black uppercase leading-none tracking-[0.02em]">
              Prep checklist
            </h2>
            <span className="tabular font-mono text-[12px] font-semibold">
              {done.length}/{prepSteps.length}
            </span>
          </div>
          <ProgressStrip value={progress} />
          <p className="text-[11px] text-soft">
            Finish every prep step before the stove is turned on.
          </p>
        </PackageCard>

        <div className="space-y-3">
          {prepSteps.map((step, index) => {
            const isDone = done.includes(step.title);
            return (
              <PackageCard key={step.title} className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-rule bg-ground text-xl">
                    {step.image}
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
                      Prep {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-0.5 text-[16px] font-bold leading-tight text-ink">
                      {step.title}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-soft">{step.detail}</p>
                <div className="flex gap-2">
                  <TagButton variant="outline" onClick={() => speak(`${step.title}. ${step.detail}`)}>
                    <Volume2 size={14} /> Listen
                  </TagButton>
                  <TagButton
                    variant={isDone ? "ink" : "primary"}
                    onClick={() =>
                      setDone((prev) =>
                        prev.includes(step.title)
                          ? prev.filter((entry) => entry !== step.title)
                          : [...prev, step.title]
                      )
                    }
                  >
                    <Check size={14} /> {isDone ? "Done" : "Mark done"}
                  </TagButton>
                </div>
              </PackageCard>
            );
          })}
        </div>

        <div className="pt-1">
          <ShelfStrip>Ready for the stove</ShelfStrip>
          <div className="mt-3">
            <TagButton full onClick={() => navigate(`/cooking/${recipe.id}`)}>
              Start cooking <ArrowRight size={16} />
            </TagButton>
          </div>
        </div>
      </div>
    </div>
  );
}
