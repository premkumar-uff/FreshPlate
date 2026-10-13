import { describe, expect, it } from "vitest";
import { buildRecipeFromIngredients, recommendRecipes, scoreRecipe } from "./recipeEngine";
import { RECIPES } from "../data/recipes";
import { todayISO } from "./freshness";
import type { GroceryItem } from "../types";

function grocery(name: string): GroceryItem {
  return {
    id: name,
    name,
    emoji: "🍽️",
    quantity: 1,
    unit: "piece",
    category: "produce",
    storage: "fridge",
    purchaseDate: todayISO(),
  };
}

describe("scoreRecipe", () => {
  it("matches owned ingredients and reports missing ones", () => {
    const recipe = RECIPES.find((entry) => entry.id === "masala-eggs");
    if (!recipe) throw new Error("recipe fixture missing");
    const recommendation = scoreRecipe(recipe, [grocery("Eggs"), grocery("Tomatoes")]);
    expect(recommendation.matched).toContain("Eggs");
    expect(recommendation.matched).toContain("Tomatoes");
    expect(recommendation.missing).toContain("Onion");
  });
});

describe("recommendRecipes", () => {
  it("returns the requested count sorted by score", () => {
    const recommendations = recommendRecipes([grocery("Rice"), grocery("Curd")], 3);
    expect(recommendations).toHaveLength(3);
    for (let i = 1; i < recommendations.length; i += 1) {
      expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score);
    }
  });
});

describe("buildRecipeFromIngredients", () => {
  it("lists the missing staples", () => {
    const { recipe, missing } = buildRecipeFromIngredients(["Rice"]);
    expect(recipe.name).toContain("Special");
    expect(missing.length).toBeGreaterThan(0);
  });
});
