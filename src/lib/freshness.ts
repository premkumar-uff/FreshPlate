import { findCatalog } from "../data/catalog";
import type { Freshness, GroceryItem, Storage } from "../types";

const STORAGE_MULTIPLIER: Record<Storage, number> = {
  fridge: 1,
  freezer: 5,
  pantry: 0.85,
  counter: 0.7,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function localISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return localISO(new Date());
}

export function addDaysISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localISO(date);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00").getTime();
  const to = new Date(toISO + "T00:00:00").getTime();
  return (to - from) / DAY_MS;
}

export function getFreshness(item: GroceryItem): Freshness {
  let daysLeft: number;

  if (item.expiryDate) {
    daysLeft = daysBetween(todayISO(), item.expiryDate);
  } else {
    const entry = findCatalog(item.name);
    const base = entry?.shelfLifeDays ?? 7;
    const storage = item.storage ?? entry?.defaultStorage ?? "fridge";
    const total = base * STORAGE_MULTIPLIER[storage];
    const age = daysBetween(item.purchaseDate, todayISO());
    daysLeft = total - age;
  }

  if (daysLeft < 0.5) {
    return { daysLeft, tone: "use-now", label: "Use now", percent: 8 };
  }
  if (daysLeft < 2) {
    return {
      daysLeft,
      tone: "soon",
      label: daysLeft < 1 ? "Under 1 day" : "1–2 days",
      percent: 35,
    };
  }
  if (daysLeft < 4) {
    return { daysLeft, tone: "good", label: `${Math.round(daysLeft)} days left`, percent: 60 };
  }
  return { daysLeft, tone: "fresh", label: `${Math.round(daysLeft)} days left`, percent: 90 };
}

export function freshnessBucket(item: GroceryItem): string {
  const { daysLeft } = getFreshness(item);
  if (daysLeft < 0.5) return "under-half";
  if (daysLeft < 1) return "half-one";
  if (daysLeft < 2) return "two";
  if (daysLeft < 3) return "three";
  if (daysLeft < 4) return "four";
  if (daysLeft < 5) return "five";
  return "five-plus";
}

export const FRESHNESS_BUCKETS: { id: string; label: string }[] = [
  { id: "under-half", label: "Under ½ day" },
  { id: "half-one", label: "½–1 day" },
  { id: "two", label: "2 days" },
  { id: "three", label: "3 days" },
  { id: "four", label: "4 days" },
  { id: "five", label: "5 days" },
  { id: "five-plus", label: "5+ days" },
];
