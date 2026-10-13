import { describe, expect, it } from "vitest";
import { addDaysISO, daysBetween, freshnessBucket, getFreshness, todayISO } from "./freshness";
import type { GroceryItem } from "../types";

function item(overrides: Partial<GroceryItem>): GroceryItem {
  return {
    id: "t",
    name: "Eggs",
    emoji: "🥚",
    quantity: 1,
    unit: "piece",
    category: "dairy",
    storage: "fridge",
    purchaseDate: todayISO(),
    ...overrides,
  };
}

describe("iso dates", () => {
  it("formats local dates as YYYY-MM-DD", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("counts whole days between dates", () => {
    expect(daysBetween("2024-01-01", "2024-01-03")).toBe(2);
    expect(daysBetween("2024-01-03", "2024-01-01")).toBe(-2);
  });
});

describe("getFreshness", () => {
  it("flags an expiry of today as use-now", () => {
    expect(getFreshness(item({ expiryDate: todayISO() })).tone).toBe("use-now");
  });

  it("treats a distant expiry as fresh", () => {
    expect(getFreshness(item({ expiryDate: addDaysISO(10) })).tone).toBe("fresh");
  });
});

describe("freshnessBucket", () => {
  it("buckets an expiry of today under half a day", () => {
    expect(freshnessBucket(item({ expiryDate: todayISO() }))).toBe("under-half");
  });
});
