/**
 * FreshPlate AI server (optional).
 *
 * The FreshPlate web app runs fully offline with its local recipe engine and
 * scripted voice answers. This server adds live AI on top when you start it:
 *
 *   POST /api/chat           cooking questions and step help (Groq chat model)
 *   POST /api/food-photo     identify fresh food in a photo (Groq vision model)
 *   POST /api/meal-plan      plan meals from chosen ingredients (Groq chat model)
 *   POST /api/voice/transcribe  speech to text for browsers without Web Speech
 *   GET  /api/health         liveness + whether an API key is configured
 *
 * The GROQ_API_KEY lives only here, in server/.env. Never put it in the
 * web app source: anything shipped to the browser is public.
 *
 * Run:
 *   cd server
 *   npm install
 *   copy .env.example .env   (then add your key)
 *   npm start
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Groq from "groq-sdk";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
const TEXT_MODEL = process.env.TEXT_MODEL ?? "openai/gpt-oss-20b";
const VISION_MODEL = process.env.VISION_MODEL ?? "qwen/qwen3.8-27b";
const TRANSCRIBE_MODEL = process.env.TRANSCRIBE_MODEL ?? "whisper-large-v3-turbo";

const origins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const app = express();
app.use(cors(origins.length ? { origin: origins } : {}));
app.use(express.json({ limit: "1mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const SYSTEM_PROMPT = [
  "You are FreshPlate, a calm, practical cooking assistant inside a kitchen app.",
  "Answer questions about ingredients, quantities, techniques, timings and food safety while someone is cooking.",
  "Keep answers short (2-4 sentences unless more detail is truly needed) because they are read or spoken aloud mid-task.",
  "Freshness of food is always an estimate: never promise that food is safe or spoiled, and say so when it matters.",
  "Never invent medical or nutrition facts, and never claim a dish is allergen-free.",
  "Hot oil and burns: advise turning off the heat and stepping back. Never say hot oil becomes safe after a fixed time.",
  "If the question is not about cooking, food or kitchens, briefly say you only help with cooking and steer back.",
].join(" ");

function requireAi(req, res, next) {
  if (!groq) {
    return res.status(503).json({
      error: "AI is not configured. Add GROQ_API_KEY to server/.env and restart.",
    });
  }
  next();
}

function textOf(message) {
  return typeof message === "string" ? message.trim() : "";
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "freshplate-ai", ai: Boolean(groq) });
});

app.post("/api/chat", requireAi, async (req, res) => {
  try {
    const { message, history = [], context = "" } = req.body ?? {};
    const question = textOf(message);
    if (!question) {
      return res.status(400).json({ error: "Message is required." });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              (item?.role === "user" || item?.role === "assistant") && textOf(item?.content)
          )
          .slice(-8)
          .map((item) => ({ role: item.role, content: textOf(item.content).slice(0, 2000) }))
      : [];

    const userContent = textOf(context)
      ? `Context from the app: ${textOf(context).slice(0, 600)}\n\nQuestion: ${question}`
      : question;

    const result = await groq.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 800,
    });

    res.json({ reply: result.choices[0]?.message?.content ?? "" });
  } catch (error) {
    console.error("chat:", error?.message ?? error);
    res.status(502).json({ error: "The assistant could not answer right now." });
  }
});

app.post("/api/food-photo", requireAi, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "A food photo is required." });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Upload a JPG, PNG or WebP image." });
    }

    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await groq.chat.completions.create({
      model: VISION_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You identify fresh groceries in photos for the FreshPlate kitchen app. " +
            'Reply with JSON only: {"items":[{"name":"short grocery name","note":"one short observation","confidence":"high|medium|low"}],"summary":"one sentence"}. ' +
            "List at most 4 distinct grocery items, most likely first. " +
            "Use plain grocery names such as Tomatoes, Spinach, Eggs, Paneer, Bananas. " +
            "If the photo does not show food, return an empty items array and say so in the summary. " +
            "Never estimate calories, ripeness guarantees or expiry dates.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "What groceries are in this photo?" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_completion_tokens: 600,
    });

    res.json(parseVisionPayload(result.choices[0]?.message?.content));
  } catch (error) {
    console.error("food-photo:", error?.message ?? error);
    res.status(502).json({ error: "The photo could not be analysed right now." });
  }
});

app.post("/api/meal-plan", requireAi, async (req, res) => {
  try {
    const { ingredients = [], dietaryPreference = "", days = 3, owned = [] } = req.body ?? {};

    const cleanList = (value, max) =>
      Array.isArray(value)
        ? value.map(textOf).filter(Boolean).slice(0, max)
        : [];

    const chosen = cleanList(ingredients, 30);
    const kitchen = cleanList(owned, 30);
    if (!chosen.length && !kitchen.length) {
      return res.status(400).json({ error: "Choose at least one ingredient." });
    }

    const safeDays = Math.min(7, Math.max(1, Number.parseInt(String(days), 10) || 3));
    const preference = textOf(dietaryPreference).slice(0, 200) || "no specific preference";

    const prompt = [
      `Plan ${safeDays} day(s) of meals for someone cooking with what they have.`,
      `Ingredients chosen for this plan: ${chosen.join(", ")}.`,
      kitchen.length ? `Also available in the kitchen: ${kitchen.join(", ")}.` : "",
      `Dietary preference: ${preference}.`,
      "For each day give: meal name, ingredients with approximate quantities, short numbered steps, and total time.",
      "Prefer ingredients that spoil soonest and mention sensible substitutions.",
      "Plain text only, no markdown tables. Keep it compact enough to read on a phone.",
      "State assumptions, never promise a dish is allergen-free, and do not give medical or exact nutrition claims.",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await groq.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1600,
    });

    res.json({ plan: result.choices[0]?.message?.content ?? "" });
  } catch (error) {
    console.error("meal-plan:", error?.message ?? error);
    res.status(502).json({ error: "The meal plan could not be generated right now." });
  }
});

app.post("/api/voice/transcribe", requireAi, audioUpload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "An audio recording is required." });
    }

    const extension = extensionFor(req.file.mimetype);
    if (!extension) {
      return res.status(400).json({ error: "Unsupported audio format." });
    }

    const file = new File([req.file.buffer], `freshplate-recording.${extension}`, {
      type: req.file.mimetype,
    });

    const transcript = await groq.audio.transcriptions.create({
      file,
      model: TRANSCRIBE_MODEL,
      response_format: "json",
    });

    res.json({ text: transcript.text ?? "" });
  } catch (error) {
    console.error("transcribe:", error?.message ?? error);
    res.status(502).json({ error: "The recording could not be transcribed right now." });
  }
});

function extensionFor(mimetype) {
  const map = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
  };
  return map[mimetype] ?? null;
}

/**
 * Defensive parser for the vision model's JSON reply: the UI only ever sees
 * a short, sanitised list of candidate grocery names.
 */
function parseVisionPayload(raw) {
  const fallback = { items: [], summary: "Nothing recognisable in this photo." };
  if (typeof raw !== "string" || !raw.trim()) return fallback;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  const summary =
    typeof parsed?.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim().slice(0, 300)
      : fallback.summary;

  const items = Array.isArray(parsed?.items)
    ? parsed.items
        .filter((item) => typeof item?.name === "string" && item.name.trim())
        .slice(0, 4)
        .map((item) => ({
          name: item.name.trim().slice(0, 60),
          note: typeof item.note === "string" ? item.note.trim().slice(0, 160) : "",
          confidence: ["high", "medium", "low"].includes(item?.confidence)
            ? item.confidence
            : "medium",
        }))
    : [];

  return { items, summary };
}

app.listen(PORT, () => {
  console.log(`FreshPlate AI server on http://localhost:${PORT}`);
  console.log(`  text model:      ${TEXT_MODEL}`);
  console.log(`  vision model:    ${VISION_MODEL}`);
  console.log(`  transcribe:      ${TRANSCRIBE_MODEL}`);
  console.log(groq ? "  GROQ_API_KEY:    loaded" : "  GROQ_API_KEY:    MISSING (AI endpoints return 503)");
});
