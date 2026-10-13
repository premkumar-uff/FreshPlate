import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { findCatalog } from "../data/catalog";
import { addDaysISO, todayISO } from "../lib/freshness";
import { namesMatch, parseAmount } from "../lib/match";
import type { DiscardRecord, GroceryItem, Recipe, RecipeIngredient } from "../types";

interface FreshPlateState {
  groceries: GroceryItem[];
  consumed: GroceryItem[];
  discards: DiscardRecord[];
  meals: number;
  customRecipe: Recipe | null;
  addItem: (item: Omit<GroceryItem, "id">) => void;
  updateItem: (id: string, patch: Partial<GroceryItem>) => void;
  removeItem: (id: string) => void;
  consumeItem: (id: string, amount?: number) => void;
  completeMeal: (ingredients: Pick<RecipeIngredient, "name" | "amount">[]) => void;
  discardItem: (record: Omit<DiscardRecord, "id" | "date">) => void;
  setCustomRecipe: (recipe: Recipe | null) => void;
  resetDemo: () => void;
}

const STORAGE_KEY = "freshplate:state:v1";

const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): GroceryItem[] {
  const make = (
    name: string,
    quantity: number,
    daysAgo: number,
    expiryInDays?: number
  ): GroceryItem => {
    const entry = findCatalog(name);
    return {
      id: uid(),
      name,
      emoji: entry?.emoji ?? "🍽️",
      quantity,
      unit: entry?.defaultUnit ?? "piece",
      category: entry?.category ?? "pantry",
      storage: entry?.defaultStorage ?? "fridge",
      purchaseDate: addDaysISO(-daysAgo),
      expiryDate: expiryInDays === undefined ? undefined : addDaysISO(expiryInDays),
    };
  };

  return [
    make("Spinach", 1, 2),
    make("Tomatoes", 4, 3),
    make("Eggs", 6, 9, 12),
    make("Carrots", 4, 5),
    make("Rice", 2, 30),
    make("Onion", 5, 6),
    make("Chicken", 2, 1),
    make("Milk", 1, 3, 1),
    make("Paneer", 1, 1),
    make("Maggi Noodles", 3, 40),
    make("Bananas", 4, 4),
    make("Curd", 1, 3, 2),
    make("Peas", 1, 20),
    make("Beans", 1, 40),
    make("Butter", 1, 15, 20),
  ];
}

const FreshPlateContext = createContext<FreshPlateState | null>(null);

interface Persisted {
  groceries: GroceryItem[];
  consumed: GroceryItem[];
  discards: DiscardRecord[];
  meals: number;
  customRecipe?: Recipe | null;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as Persisted;
    if (!Array.isArray(parsed.groceries)) throw new Error("bad");
    return parsed;
  } catch {
    return { groceries: seed(), consumed: [], discards: [], meals: 0, customRecipe: null };
  }
}

export function FreshPlateProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadPersisted, []);
  const [groceries, setGroceries] = useState<GroceryItem[]>(initial.groceries);
  const [consumed, setConsumed] = useState<GroceryItem[]>(initial.consumed);
  const [discards, setDiscards] = useState<DiscardRecord[]>(initial.discards);
  const [meals, setMeals] = useState<number>(initial.meals);
  const [customRecipe, setCustomRecipe] = useState<Recipe | null>(initial.customRecipe ?? null);

  useEffect(() => {
    const payload: Persisted = { groceries, consumed, discards, meals, customRecipe };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [groceries, consumed, discards, meals, customRecipe]);

  const value: FreshPlateState = {
    groceries,
    consumed,
    discards,
    meals,
    customRecipe,
    addItem: (item) => setGroceries((prev) => [{ ...item, id: uid() }, ...prev]),
    updateItem: (id, patch) =>
      setGroceries((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    removeItem: (id) => setGroceries((prev) => prev.filter((item) => item.id !== id)),
    consumeItem: (id, amount) => {
      const item = groceries.find((entry) => entry.id === id);
      if (!item) return;
      const used = Math.min(amount ?? item.quantity, item.quantity);
      if (used <= 0) return;
      setGroceries((prev) =>
        prev.flatMap((entry) => {
          if (entry.id !== id) return [entry];
          const remaining = entry.quantity - used;
          return remaining > 0 ? [{ ...entry, quantity: remaining }] : [];
        })
      );
      setConsumed((prev) => [{ ...item, quantity: used }, ...prev]);
    },
    completeMeal: (ingredients) => {
      let list = groceries;
      const used: GroceryItem[] = [];
      for (const ingredient of ingredients) {
        const index = list.findIndex((entry) => namesMatch(entry.name, ingredient.name));
        if (index === -1) continue;
        const item = list[index];
        const amountText = (ingredient.amount ?? "").toLowerCase();
        const parsed = parseAmount(amountText);
        const wanted =
          parsed !== null && (amountText.includes(item.unit.toLowerCase()) || parsed <= item.quantity)
            ? parsed
            : 1;
        const usedAmount = Math.min(wanted, item.quantity);
        if (usedAmount <= 0) continue;
        used.push({ ...item, quantity: usedAmount });
        const remaining = item.quantity - usedAmount;
        list =
          remaining > 0
            ? list.map((entry) => (entry.id === item.id ? { ...entry, quantity: remaining } : entry))
            : list.filter((entry) => entry.id !== item.id);
      }
      setGroceries(list);
      if (used.length) setConsumed((prev) => [...used, ...prev]);
      setMeals((value) => value + 1);
    },
    discardItem: (record) =>
      setDiscards((prev) => [{ ...record, id: uid(), date: todayISO() }, ...prev]),
    setCustomRecipe,
    resetDemo: () => {
      setGroceries(seed());
      setConsumed([]);
      setDiscards([]);
      setMeals(0);
      setCustomRecipe(null);
    },
  };

  return <FreshPlateContext.Provider value={value}>{children}</FreshPlateContext.Provider>;
}

export function useFreshPlate(): FreshPlateState {
  const ctx = useContext(FreshPlateContext);
  if (!ctx) throw new Error("useFreshPlate must be used inside FreshPlateProvider");
  return ctx;
}
