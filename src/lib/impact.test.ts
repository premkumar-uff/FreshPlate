import { describe, expect, it } from "vitest";
import { computeImpact } from "./impact";
import { todayISO } from "./freshness";
import type { DiscardRecord, GroceryItem } from "../types";

function grocery(name: string, quantity: number): GroceryItem {
  return {
    id: name,
    name,
    emoji: "🍽️",
    quantity,
    unit: "piece",
    category: "pantry",
    storage: "pantry",
    purchaseDate: todayISO(),
  };
}

function discard(name: string, quantity: number, unit = "piece"): DiscardRecord {
  return { id: name, name, quantity, unit, reason: "Spoiled", date: todayISO() };
}

describe("computeImpact", () => {
  it("weighs saved and wasted food separately", () => {
    const impact = computeImpact([grocery("Eggs", 2)], [discard("Bread", 1, "loaf")], 1);
    expect(impact.foodSavedKg).toBeCloseTo(0.11, 2);
    expect(impact.wasteKg).toBeCloseTo(0.4, 2);
    expect(impact.co2eKg).toBeCloseTo(0.28, 2);
    expect(impact.score).toBe(13);
  });

  it("penalises waste and rewards meals", () => {
    const noWaste = computeImpact([], [], 3).score;
    const withWaste = computeImpact([], [discard("Bread", 1, "loaf")], 3).score;
    expect(noWaste).toBeGreaterThan(withWaste);
  });

  it("reports a rank of at least one", () => {
    expect(computeImpact([], [], 0).rank).toBeGreaterThanOrEqual(1);
  });
});
