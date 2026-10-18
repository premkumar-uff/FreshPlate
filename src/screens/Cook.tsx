import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Clock, Users, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { CATALOG } from "../data/catalog";
import { buildRecipeFromIngredients, recommendRecipes } from "../lib/recipeEngine";
import { generateMealPlan, getAiStatus, type AiStatus } from "../lib/api";
import { useFreshPlate } from "../state/store";
import {
  Chip,
  Field,
  PackageCard,
  ShelfStrip,
  Segmented,
  TagButton,
  EveningTag,
} from "../components/ui";

export default function Cook() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get("tab") === "make" ? "make" : "picks";
  const { groceries, setCustomRecipe } = useFreshPlate();

  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [built, setBuilt] = useState<ReturnType<typeof buildRecipeFromIngredients> | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [aiPlan, setAiPlan] = useState("");
  const [planning, setPlanning] = useState(false);
  const [planNote, setPlanNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAiStatus().then((value) => {
      if (!cancelled) setAi(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function planWithAi() {
    if (planning || !selected.length) return;
    setPlanning(true);
    setAiPlan("");
    setPlanNote("");
    try {
      const plan = await generateMealPlan({
        ingredients: selected,
        owned: ownedNames,
        days: 3,
      });
      setAiPlan(plan);
    } catch (error) {
      setPlanNote(
        error instanceof Error && error.message
          ? error.message
          : "The meal plan could not be generated."
      );
    } finally {
      setPlanning(false);
    }
  }

  const recommendations = useMemo(() => recommendRecipes(groceries, 3), [groceries]);
  const ownedNames = Array.from(new Set(groceries.map((item) => item.name)));
  const options = Array.from(new Set([...ownedNames, ...CATALOG.map((entry) => entry.name)]));

  function toggle(name: string) {
    setBuilt(null);
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((entry) => entry !== name) : [...prev, name]
    );
  }

  return (
    <div className="px-4 pt-5 lg:px-8 lg:pt-7">
      <div>
        <h1 className="text-[26px] font-black uppercase leading-none tracking-[0.01em]">Cook</h1>
        <p className="mt-1.5 text-xs text-soft">Picks from what you own, or build your own</p>
      </div>

      <div className="mt-5">
        <Segmented
          value={view}
          onChange={(id) => setParams(id === "make" ? { tab: "make" } : {})}
          options={[
            { id: "picks", label: "Smart picks" },
            { id: "make", label: "Make something" },
          ]}
        />
      </div>

      {view === "picks" ? (
        <div className="mt-5 space-y-4">
          <p className="max-w-[30rem] text-[12px] leading-relaxed text-soft">
            Three daily suggestions, ranking groceries that may spoil soon first while balancing
            taste, health and effort.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map(({ recipe, matched, expiring, missing }) => (
              <PackageCard key={recipe.id} raised className="flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[8px] border border-rule bg-ground text-2xl">
                    {recipe.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[18px] font-bold leading-tight text-ink">{recipe.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-soft">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {recipe.minutes} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} /> {recipe.servings} servings
                      </span>
                      <span className="tabular">
                        {recipe.calories}kcal · {recipe.protein}p · {recipe.carbs}c
                      </span>
                    </div>
                  </div>
                  <EveningTag top="Ready in" bottom={`${recipe.minutes}m`} tone="good" size="sm" />
                </div>

                <div className="mt-3 space-y-1 text-[11px] leading-relaxed">
                  {expiring.length ? (
                    <p className="font-semibold text-tag-orange">
                      Uses soon-to-spoil: {expiring.join(", ")}
                    </p>
                  ) : null}
                  {matched.length ? <p className="text-soft">In your kitchen: {matched.join(", ")}</p> : null}
                  {missing.length ? (
                    <p className="flex items-center gap-1 text-soft">
                      <AlertTriangle size={11} /> Missing: {missing.join(", ")}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 lg:mt-auto lg:pt-3">
                  <Link to={`/prep/${recipe.id}`}>
                    <TagButton full>Start preparation</TagButton>
                  </Link>
                </div>
              </PackageCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <PackageCard className="space-y-3 p-4">
            <ShelfStrip guide={`${selected.length} chosen`}>Your ingredients</ShelfStrip>
            <div className="flex flex-wrap gap-1.5">
              {options.map((name) => (
                <Chip key={name} active={selected.includes(name)} onClick={() => toggle(name)}>
                  {name}
                  {ownedNames.includes(name) ? <span className="ml-1 opacity-60">·have</span> : null}
                </Chip>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field
                  label="Add another"
                  placeholder="e.g. Mushrooms"
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && customInput.trim()) {
                      toggle(customInput.trim());
                      setCustomInput("");
                    }
                  }}
                />
              </div>
              <TagButton
                variant="outline"
                onClick={() => {
                  if (customInput.trim()) {
                    toggle(customInput.trim());
                    setCustomInput("");
                  }
                }}
                aria-label="Add ingredient"
              >
                <Plus size={16} />
              </TagButton>
            </div>
            <TagButton
              full
              disabled={selected.length < 2}
              onClick={() => {
                const result = buildRecipeFromIngredients(selected);
                setBuilt(result);
                setCustomRecipe(result.recipe);
              }}
            >
              Build a recipe
            </TagButton>
          </PackageCard>

          {built ? (
            <PackageCard tab="Built" className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-[8px] border border-rule bg-ground text-2xl">
                  {built.recipe.emoji}
                </div>
                <div>
                  <p className="text-[18px] font-bold leading-tight text-ink">{built.recipe.name}</p>
                  <p className="tabular font-mono text-[11px] text-soft">
                    {built.recipe.minutes}min · {built.recipe.calories}kcal · {built.recipe.protein}p
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-[12px] text-soft">
                {built.recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.name} className="flex justify-between gap-3">
                    <span className={ingredient.optional ? "text-tag-orange" : ""}>
                      {ingredient.name}
                    </span>
                    <span className="font-mono">{ingredient.amount}</span>
                  </li>
                ))}
              </ul>
              {built.missing.length ? (
                <p className="rounded-[8px] border border-tag-orange/40 bg-tag-orange/5 p-2.5 text-[11px] font-semibold text-tag-orange">
                  Still needed: {built.missing.join(", ")}
                </p>
              ) : (
                <p className="rounded-[8px] border border-tag-green/40 bg-tag-green/5 p-2.5 text-[11px] font-semibold text-tag-green">
                  You have everything for this recipe.
                </p>
              )}
              <TagButton full onClick={() => navigate("/prep/custom")}>
                Start preparation
              </TagButton>
            </PackageCard>
          ) : null}

          <PackageCard tab="AI plan" className="space-y-3 p-4 pt-5">
            <ShelfStrip guide={ai === "online" ? "3 days" : undefined}>Plan meals with AI</ShelfStrip>
            <p className="text-[12px] leading-relaxed text-soft">
              Turn your chosen ingredients into a three-day meal plan with quantities, steps and
              timings. The plan is AI-generated guidance — always check allergens yourself.
            </p>
            {ai === "online" ? (
              <TagButton full onClick={planWithAi} disabled={planning || selected.length < 1}>
                {planning ? (
                  <>
                    <Loader2 size={15} className="motion-safe:animate-spin" /> Planning…
                  </>
                ) : (
                  "Plan 3 days with AI"
                )}
              </TagButton>
            ) : (
              <p className="rounded-[8px] border border-rule bg-ground p-2.5 text-[11px] font-semibold text-soft">
                {ai === null
                  ? "Checking the AI assistant…"
                  : "AI plans are offline. Start the AI server (see README), or build a recipe locally above."}
              </p>
            )}
            {planNote ? (
              <p className="rounded-[8px] border border-tag-orange/40 bg-tag-orange/5 p-2.5 text-[11px] font-semibold text-tag-orange">
                {planNote}
              </p>
            ) : null}
            {aiPlan ? (
              <div className="whitespace-pre-wrap rounded-[8px] border border-rule bg-ground p-3 text-[12px] leading-relaxed text-ink">
                {aiPlan}
              </div>
            ) : null}
          </PackageCard>
        </div>
      )}
    </div>
  );
}
