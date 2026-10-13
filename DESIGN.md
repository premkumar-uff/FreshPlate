# Design

<!-- impeccable:design-schema 1 -->

## World

SHELF-EDGE. FreshPlate's interface is built from the labels and dated stickers that communicate
freshness in real kitchens and supermarkets: shelf-edge strips, price-tag labels, rotated use-by
stamps, reduced-sticker bursts, till-receipt rules, and barcode hairlines. It refuses the generic
green "eco recipe app" card look and the hero-metric dashboard template.

Seed key: `3e1b83ff` · first surface: Today (`/`).

## Platform & Modes

Web, mobile-first. Every surface is Operate: the visitor completes a task (track groceries, cook,
review impact). Expression supports the task and never obscures state or familiar affordance.

## Palette

- `label-cream` `#F4F1E7` — app ground / label stock.
- `label-card` `#FFFFFF` — the label itself; cards are white labels on cream.
- `label-rule` `#D9D3C2` — label outline and dotted receipt rules.
- `label-ink` `#1A1A17` — type, borders, active states, raised ink buttons.
- `label-soft` `#6B675C` — secondary text; a warm ink tint, never neutral gray.
- `shelf-yellow` `#F5E211` — attention and primary action only (shelf-edge offer strip, FAB,
  active tab underline, "you" row).
- `stamp-red` `#D92D20` — urgent freshness (use now) and safety.
- `stamp-amber` `#B25E00` — soon / friendly warning.
- `stamp-green` `#2E7D4F` — fresh state and positive outcomes.

Colour is never the only carrier of freshness: every stamp also spells out "USE BY / TODAY / N DAYS".

## Type

- Display and every UI label: **Barlow Condensed** (uppercase, tracking 0.01–0.22em). Carries
  headings, buttons, tab labels, item names.
- Body and prose: **Barlow**.
- Codes, dates, quantities, timers, points: **Martian Mono**, tabular figures via `.tabular`.
- Scale is fixed rem/px, not fluid. Heading steps are tight (11 → 13 → 16 → 18 → 22 → 26 → 30).

## Components

All in `src/components/ui.tsx`, used identically across screens.

- `LabelCard` — white label, 1px `label-rule` border, 12px radius, optional rotated tab tag
  (dark tab, condensed caps). Border is the only elevation; `shadow-tag` is reserved for genuinely
  raised ink objects (device frame, FAB, floating help button).
- `DateStamp` — rotated `-3deg` stamp box drawn with an inset 2px `currentColor` ring; tone drives
  colour; always two lines ("USE BY" / "TODAY").
- `StickerButton` — pill, 1.5px ink border, condensed uppercase. Variants: `primary` (shelf
  yellow), `ink`, `outline`, `quiet`. Disabled = `label-cream` ground with `label-soft` text.
- `Chip`, `Segmented`, `Field`, `SectionRule`, `ProgressStrip`, `Barcode`, `EmptyState`,
  `BackHeader`.
- `GroceryLabel` (`src/components/GroceryLabel.tsx`) — the repeated inventory label: emoji tile,
  name, quantity/storage, and a `DateStamp`; `flag` adds the red "EAT FIRST" burst.

Reduced-sticker burst, notch-tag corner cut (`.notch-tag`), tilde-free receipt rules
(border-dotted), and the barcode hairline (`.barcode`) are the four recurring motifs.

## Navigation & Shell

App shell, not a stretched website. On viewports ≥ `sm` the app renders inside a 404×858 ink device
frame on a `#E7E2D4` ground, with a status bar and home indicator. On phones it fills `100dvh` with
`safe-area-inset-bottom` padding.

Four shelf tabs — Today, Kitchen, Cook, Impact — with a centered yellow scan FAB. Rust focus modes
happen full-screen with no tab bar: `/scan`, `/prep/:id`, `/cooking/:id`, `/voice`. A floating ink
mic button sits above the tab bar for voice help.

Flow restructure: Groceries and Freshness Library merged into **Kitchen** (segmented Inventory /
Freshness A–Z); Recipes became **Cook** (segmented Smart picks / Make something). Legacy routes
`/groceries`, `/freshness`, `/recipes` redirect.

## Donated disciplines (from the direction round)

- From cassette-j-card (declined challenger): running times and quantities are right-aligned and
  tabular, the way an inked tracklist times a side.
- From split-flap (competitive challenger): the Kitchen inventory is ranked live by freshness, so
  the order changes as dates pass.
- From lexicon (competitive challenger): the Freshness A–Z view carries recomputed guide words
  naming the first and last item in view.

## Motion

One authored moment: the tab shelf-edge underline and the stamp tone. Transitions are 150–250ms,
ease-out, and only ever convey state (press is a 1px translate, timer is stepped seconds). No
orchestrated page-load sequence.

## Responsive rules

- Structure changes, not type: device frame appears at `sm`; focus modes drop chrome; the Kitchen
  letter index and ingredient boxes scroll horizontally with hidden scrollbars.
- Tap targets ≥ 40px. Body and placeholder text meet 4.5:1; stamps and labels ≥ 3:1.

## Provenance

All interface, layout, and type is authored for this build. Food emoji are content (grocery items),
not chrome; UI icons are Lucide, one stroke weight. No raster assets ship. Demo groceries, recipes,
and impact numbers are synthetic and labelled as estimates in-product.
