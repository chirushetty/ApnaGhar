# Festive Craft Redesign — Design Spec

**Date:** 2026-06-12
**Project:** ApnaGhar (`apna-ghar-frontend/`)
**Status:** Approved direction — "Festive Craft v2" (mockup: `.superpowers/brainstorm/3380-1781299283/content/blend-mockup-v2.html`)

## Goal

Replace the current generic saffron/teal look with a distinctly Indian "Festive Craft" aesthetic: Vibrant Bazaar's festive palette and hand-painted-sign energy, carried on Modern Craft's clean grid and generous whitespace. Scope is the home page plus the shared shell (Navbar, Footer, design tokens); the properties and detail pages inherit the new tokens, fonts, and restyled shared components without layout changes.

## Design language

### Palette (replaces `brand-*` / `accent-*` in `tailwind.config.ts`)

| Token | Hex | Role |
|---|---|---|
| `cream` | `#FFF6E6` | Page background |
| `marigold` | `#F2A007` | Borders, frames, accents |
| `sun` | `#FFD34E` | Headline drop-shadow, highlights |
| `flame` | `#E8540C` | Primary actions, prices, logo |
| `rani` | `#B3186D` | Headlines, secondary actions, "For Sale" badge |
| `teal` | `#0E8C8C` | Tertiary accent, CTA pill, "For Rent" badge |
| `ink` | `#3A2415` | Text, card outlines, footer background |

Old token names are removed entirely. This means every file referencing `brand-*`/`accent-*` classes — including the properties page, detail page, `SearchFilters`, and `PropertyGallery` — gets its class strings updated to the new tokens. These are find-and-replace-level color swaps, not structural changes.

### Typography (replaces Geist in `layout.tsx`, via `next/font/google`)

| Font | CSS variable | Role |
|---|---|---|
| Yatra One | `--font-display` | Headlines (with `sun` hand-painted offset shadow), logo, prices. Covers Devanagari natively — "अपना घर" renders without fallback boxes. |
| Baloo 2 | `--font-ui` | Nav links, buttons, labels, card names |
| Work Sans | `--font-body` | Body copy, descriptions |

Variables are mapped to Tailwind `fontFamily` entries (`font-display`, `font-ui`, `font-body`).

### Ornament system

- **Bunting**: triangular flag strip in the four festive colors, site-wide above the Navbar. Subtle sway animation.
- **Toran dividers**: scalloped half-circle garland row between home page sections.
- **Sticker cards**: `ink` 2.5px outline, hard offset shadow, slight lift/tilt on hover, ribbon-cut badge.
- **Spinning rangoli stamp**: conic-gradient circle with counter-rotating "अपना घर" center, on the hero image. CSS-only animation.
- **Background texture**: faint diya/paisley SVG data-URI pattern (~5% opacity) on the cream background, as a reusable utility class.
- **Copy voice**: Hinglish — e.g., hero "Ghar dhoondna, ab tyohaar jaisa!", search button "Khoj!", section subtitles like "Haath se chune hue — handpicked for you". English remains for functional UI (filters, specs, prices).

## Home page structure (`src/app/page.tsx`)

Top to bottom:

1. **Bunting strip** — lives in the shared layout (site-wide), above the Navbar.
2. **Navbar** (shared, restyled) — Yatra One logo "अपना घर" with `sun` shadow, Baloo 2 links, `teal` pill CTA "List Your Property".
3. **Hero** — new `Hero` server component, **replaces and deletes `HeroSlider`**. Left: rotated `rani` tag pill, Yatra One headline, Hinglish supporting copy, `flame` rounded CTA with offset shadow + dashed-underline text link. Right: one static property image with white border, dashed `marigold` offset frame, and the spinning rangoli stamp. No client JS; animations are CSS.
4. **Search pill** — existing `HeroSearch` client component restyled: white rounded pill, 2.5px `marigold` border, dotted field dividers, `rani` "Khoj!" button. Overlaps the hero's bottom edge. Existing logic (push to `/properties` with query params) unchanged.
5. **Featured Homes** — toran divider + centered Yatra One heading with Hinglish subtitle; existing `getFeaturedProperties()` grid of restyled `PropertyCard`s on a soft marigold→rani gradient band.
6. **Explore by City** (new `CityChips` server component) — toran divider + heading "Apne Sheher Mein Dhoondo"; fully saturated chips from `POPULAR_CITIES`, each linking to `/properties?city=<city>` (existing filter wiring).
7. **Brand story strip** (new `BrandStory` server component) — "Ghar jaisa bharosa" heading with three dashed-border cards: Verified listings ("har ghar checked"), No brokerage drama ("seedhi baat"), Har budget ("₹10K rent se ₹10Cr tak"). Hardcoded copy.
8. **Footer** (shared, restyled) — `ink` background, marigold toran along the top edge, `sun` logo, light-gold link text.

## Component inventory

| Component | Change |
|---|---|
| `src/app/layout.tsx` | New fonts, bunting strip, background texture class |
| `tailwind.config.ts` | New palette + font families |
| `components/home/HeroSlider.tsx` | **Deleted** |
| `components/home/Hero.tsx` | **New** — server component |
| `components/home/HeroSearch.tsx` | Restyled markup only; logic untouched |
| `components/home/CityChips.tsx` | **New** — server component, reads `POPULAR_CITIES` |
| `components/home/BrandStory.tsx` | **New** — server component, hardcoded copy |
| `components/layout/Navbar.tsx` | Restyled |
| `components/layout/Footer.tsx` | Restyled |
| `components/properties/PropertyCard.tsx` | Restyled (sticker style) — inherited by `/properties` and detail pages |
| `components/properties/SearchFilters.tsx` | Token class swaps only; no structural changes |
| `components/properties/PropertyGallery.tsx` | Token class swaps only; no structural changes |
| `src/app/properties/page.tsx`, `src/app/properties/[id]/page.tsx` | Token class swaps only; layouts unchanged |
| `src/app/page.tsx` | New section order per structure above |

`/properties` and `/properties/[id]` keep their current layouts; they change only through inherited tokens, fonts, and shared components.

## Data flow

No data changes. All content continues to come from `src/lib/mock-data.ts` (`getFeaturedProperties`, `POPULAR_CITIES`). New sections introduce no new data dependencies; `BrandStory` copy is hardcoded in the component.

## Edge cases & accessibility

- **Reduced motion**: spinning stamp, swaying bunting, and card hover tilt are wrapped in `motion-safe:`/`@media (prefers-reduced-motion)` so they disable cleanly.
- **Touch devices**: hover tilt simply never triggers (hover-only); no special handling needed beyond reduced-motion.
- **Mobile**: hero stacks vertically (text above image), search pill becomes a stacked card with full-width fields, bunting flags shrink, card grid collapses to one column.
- **Devanagari**: only rendered in Yatra One contexts (logo, headlines, stamp), which supports it natively.
- **Contrast**: body text is `ink` on `cream` (high contrast). Colored chips/buttons use white text on `flame`/`rani`/`teal`, and `ink` text on `marigold`/`sun`.

## Verification

1. `npm run lint` passes.
2. `npm run build` passes — confirms the 9 static detail pages still generate via `generateStaticParams()`.
3. Visual pass of `/`, `/properties`, and `/properties/[id]` at mobile (~375px) and desktop (~1280px) widths against the v2 mockup.
4. Manual check: search pill navigates to `/properties` with correct query params; city chips filter correctly; reduced-motion disables animations.

## Out of scope

- `/login` and `/dashboard/add-property` (still nav stubs)
- Contact form submission, map integration, backend/auth (unchanged prototype gaps)
- Layout changes to `/properties` and `/properties/[id]`
