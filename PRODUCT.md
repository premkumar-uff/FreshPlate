# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Home cooks and students cooking for themselves or a small household, usually on a phone, often mid-task in a kitchen with limited counter space and one hand free. They want to cook with what they already bought before it spoils, without planning meals in advance or remembering use-by dates.

## Product Purpose

FreshPlate is a smart kitchen assistant that turns a user's groceries into meals and measurable waste prevention. It tracks what is at home and how fresh it is, recommends recipes from those items, guides preparation and cooking step by step, and reports the food and emissions saved. Success means fewer groceries thrown away and more meals cooked from what is already owned.

## Positioning

The recipe engine and the freshness tracker are one loop: items closest to spoiling are prioritised in the daily recipe suggestions, and cooking them feeds the waste-impact record. A recipe app that does not know your shelf life, or a pantry tracker that does not cook for you, cannot truthfully copy this.

## Operating Context

Used in a kitchen while cooking (screen read at arm's length, hands busy) and during short planning moments (scanning a delivery, checking what needs eating). Inputs are a phone camera for fresh produce, a barcode for packaged goods, and manual entry as a fallback. Freshness is always presented as an estimate with uncertainty, never a guarantee. Cooking mode is used with timers and spoken guidance, and a voice-only help mode exists for hands-busy or unsafe moments.

## Capabilities and Constraints

Nine connected screens: Home, Scan Groceries, My Groceries, Freshness Library, Recipe Selection, Preparation Mode, Cooking Mode, Voice-Only Help, and My Food Waste Impact. Inventory stores name, quantity, purchase date, storage location, printed expiry when available, and estimated freshness; users add, edit, consume, discard, and remove items. Recipe selection offers three daily suggestions plus a "make something from my ingredients" builder that also lists missing ingredients. Cooking mode has written and spoken instructions, per-step timers, progress, and step visuals (authored emoji tiles in this build; no raster assets ship). Environmental figures are estimates from documented methods. Current build uses mock scan detection, a local recipe set, and localStorage persistence; no backend or real image/barcode API is connected.

## Brand Commitments

Name: FreshPlate. Voice is calm, practical, and safety-aware, never hyped. The product explicitly refuses to claim that hot oil becomes safe after a fixed time, and refuses to overstate environmental numbers.

## Evidence on Hand

No real user data, imagery, or testimonials exist yet. Demo groceries, recipes, and impact numbers are synthetic and must stay labelled as estimates. No deploy target or analytics is configured.

## Product Principles

- The shortest path from "what I own" to "what I cook tonight".
- Freshness is an estimate, communicated honestly, never a guarantee.
- One connected loop, not nine disconnected features.
- Safety and clarity outrank delight when hands are busy or the stove is on.
- Show impact as a measured outcome, never as a marketing claim.

## Accessibility & Inclusion

Must be usable one-handed on a phone with large tap targets and readable at arm's length in a kitchen. Spoken instructions and voice-only help support low-vision and hands-busy use. Colour is never the only carrier of freshness or safety meaning.
