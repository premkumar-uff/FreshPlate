import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useFreshPlate } from "../state/store";
import { computeImpact, CO2E_PER_KG, WATER_PER_KG } from "../lib/impact";
import { PackageCard, ShelfStrip, TagButton, Tag, InkStamp } from "../components/ui";

const COMMUNITY = [
  { name: "Anita", score: 1240 },
  { name: "Rahul", score: 1085 },
  { name: "Meera", score: 960 },
];

export default function Impact() {
  const { consumed, discards, meals, resetDemo } = useFreshPlate();
  const impact = computeImpact(consumed, discards, meals);

  const leaderboard = [...COMMUNITY, { name: "You", score: impact.score }]
    .sort((a, b) => b.score - a.score)
    .map((person, index) => ({ ...person, position: index + 1, you: person.name === "You" }));

  const receipt = [
    { label: "Food saved", value: `${impact.foodSavedKg} kg` },
    { label: "Food wasted", value: `${impact.wasteKg} kg` },
    { label: "CO₂e avoided", value: `${impact.co2eKg} kg` },
    { label: "Water saved", value: `${impact.waterLitres} L` },
    { label: "Meals cooked", value: `${impact.meals}` },
  ];

  return (
    <div className="px-4 pt-5 lg:px-8 lg:pt-7">
      <div className="max-w-2xl">
        <h1 className="text-[26px] font-black uppercase leading-none tracking-[0.01em]">Impact</h1>
        <p className="mt-1.5 text-xs text-soft">
          Estimated from the groceries you cooked and discarded
        </p>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10">
        <div>
          <div className="receipt-edge bg-card px-5 py-5 shadow-tag">
            <div className="border-b-[1.5px] border-dashed border-rule pb-3 text-center">
              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.24em]">
                FreshPlate
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
                Waste receipt · {impact.tier}
              </p>
            </div>
            <div className="pt-1">
              {receipt.map((line) => (
                <div
                  key={line.label}
                  className="flex items-baseline justify-between gap-3 border-b border-dotted border-rule py-2.5 last:border-0"
                >
                  <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-soft">
                    {line.label}
                  </span>
                  <span className="tabular font-mono text-[15px] font-bold">{line.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 border-t-[1.5px] border-dashed border-rule pt-3">
              <p className="text-[11px] leading-relaxed text-soft">
                Food saved counts groceries you cooked before they spoiled; waste counts items you
                discarded, by weight. Method: {CO2E_PER_KG} kg CO₂e and {WATER_PER_KG} L water per kg
                of food. All figures are estimates, not guarantees.
              </p>
            </div>
            <div className="barcode mx-auto mt-4 h-6 w-32 opacity-60" aria-hidden />
          </div>

          <section className="mt-8 space-y-3">
            <ShelfStrip guide={`${impact.score} pts`}>Stamps earned</ShelfStrip>
            <div className="flex flex-wrap gap-3 pt-1">
              <InkStamp on={impact.meals >= 1}>First meal</InkStamp>
              <InkStamp on={impact.foodSavedKg >= 1}>1 kg saved</InkStamp>
              <InkStamp on={discards.length === 0 && (meals > 0 || consumed.length > 0)} tone="red">
                Zero waste
              </InkStamp>
              <InkStamp on={impact.meals >= 5}>Five meals</InkStamp>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <ShelfStrip guide={`rank #${impact.rank}`}>Food-saver board</ShelfStrip>
            <PackageCard className="divide-y divide-rule p-0">
              {leaderboard.map((person) => (
                <div
                  key={person.name}
                  className={`flex items-center justify-between px-4 py-3 ${
                    person.you ? "bg-tag-canary/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="tabular w-6 font-mono text-[12px] font-semibold text-soft">
                      {String(person.position).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] font-bold uppercase tracking-[0.02em]">
                      {person.name}
                    </span>
                  </div>
                  <span className="tabular font-mono text-[13px] font-semibold">
                    {person.score} pts
                  </span>
                </div>
              ))}
            </PackageCard>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-soft">
              Neighbour names are demo data · your row is live
            </p>
          </section>

          <section className="space-y-3">
            <ShelfStrip>Recorded waste</ShelfStrip>
            {discards.length === 0 ? (
              <PackageCard className="p-4 text-sm text-soft">
                Nothing wasted yet. Mark items as discarded in the Kitchen and patterns will appear
                here with smarter shopping suggestions.
              </PackageCard>
            ) : (
              <PackageCard className="divide-y divide-rule p-0">
                {discards.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-[14px] font-bold uppercase">{record.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="tabular font-mono text-[12px] text-soft">
                        {record.quantity} {record.unit}
                      </span>
                      <Tag>{record.reason}</Tag>
                    </span>
                  </div>
                ))}
              </PackageCard>
            )}
          </section>

          {consumed.length === 0 && meals === 0 ? (
            <Link
              to="/cook"
              className="inline-block text-[13px] font-bold uppercase tracking-[0.06em] text-ink underline underline-offset-4"
            >
              Cook your first meal to start the board
            </Link>
          ) : null}

          <div className="max-w-xs">
            <TagButton variant="outline" full onClick={resetDemo}>
              <RotateCcw size={14} /> Reset demo data
            </TagButton>
          </div>
        </div>
      </div>
    </div>
  );
}
