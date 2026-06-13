# ApnaGhar — अपना घर

> _"Your Home"_ — a real estate marketplace UI for browsing, renting, and buying property across India.

ApnaGhar is a **Next.js 14 frontend prototype** with a distinctly Indian **"Festive Craft"** visual identity — a vibrant bazaar palette and hand-painted-sign energy carried on a clean, modern grid. It runs entirely on mock data; there is no backend, authentication, or real data source yet.

## ✨ Features

- **Home** — festive hero with a spinning rangoli stamp, an overlapping search pill, a featured-listings band, city chips, and a brand-story strip.
- **Listings** (`/properties`) — client-side filtering and sorting by listing type, city, property type, price, bedrooms, furnishing, and amenities.
- **Property detail** (`/properties/[id]`) — image gallery (touch + keyboard), spec grid, amenities, a map placeholder, and a contact form (UI only). All 9 pages are statically generated.

## 🎨 Festive Craft design system

| | |
|---|---|
| **Palette** | `marigold` · `sun` · `flame` · `rani` · `teal` on a `cream`/`ink` base |
| **Type** | Yatra One (display, incl. Devanagari) · Baloo 2 (UI) · Work Sans (body) |
| **Ornaments** | Bunting, toran dividers, sticker cards, rangoli stamp, block-print texture |
| **Voice** | Hinglish for personality (_"Ghar dhoondna, ab tyohaar jaisa!"_), English for functional UI |

Design tokens live in `apna-ghar-frontend/tailwind.config.ts`; the full spec is in [`docs/superpowers/specs/`](docs/superpowers/specs/).

## 🛠 Tech stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **@fontsource** for self-hosted fonts (no Google Fonts network dependency)

## 🚀 Quick start

```bash
cd apna-ghar-frontend
npm install
npm run dev        # http://localhost:3000
```

Other scripts (run from `apna-ghar-frontend/`):

```bash
npm run build      # production build (statically generates all pages)
npm run lint       # ESLint
```

## 📁 Repository layout

```
.
├── apna-ghar-frontend/        # the Next.js app
│   ├── src/app/               # routes: /, /properties, /properties/[id]
│   ├── src/components/        # home, layout, properties, ui components
│   ├── src/lib/mock-data.ts   # source of truth for all property data
│   └── tailwind.config.ts     # Festive Craft design tokens
└── docs/                      # design specs and notes
```

## 📝 Notes

- **Fonts are self-hosted** via `@fontsource` rather than `next/font/google`, so builds need no network access for fonts.
- **Remote images load directly** (`images.unoptimized`) instead of through Next's server-side optimizer — property photos are hotlinked from Unsplash.

## 🚧 Not yet wired up

`/login` and `/dashboard/add-property` (nav stubs) · contact-form submission · map integration · backend, auth, and real data.

---

_Prototype — for demonstration purposes._
