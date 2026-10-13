export type Storage = "fridge" | "freezer" | "pantry" | "counter";

export type Category =
  | "produce"
  | "dairy"
  | "meat"
  | "pantry"
  | "bakery"
  | "leftover";

export interface GroceryItem {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
  category: Category;
  storage: Storage;
  purchaseDate: string;
  expiryDate?: string;
  notes?: string;
}

export interface CatalogEntry {
  name: string;
  emoji: string;
  category: Category;
  defaultStorage: Storage;
  shelfLifeDays: number;
  gramsPerUnit: number;
  defaultUnit: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  optional?: boolean;
}

export interface CookingStep {
  title: string;
  detail: string;
  seconds?: number;
  image: string;
  prep?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  minutes: number;
  servings: number;
  protein: number;
  carbs: number;
  calories: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
}

export interface DiscardRecord {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
}

export type FreshnessTone = "use-now" | "soon" | "good" | "fresh";

export interface Freshness {
  daysLeft: number;
  tone: FreshnessTone;
  label: string;
  percent: number;
}
