import { findCatalog } from "../data/catalog";
import type { DiscardRecord, GroceryItem } from "../types";

export const CO2E_PER_KG = 2.5;
export const WATER_PER_KG = 900;
export const DEFAULT_GRAMS_PER_UNIT = 150;

export function weightKg(name: string, quantity: number): number {
  const entry = findCatalog(name);
  const grams = entry?.gramsPerUnit ?? DEFAULT_GRAMS_PER_UNIT;
  return (grams * quantity) / 1000;
}

export function itemWeightKg(item: Pick<GroceryItem, "name" | "quantity">): number {
  return weightKg(item.name, item.quantity);
}

export interface ImpactSummary {
  foodSavedKg: number;
  wasteKg: number;
  meals: number;
  co2eKg: number;
  waterLitres: number;
  score: number;
  rank: number;
  tier: string;
}

export function computeImpact(
  consumed: GroceryItem[],
  discards: DiscardRecord[],
  meals: number
): ImpactSummary {
  const savedKg = consumed.reduce((sum, item) => sum + itemWeightKg(item), 0);
  const wasteKg = discards.reduce(
    (sum, record) => sum + weightKg(record.name, record.quantity),
    0
  );
  const co2e = savedKg * CO2E_PER_KG;
  const water = savedKg * WATER_PER_KG;
  const score = Math.round(savedKg * 120 + meals * 40 - wasteKg * 100);
  const rank = Math.max(1, 128 - Math.round(score / 12));
  const tier =
    score > 900
      ? "Gold Saver"
      : score > 450
        ? "Silver Saver"
        : score > 150
          ? "Bronze Saver"
          : "Starter";

  return {
    foodSavedKg: Number(savedKg.toFixed(2)),
    wasteKg: Number(wasteKg.toFixed(2)),
    meals,
    co2eKg: Number(co2e.toFixed(2)),
    waterLitres: Math.round(water),
    score,
    rank,
    tier,
  };
}
