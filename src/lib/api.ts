/**
 * Client for the optional FreshPlate AI server (server/server.js).
 *
 * Every call degrades gracefully: when the AI server is not running the
 * screens keep their local, offline behaviour (scripted voice answers,
 * demo scans, local recipe builder). The Groq key never touches this code.
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ?? "";

export type AiStatus = "online" | "offline";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface VisionItem {
  name: string;
  note: string;
  confidence: "high" | "medium" | "low";
}

export interface VisionResult {
  items: VisionItem[];
  summary: string;
}

let statusCache: AiStatus | null = null;

async function requestJson<T>(
  path: string,
  init: RequestInit,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    const data = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) {
      throw new Error(data?.error || `Request failed (${response.status}).`);
    }
    return data;
  } finally {
    window.clearTimeout(timer);
  }
}

/** One cached availability check per session; screens call this on mount. */
export async function getAiStatus(): Promise<AiStatus> {
  if (statusCache) return statusCache;
  try {
    const data = await requestJson<{ ok: boolean; ai: boolean }>(
      "/api/health",
      { method: "GET" },
      3000
    );
    statusCache = data.ok && data.ai ? "online" : "offline";
  } catch {
    statusCache = "offline";
  }
  return statusCache;
}

export async function sendChat(input: {
  message: string;
  history?: ChatTurn[];
  context?: string;
}): Promise<string> {
  const data = await requestJson<{ reply: string }>(
    "/api/chat",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input.message,
        history: input.history ?? [],
        context: input.context ?? "",
      }),
    },
    30_000
  );
  const reply = typeof data.reply === "string" ? data.reply.trim() : "";
  if (!reply) throw new Error("The assistant returned an empty answer.");
  return reply;
}

/** Tolerant client-side guard on top of the server's already-sanitised JSON. */
export function parseVisionResult(payload: unknown): VisionResult {
  const record = payload as { items?: unknown; summary?: unknown };
  const items: VisionItem[] = Array.isArray(record?.items)
    ? record.items
        .filter(
          (item): item is { name: string; note?: string; confidence?: string } =>
            typeof (item as { name?: unknown })?.name === "string" &&
            (item as { name: string }).name.trim().length > 0
        )
        .slice(0, 4)
        .map((item) => ({
          name: item.name.trim().slice(0, 60),
          note: typeof item.note === "string" ? item.note.trim().slice(0, 160) : "",
          confidence:
            item.confidence === "high" || item.confidence === "low" ? item.confidence : "medium",
        }))
    : [];
  const summary =
    typeof record?.summary === "string" && record.summary.trim()
      ? record.summary.trim().slice(0, 300)
      : "";
  return { items, summary };
}

export async function analyzeFoodPhoto(file: Blob, filename: string): Promise<VisionResult> {
  const form = new FormData();
  form.append("image", file, filename);
  const data = await requestJson<unknown>("/api/food-photo", { method: "POST", body: form }, 45_000);
  return parseVisionResult(data);
}

export async function generateMealPlan(input: {
  ingredients: string[];
  owned?: string[];
  dietaryPreference?: string;
  days?: number;
}): Promise<string> {
  const data = await requestJson<{ plan: string }>("/api/meal-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }, 45_000);
  const plan = typeof data.plan === "string" ? data.plan.trim() : "";
  if (!plan) throw new Error("No meal plan was returned.");
  return plan;
}

export async function transcribeAudio(file: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("audio", file, filename);
  const data = await requestJson<{ text: string }>("/api/voice/transcribe", { method: "POST", body: form }, 45_000);
  return typeof data.text === "string" ? data.text.trim() : "";
}
