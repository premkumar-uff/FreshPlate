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

## Notes

- **Freshness is always an estimate**, derived from food type, storage and dates — never a guarantee.
- Icons in `public/` are authored SVG (no raster assets ship). Add 192px/512px PNG icons if you need
  guaranteed PWA install banners on older Chrome versions.
- Static hosts: SPA deep links are handled by `public/_redirects` (Netlify) and `vercel.json`.
