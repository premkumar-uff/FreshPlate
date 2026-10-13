import { findCatalog } from "../data/catalog";
import { RECIPES } from "../data/recipes";
import { getFreshness } from "./freshness";
import { namesMatch } from "./match";
import type { GroceryItem, Recipe } from "../types";

export interface Recommendation {
  recipe: Recipe;
  matched: string[];
  expiring: string[];
  missing: string[];
  score: number;
}

export function scoreRecipe(recipe: Recipe, groceries: GroceryItem[]): Recommendation {
  const matched: string[] = [];
  const expiring: string[] = [];
  const missing: string[] = [];

  for (const ingredient of recipe.ingredients) {
    const owned = groceries.find((item) => namesMatch(item.name, ingredient.name));
    if (owned) {
      matched.push(ingredient.name);
      const { tone } = getFreshness(owned);
      if (tone === "use-now" || tone === "soon" || tone === "good") {
        expiring.push(owned.name);
      }
    } else if (!ingredient.optional) {
      missing.push(ingredient.name);
    }
  }

  const score = matched.length * 10 + expiring.length * 15 - missing.length * 8;
  return { recipe, matched, expiring, missing, score };
}

export function recommendRecipes(groceries: GroceryItem[], count = 3): Recommendation[] {
  return RECIPES.map((recipe) => scoreRecipe(recipe, groceries))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

const PROTEINS = ["Eggs", "Paneer", "Chicken", "Beans", "Curd", "Maggi Noodles"];
const BASES = ["Rice", "Bread", "Flour", "Maggi Noodles", "Potatoes"];
const AROMATICS = ["Onion", "Garlic", "Ginger", "Tomatoes"];
const SPICES = ["Chilli Powder"];

function emojiFor(name: string): string {
  return findCatalog(name)?.emoji ?? "🍽️";
}

export function buildRecipeFromIngredients(selected: string[]): {
  recipe: Recipe;
  missing: string[];
  extra: string[];
} {
  const chosen = selected.map((name) => name.trim()).filter(Boolean);

  const protein = chosen.find((name) => PROTEINS.some((p) => namesMatch(name, p)));
  const base = chosen.find((name) => BASES.some((b) => namesMatch(name, b)));
  const veg = chosen.filter(
    (name) =>
      name !== protein &&
      name !== base &&
      !AROMATICS.some((a) => namesMatch(name, a)) &&
      !SPICES.some((s) => namesMatch(name, s))
  );

  const missing: string[] = [];
  if (!base) missing.push("Rice or Bread");
  if (!protein) missing.push("Eggs, Paneer or Beans");
  if (!chosen.some((name) => AROMATICS.some((a) => namesMatch(name, a)))) missing.push("Onion");
  if (!chosen.some((name) => SPICES.some((s) => namesMatch(name, s)))) missing.push("Chilli Powder");

  const title = [protein ? "Hearty" : "Garden", veg[0] ? veg[0] : "", base ? base : ""]
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  const ingredientNames = Array.from(new Set([...chosen, ...missing]));
  const ingredients = ingredientNames.map((name) => ({
    name,
    amount: missing.includes(name) ? "to add" : "as available",
    optional: missing.includes(name),
  }));

  const steps = [
    {
      prep: true,
      image: "🧼",
      title: "Prep: set up safely",
      detail: "Wash your hands, clean the work surface and gather a pan, a spoon and a board.",
    },
    {
      prep: true,
      image: "🔪",
      title: "Prep: clean and cut",
      detail: `Wash everything well. Chop ${veg.length ? veg.join(", ") : "your vegetables"} and ${base ?? "your base"} into even pieces.`,
    },
    {
      prep: true,
      image: "🥣",
      title: "Prep: measure",
      detail: "Measure your spices and keep everything in small bowls next to the stove.",
    },
    {
      image: "🍳",
      title: "Heat the pan",
      detail: "Heat a tablespoon of oil in the pan on medium heat.",
      seconds: 60,
    },
    {
      image: "🧅",
      title: "Start with aromatics",
      detail: "Add onion, garlic and ginger. Cook until soft and fragrant.",
      seconds: 180,
    },
    {
      image: emojiFor(veg[0] ?? protein ?? "Carrots"),
      title: "Cook the main ingredients",
      detail: `Add ${protein ?? "your protein"} and ${veg.length ? veg.join(", ") : "vegetables"}. Cook until nearly done.`,
      seconds: 360,
    },
    {
      image: emojiFor(base ?? "Rice"),
      title: `Add ${base ?? "the base"}`,
      detail: `Add ${base ?? "rice or bread"} with chilli powder and salt, then mix gently.`,
      seconds: 300,
    },
    {
      image: "✅",
      title: "Taste and serve",
      detail: "Check the seasoning, make sure everything is cooked through, and serve hot.",
    },
  ];

  const recipe: Recipe = {
    id: `custom-${chosen.join("-").toLowerCase().replace(/\s+/g, "-")}`,
    name: `${title || "My"} Special`,
    emoji: emojiFor(protein ?? base ?? veg[0] ?? "Rice"),
    minutes: 30,
    servings: 2,
    protein: protein ? 16 : 8,
    carbs: base ? 48 : 20,
    calories: 380,
    tags: ["Made by you", protein ? "High protein" : "Veg"],
    ingredients,
    steps,
  };

  return { recipe, missing, extra: [] };
}
