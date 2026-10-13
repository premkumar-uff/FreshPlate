import { getFreshness } from "../lib/freshness";
import { EveningTag } from "./ui";
import type { FreshnessTone, GroceryItem } from "../types";

function tagCopy(daysLeft: number): { top: string; bottom: string } {
  if (daysLeft < 1) return { top: "Use now", bottom: "Today" };
  if (daysLeft < 2) return { top: "Eat in", bottom: "1 day" };
  return { top: "Eat in", bottom: `${Math.round(daysLeft)} days` };
}

const TONE_ORDER: FreshnessTone[] = ["use-now", "soon", "good", "fresh"];

export default function GroceryPackage({
  item,
  footer,
  flag,
}: {
  item: GroceryItem;
  footer?: React.ReactNode;
  flag?: boolean;
}) {
  const fresh = getFreshness(item);
  const copy = tagCopy(fresh.daysLeft);
  const showTag = fresh.tone !== "fresh" || flag;
  return (
    <div className="relative flex items-stretch gap-3 rounded-[10px] border border-rule bg-card px-3 py-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center self-start rounded-[8px] border border-rule bg-ground text-xl">
        <span aria-hidden>{item.emoji}</span>
      </div>
      <div className="min-w-0 flex-1 self-start">
        <p className="truncate text-[16px] font-bold leading-tight text-ink">{item.name}</p>
        <p className="tabular mt-1 font-mono text-[11px] text-soft">
          {item.quantity} {item.unit} · {item.storage}
        </p>
        {footer}
      </div>
      {showTag ? (
        <div className="flex shrink-0 items-center self-center">
          <EveningTag top={copy.top} bottom={copy.bottom} tone={fresh.tone} size="sm" />
        </div>
      ) : (
        <div className="flex shrink-0 items-center self-center pr-1">
          <span className="tabular font-mono text-[11px] font-semibold text-tag-green">
            {copy.bottom}
          </span>
          <span className="sr-only">fresh</span>
        </div>
      )}
    </div>
  );
}

export { TONE_ORDER, tagCopy };
