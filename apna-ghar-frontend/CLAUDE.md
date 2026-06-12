# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `apna-ghar-frontend/`.

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

## Architecture

**Next.js 14 App Router** with a mix of Server Components (default) and Client Components (`"use client"`).

### Data flow

All property data lives in `src/lib/mock-data.ts` — 9 hardcoded `Property` objects plus three query helpers (`getPropertyById`, `getFeaturedProperties`, `getSimilarProperties`). There is no API layer or state management library. Components import from mock-data directly.

### Server vs Client split

| File | Rendering |
|---|---|
| `src/app/page.tsx` | Server Component — calls `getFeaturedProperties()` at build time |
| `src/app/properties/page.tsx` | Exports a Server Component wrapper; filtering logic lives in the inner `PropertiesContent` Client Component, which must be wrapped in `<Suspense>` because it calls `useSearchParams()` |
| `src/app/properties/[id]/page.tsx` | Server Component with `generateStaticParams()` — all 9 detail pages are statically generated |

### Filtering

Filtering and sorting on `/properties` is entirely client-side in `PropertiesContent` via `useState` + `useMemo`. The `Filters` interface and `defaultFilters` constant are **co-located in `SearchFilters.tsx`** (not in `src/types/`), and exported from there for use in `properties/page.tsx`.

URL query params (`?type=`, `?city=`, `?propertyType=`) seed the initial filter state via `useSearchParams` on first render only — subsequent filter changes do not update the URL.

## File map

| Path | What lives here |
|---|---|
| `src/app/` | Pages: `/`, `/properties`, `/properties/[id]` |
| `src/components/home/` | `HeroSlider` (5s auto-rotate), `HeroSearch` |
| `src/components/layout/` | `Navbar`, `Footer` |
| `src/components/properties/` | `PropertyCard`, `PropertyGallery` (touch/keyboard carousel), `SearchFilters` |
| `src/lib/mock-data.ts` | Source of truth for all property data; also exports `ALL_AMENITIES`, `POPULAR_CITIES` |
| `src/lib/utils.ts` | `cn()`, `formatPrice()` (₹ with Lakh/Crore formatting), `formatArea()`, `postedLabel()` |
| `src/types/property.ts` | `Property`, `ListingType`, `PropertyType`, `PropertyOwner` interfaces |

## Conventions

- Path alias `@/*` → `src/*`
- External images: `images.unsplash.com` only (whitelisted in `next.config.mjs`)
- Brand palette: saffron (`brand-*`) primary + teal (`accent-*`) secondary, defined in `tailwind.config.ts`; use these tokens rather than raw colours
- `cn()` in `utils.ts` is a lightweight class merger (filters falsy values only — it does **not** deduplicate conflicting Tailwind classes the way `clsx`+`twMerge` would)
- Buy prices in mock data are total rupees (e.g., `35000000` = ₹3.5 Cr); rent prices are monthly (e.g., `65000` = ₹65,000/mo). `formatPrice()` handles display for both
- `SearchFilters` renders only the first 6 entries from `ALL_AMENITIES` (`.slice(0, 6)`)
- `getSimilarProperties` matches solely by city, capped at 3 results

## Not yet wired up

- `/login` and `/dashboard/add-property` — nav stubs, pages missing
- Contact form on property detail — UI only, no submit handler
- Map placeholder on property detail — no map integration
- No backend, auth, or real data source
