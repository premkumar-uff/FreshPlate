import type { CatalogEntry } from "../types";

export const CATALOG: CatalogEntry[] = [
  { name: "Apples", emoji: "🍎", category: "produce", defaultStorage: "fridge", shelfLifeDays: 14, gramsPerUnit: 180, defaultUnit: "piece" },
  { name: "Avocado", emoji: "🥑", category: "produce", defaultStorage: "counter", shelfLifeDays: 4, gramsPerUnit: 200, defaultUnit: "piece" },
  { name: "Bananas", emoji: "🍌", category: "produce", defaultStorage: "counter", shelfLifeDays: 5, gramsPerUnit: 120, defaultUnit: "piece" },
  { name: "Beans", emoji: "🫘", category: "pantry", defaultStorage: "pantry", shelfLifeDays: 180, gramsPerUnit: 100, defaultUnit: "cup" },
  { name: "Bell Pepper", emoji: "🫑", category: "produce", defaultStorage: "fridge", shelfLifeDays: 7, gramsPerUnit: 150, defaultUnit: "piece" },
  { name: "Bread", emoji: "🍞", category: "bakery", defaultStorage: "pantry", shelfLifeDays: 5, gramsPerUnit: 400, defaultUnit: "loaf" },
  { name: "Broccoli", emoji: "🥦", category: "produce", defaultStorage: "fridge", shelfLifeDays: 6, gramsPerUnit: 350, defaultUnit: "head" },
  { name: "Butter", emoji: "🧈", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 30, gramsPerUnit: 100, defaultUnit: "pack" },
  { name: "Cabbage", emoji: "🥬", category: "produce", defaultStorage: "fridge", shelfLifeDays: 12, gramsPerUnit: 900, defaultUnit: "head" },
  { name: "Carrots", emoji: "🥕", category: "produce", defaultStorage: "fridge", shelfLifeDays: 14, gramsPerUnit: 80, defaultUnit: "piece" },
  { name: "Cheese", emoji: "🧀", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 21, gramsPerUnit: 200, defaultUnit: "block" },
  { name: "Chicken", emoji: "🍗", category: "meat", defaultStorage: "fridge", shelfLifeDays: 2, gramsPerUnit: 250, defaultUnit: "portion" },
  { name: "Chilli Powder", emoji: "🌶️", category: "pantry", defaultStorage: "pantry", shelfLifeDays: 240, gramsPerUnit: 5, defaultUnit: "tsp" },
  { name: "Coriander", emoji: "🌿", category: "produce", defaultStorage: "fridge", shelfLifeDays: 4, gramsPerUnit: 20, defaultUnit: "bunch" },
  { name: "Cucumber", emoji: "🥒", category: "produce", defaultStorage: "fridge", shelfLifeDays: 8, gramsPerUnit: 200, defaultUnit: "piece" },
  { name: "Curd", emoji: "🥛", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 5, gramsPerUnit: 300, defaultUnit: "cup" },
  { name: "Eggs", emoji: "🥚", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 21, gramsPerUnit: 55, defaultUnit: "piece" },
  { name: "Flour", emoji: "🌾", category: "pantry", defaultStorage: "pantry", shelfLifeDays: 300, gramsPerUnit: 120, defaultUnit: "cup" },
  { name: "Garlic", emoji: "🧄", category: "produce", defaultStorage: "pantry", shelfLifeDays: 30, gramsPerUnit: 10, defaultUnit: "clove" },
  { name: "Ginger", emoji: "🫚", category: "produce", defaultStorage: "fridge", shelfLifeDays: 21, gramsPerUnit: 15, defaultUnit: "knob" },
  { name: "Grapes", emoji: "🍇", category: "produce", defaultStorage: "fridge", shelfLifeDays: 7, gramsPerUnit: 200, defaultUnit: "bowl" },
  { name: "Lemon", emoji: "🍋", category: "produce", defaultStorage: "fridge", shelfLifeDays: 14, gramsPerUnit: 60, defaultUnit: "piece" },
  { name: "Maggi Noodles", emoji: "🍜", category: "pantry", defaultStorage: "pantry", shelfLifeDays: 180, gramsPerUnit: 70, defaultUnit: "pack" },
  { name: "Milk", emoji: "🥛", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 4, gramsPerUnit: 250, defaultUnit: "cup" },
  { name: "Mushrooms", emoji: "🍄", category: "produce", defaultStorage: "fridge", shelfLifeDays: 5, gramsPerUnit: 100, defaultUnit: "pack" },
  { name: "Onion", emoji: "🧅", category: "produce", defaultStorage: "pantry", shelfLifeDays: 21, gramsPerUnit: 120, defaultUnit: "piece" },
  { name: "Orange", emoji: "🍊", category: "produce", defaultStorage: "fridge", shelfLifeDays: 14, gramsPerUnit: 180, defaultUnit: "piece" },
  { name: "Paneer", emoji: "🧆", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 6, gramsPerUnit: 200, defaultUnit: "block" },
  { name: "Peas", emoji: "🫛", category: "produce", defaultStorage: "freezer", shelfLifeDays: 120, gramsPerUnit: 120, defaultUnit: "cup" },
  { name: "Potatoes", emoji: "🥔", category: "produce", defaultStorage: "pantry", shelfLifeDays: 21, gramsPerUnit: 150, defaultUnit: "piece" },
  { name: "Rice", emoji: "🍚", category: "pantry", defaultStorage: "pantry", shelfLifeDays: 365, gramsPerUnit: 150, defaultUnit: "cup" },
  { name: "Spinach", emoji: "🍃", category: "produce", defaultStorage: "fridge", shelfLifeDays: 3, gramsPerUnit: 200, defaultUnit: "bunch" },
  { name: "Tomatoes", emoji: "🍅", category: "produce", defaultStorage: "counter", shelfLifeDays: 6, gramsPerUnit: 130, defaultUnit: "piece" },
  { name: "Yogurt", emoji: "🥣", category: "dairy", defaultStorage: "fridge", shelfLifeDays: 10, gramsPerUnit: 200, defaultUnit: "cup" },
];

export function findCatalog(name: string): CatalogEntry | undefined {
  const lower = name.trim().toLowerCase();
  return CATALOG.find(
    (entry) => entry.name.toLowerCase() === lower || lower.includes(entry.name.toLowerCase())
  );
}
