# FreshPlate

A mobile-first smart kitchen assistant that turns the groceries you already own into meals and
measurable waste prevention. Track what is at home and how fresh it is, cook from the items closest
to spoiling, and watch the food and emissions saved add up.

See `PRODUCT.md` for the product brief, `DESIGN.md` for the SHELF-EDGE design system, and `MINI_PROJECT_TECHNICAL_SPECIFICATION.md` for the M.Sc. Data Science Mini-Project Technical Specification Report.

## Stack

- React 18 + TypeScript (strict) + Vite 5
- Tailwind CSS v3 (design tokens in `tailwind.config.js`)
- React Router v6
- localStorage persistence (no backend; demo data is synthetic and labelled as estimates)

## Commands

```bash
npm install       # install dependencies
npm run dev       # start the dev server
npm run build     # type-check and build to dist/
npm run preview   # preview the production build
npm run typecheck # tsc -b --noEmit
npm test          # run the unit tests (Vitest)
```

## Structure

```
src/
  components/   Layout (app shell), ui.tsx (design-system primitives), GroceryLabel
  data/         catalog.ts (shelf-life + weight reference), recipes.ts (local recipe set)
  lib/          freshness.ts, impact.ts, recipeEngine.ts, match.ts
  screens/      Today, Kitchen, Cook, Scan, Prep, Cooking, VoiceHelp, Impact
  state/        store.tsx (context + localStorage)
```

## Optional AI server (Groq)

FreshPlate works fully offline: scripted voice answers, demo scans and a local recipe engine.
`server/` adds **optional** live AI on top; when it is not running, every screen falls back to its
offline behaviour automatically.

| Screen | Offline behaviour | With the AI server |
| --- | --- | --- |
| Voice Help (`/voice`) | Scripted, reviewed answers | Live cooking answers via Groq (`openai/gpt-oss-20b`); safety questions always use the reviewed instant reply |
| Scan (`/scan`) | Demo scan (random catalog item) | Real food-photo recognition via `qwen/qwen3.8-27b`, with alternative guesses you can switch between |
| Cook → Make something | Local recipe builder | "Plan 3 days with AI" turns your chosen ingredients into a three-day meal plan |

Setup:

```bash
cd server
npm install
copy .env.example .env    # Windows; use cp on macOS/Linux
# edit .env and add your GROQ_API_KEY from https://console.groq.com/keys
npm start                 # or: npm run ai from the project root
```

Then run `npm run dev` in a second terminal — Vite proxies `/api` to `http://127.0.0.1:3000`.
The web app checks `/api/health` once per session and shows "AI server offline" states when it is
not there. For a phone on the same network, set `VITE_API_BASE=http://<your-computer-ip>:3000`
and allow port 3000 through your firewall.

Endpoints: `POST /api/chat`, `POST /api/food-photo`, `POST /api/meal-plan`,
`POST /api/voice/transcribe`, `GET /api/health`. Models are overridable via `.env`
(`TEXT_MODEL`, `VISION_MODEL`, `TRANSCRIBE_MODEL`).

**Security:** the Groq key lives only in `server/.env` (git-ignored) — never in `src/`. This is a
demo server: add authentication, rate limiting and strict CORS (`CORS_ORIGINS` in `.env`) before
deploying it anywhere public.

## Notes

- **Freshness is always an estimate**, derived from food type, storage and dates — never a guarantee.
- Icons in `public/` are authored SVG (no raster assets ship). Add 192px/512px PNG icons if you need
  guaranteed PWA install banners on older Chrome versions.
- Static hosts: SPA deep links are handled by `public/_redirects` (Netlify) and `vercel.json`.
