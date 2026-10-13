import { Link } from "react-router-dom";
import { ScanLine, Clock, Users, ArrowRight } from "lucide-react";
import { useFreshPlate } from "../state/store";
import { getFreshness } from "../lib/freshness";
import { recommendRecipes } from "../lib/recipeEngine";
import { computeImpact } from "../lib/impact";
import { PackageCard, ShelfStrip, TagButton, EveningTag } from "../components/ui";
import GroceryPackage from "../components/GroceryLabel";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Today() {
  const { groceries, meals, consumed, discards } = useFreshPlate();
  const recommendations = recommendRecipes(groceries, 3);
  const impact = computeImpact(consumed, discards, meals);

  const ranked = groceries
    .map((item) => ({ item, fresh: getFreshness(item) }))
    .sort((a, b) => a.fresh.daysLeft - b.fresh.daysLeft);
  const urgent = ranked.filter(({ fresh }) => fresh.daysLeft < 3).slice(0, 4);
  const first = ranked[0];

  const today = new Date().toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div>
      <div className="flex w-full items-center justify-between gap-3 border-b-[1.5px] border-ink bg-ink px-4 py-2.5 text-ground">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-tag-canary">
          FreshPlate
        </span>
        <span className="tabular font-mono text-[11px] uppercase tracking-[0.12em] text-ground/80">
          {today} · open 24h
        </span>
      </div>

      <div className="px-4 pt-5 lg:px-8 lg:pt-7">
        <div className="max-w-2xl">
          <p className="text-sm text-soft">{greeting()}, cook.</p>
          <h1 className="mt-1 text-[28px] font-black uppercase leading-[0.98] tracking-[0.01em] text-ink sm:text-[32px]">
            {first && first.fresh.daysLeft < 1
              ? `${first.item.name} won't wait`
              : urgent.length
                ? `${urgent.length} item${urgent.length > 1 ? "s" : ""} to use first`
                : "Kitchen is fresh"}
          </h1>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <section className="space-y-3">
            <ShelfStrip guide={`${ranked.length} tracked`}>Eat first</ShelfStrip>
            {urgent.length ? (
              <div className="space-y-3">
                {urgent.map(({ item, fresh }) => (
                  <GroceryPackage key={item.id} item={item} flag={fresh.daysLeft < 1} />
                ))}
              </div>
            ) : (
              <PackageCard className="p-5 text-sm text-soft">
                Nothing close to spoiling. Add tonight&apos;s groceries or plan a meal.
              </PackageCard>
            )}
            <Link to="/scan" className="block">
              <TagButton full>
                <ScanLine size={16} /> Scan a grocery
              </TagButton>
            </Link>
          </section>

          <section className="space-y-3">
            <ShelfStrip guide="3 picks today">Cook tonight</ShelfStrip>
            {recommendations.map(({ recipe, expiring }) => (
              <PackageCard key={recipe.id} raised className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[8px] border border-rule bg-ground text-2xl">
                    {recipe.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-bold leading-tight text-ink">{recipe.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-soft">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {recipe.minutes} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} /> {recipe.servings}
                      </span>
                      <span className="tabular">
                        {recipe.calories}kcal · {recipe.protein}p
                      </span>
                    </div>
                  </div>
                  <EveningTag top="Ready in" bottom={`${recipe.minutes}m`} tone="good" size="sm" />
                </div>
                {expiring.length ? (
                  <p className="mt-2.5 text-[11px] font-semibold text-tag-orange">
                    Clears: {expiring.slice(0, 3).join(", ")}
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Link to={`/prep/${recipe.id}`} className="flex-1">
                    <TagButton variant="ink" full>
                      Start prep
                    </TagButton>
                  </Link>
                  <Link to="/cook">
                    <TagButton variant="outline" aria-label="More recipes">
                      <ArrowRight size={16} />
                    </TagButton>
                  </Link>
                </div>
              </PackageCard>
            ))}
          </section>
        </div>

        <Link to="/impact" className="mt-8 block">
          <div className="receipt-edge bg-card px-5 py-4 shadow-tag">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-soft">
                  Food saved so far · estimate
                </p>
                <p className="tabular mt-1 font-mono text-[26px] font-bold leading-none text-ink">
                  {impact.foodSavedKg}
                  <span className="ml-1 text-sm font-semibold">kg</span>
                </p>
              </div>
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink underline underline-offset-4">
                View receipt
              </span>
            </div>
            <div className="barcode mt-3 h-4 w-28 opacity-50" aria-hidden />
          </div>
        </Link>
      </div>
    </div>
  );
}
