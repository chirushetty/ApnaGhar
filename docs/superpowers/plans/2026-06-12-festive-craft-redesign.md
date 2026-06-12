# Festive Craft Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the ApnaGhar home page and shared shell in the approved "Festive Craft" aesthetic (spec: `docs/superpowers/specs/2026-06-12-festive-craft-redesign-design.md`; visual reference: `.superpowers/brainstorm/3380-1781299283/content/blend-mockup-v2.html`).

**Architecture:** Next.js 14 App Router project at `apna-ghar-frontend/`. New design tokens land first in `tailwind.config.ts` + `globals.css` + `layout.tsx` (fonts), then components are restyled one per task. The home page is rebuilt last from new + restyled pieces, then remaining `brand-*`/`accent-*` classes on the properties pages are swept to new tokens.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `next/font/google`, lucide-react. No test framework exists in this repo and the change is purely presentational, so per-task verification is `npm run lint` + `npm run build` (build regenerates all 9 static detail pages) instead of unit tests — do NOT add a test framework for this.

**Working directory for all commands:** `apna-ghar-frontend/` (run as `npm run lint --prefix apna-ghar-frontend` from repo root, or `cd apna-ghar-frontend` first). Git commands run from the repo root `Apna Ghar/`.

**Key constraints from the codebase:**
- Path alias `@/*` → `src/*`
- External images must come from `images.unsplash.com` (whitelisted in `next.config.mjs`)
- `HeroSearch` logic (router push to `/properties` with query params) must not change — markup/classes only
- The new `teal` token replaces Tailwind's built-in `teal` scale. Verified: no `teal-[0-9]` classes exist in `src/`, so this is safe.

---

### Task 1: Design token + font foundation (Tailwind, globals, layout, Bunting, Toran)

**Files:**
- Modify: `apna-ghar-frontend/tailwind.config.ts`
- Modify: `apna-ghar-frontend/src/app/globals.css`
- Modify: `apna-ghar-frontend/src/app/layout.tsx`
- Create: `apna-ghar-frontend/src/components/layout/Bunting.tsx`
- Create: `apna-ghar-frontend/src/components/ui/Toran.tsx`

- [ ] **Step 1: Replace the palette, fonts, shadows, and animations in `tailwind.config.ts`**

Replace the entire file with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Festive Craft palette — see design spec
        cream: "#FFF6E6",
        marigold: "#F2A007",
        sun: "#FFD34E",
        flame: { DEFAULT: "#E8540C", dark: "#C24509" },
        rani: { DEFAULT: "#B3186D", dark: "#7A1049" },
        teal: { DEFAULT: "#0E8C8C", dark: "#0A6B6B" },
        ink: "#3A2415",
        spice: "#8A5A2E", // warm secondary text
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        ui: ["var(--font-ui)", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
        sticker: "5px 5px 0 rgba(58,36,21,0.9)",
        "sticker-rani": "8px 9px 0 #B3186D",
        "offset-rani": "3.5px 3.5px 0 #B3186D",
        "offset-marigold": "3px 3px 0 rgba(242,160,7,0.45)",
      },
      keyframes: {
        sway: {
          "0%,100%": { transform: "rotate(-0.4deg)" },
          "50%": { transform: "rotate(0.4deg)" },
        },
      },
      animation: {
        sway: "sway 5s ease-in-out infinite",
        "spin-slow": "spin 24s linear infinite",
        "spin-slow-reverse": "spin 24s linear infinite reverse",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update `globals.css` — cream background, body font, painted-shadow and texture utilities**

Replace the entire file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  background: #fff6e6;
  color: #3a2415;
}

body {
  font-family: var(--font-body), system-ui, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  /* hand-painted sun drop shadow for display headlines */
  .text-painted {
    text-shadow: 2.5px 2.5px 0 #ffd34e;
  }
  /* faint diya/paisley block-print texture */
  .bg-texture {
    background-image: url("data:image/svg+xml,%3Csvg width='90' height='90' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E8540C' stroke-opacity='0.05' stroke-width='1.2'%3E%3Cpath d='M45 14 C54 23 58 30 45 43 C32 30 36 23 45 14 Z'/%3E%3Ccircle cx='45' cy='68' r='5'/%3E%3Ccircle cx='10' cy='45' r='3'/%3E%3Ccircle cx='80' cy='45' r='3'/%3E%3C/g%3E%3C/svg%3E");
  }
}
```

- [ ] **Step 3: Create `src/components/layout/Bunting.tsx`**

```tsx
const FLAG_COLORS = ["bg-flame", "bg-sun", "bg-rani", "bg-teal"];

export default function Bunting() {
  return (
    <div aria-hidden className="flex origin-top motion-safe:animate-sway">
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className={`h-5 flex-1 ${FLAG_COLORS[i % FLAG_COLORS.length]}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/Toran.tsx`** (scalloped garland divider; `src/components/ui/` is a new directory)

```tsx
const BEAD_COLORS = ["bg-marigold", "bg-flame", "bg-rani", "bg-teal"];

export default function Toran({ count = 9 }: { count?: number }) {
  return (
    <div aria-hidden className="flex justify-center gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-5 rounded-b-full ${BEAD_COLORS[i % BEAD_COLORS.length]}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Swap fonts and add Bunting in `src/app/layout.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { Yatra_One, Baloo_2, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Bunting from "@/components/layout/Bunting";

const yatraOne = Yatra_One({
  weight: "400",
  subsets: ["latin", "devanagari"],
  variable: "--font-display",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-ui",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ApnaGhar — Rent & Buy Property in India",
  description:
    "Find your perfect home. Browse verified properties to rent or buy across major Indian cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${yatraOne.variable} ${baloo2.variable} ${workSans.variable} bg-texture antialiased`}
      >
        <Bunting />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

Note: the old `localFont` import and `geistSans` are gone. The files `src/app/fonts/GeistVF.woff` / `GeistMonoVF.woff` become unused — delete them:

```bash
rm "apna-ghar-frontend/src/app/fonts/GeistVF.woff" "apna-ghar-frontend/src/app/fonts/GeistMonoVF.woff"
rmdir "apna-ghar-frontend/src/app/fonts"
```

- [ ] **Step 6: Verify lint + build pass**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both succeed. (Old `brand-*`/`accent-*` classes still in components are simply no longer generated by Tailwind — that's expected until Tasks 2–9; pages will look temporarily unstyled in those spots, which is fine.) Google Fonts are fetched at build time, so network access is required.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Festive Craft design tokens, fonts, Bunting and Toran primitives"
```

---

### Task 2: Navbar restyle

**Files:**
- Modify: `apna-ghar-frontend/src/components/layout/Navbar.tsx` (whole file)

- [ ] **Step 1: Replace `Navbar.tsx` with the festive version**

```tsx
import Link from "next/link";
import { Heart, Plus } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-marigold/60 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span lang="hi" className="font-display text-2xl text-flame text-painted">
            अपना घर
          </span>
          <span className="mt-0.5 font-ui text-[11px] font-bold tracking-widest text-spice">
            APNAGHAR
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/properties?type=buy"
            className="rounded-full px-4 py-2 font-ui text-sm font-semibold text-spice hover:bg-sun/30 hover:text-ink"
          >
            Buy
          </Link>
          <Link
            href="/properties?type=rent"
            className="rounded-full px-4 py-2 font-ui text-sm font-semibold text-spice hover:bg-sun/30 hover:text-ink"
          >
            Rent
          </Link>
          <Link
            href="/properties"
            className="rounded-full px-4 py-2 font-ui text-sm font-semibold text-spice hover:bg-sun/30 hover:text-ink"
          >
            All Properties
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-spice hover:bg-sun/30 hover:text-rani sm:flex"
            aria-label="Saved properties"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/dashboard/add-property"
            className="hidden items-center gap-1.5 rounded-full bg-teal px-4 py-2 font-ui text-sm font-bold text-white shadow-offset-rani transition hover:-translate-y-0.5 sm:flex"
          >
            <Plus className="h-4 w-4" />
            List Property
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-flame px-4 py-2 font-ui text-sm font-bold text-white transition hover:bg-rani"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
```

(The `Home` lucide icon import is gone — the Devanagari wordmark is the logo now.)

- [ ] **Step 2: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apna-ghar-frontend/src/components/layout/Navbar.tsx
git commit -m "feat: restyle Navbar in Festive Craft (Yatra One wordmark, teal CTA pill)"
```

---

### Task 3: Footer restyle

**Files:**
- Modify: `apna-ghar-frontend/src/components/layout/Footer.tsx` (whole file)

- [ ] **Step 1: Replace `Footer.tsx` with the ink-dark festive version**

```tsx
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/mock-data";
import Toran from "@/components/ui/Toran";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink">
      <div className="pt-1">
        <Toran count={28} />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex flex-col leading-none">
              <span lang="hi" className="font-display text-2xl text-sun">
                अपना घर
              </span>
              <span lang="hi" className="mt-1.5 font-ui text-[11px] font-semibold text-marigold">
                आपके सपनों का पता
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Find your perfect home to rent or buy. Verified, Vāstu-checked
              listings from trusted owners — with zero brokerage hassle.
            </p>
          </div>

          <div>
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-sun">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              <li><Link href="/properties?type=buy" className="hover:text-sun">Buy a Property</Link></li>
              <li><Link href="/properties?type=rent" className="hover:text-sun">Rent a Property</Link></li>
              <li><Link href="/dashboard/add-property" className="hover:text-sun">List Your Property</Link></li>
              <li><Link href="/properties" className="hover:text-sun">All Listings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-sun">
              Popular Cities
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link href={`/properties?city=${city}`} className="hover:text-sun">
                    Property in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-sun">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-marigold" /> hello@apnaghar.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-marigold" /> +91 1800 200 300
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-marigold" /> Bengaluru, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-cream/15 pt-6 text-center text-sm text-cream/50">
          © {new Date().getFullYear()} ApnaGhar. All rights reserved. This is a
          UI prototype.
        </div>
      </div>
    </footer>
  );
}
```

(The `Home` lucide icon import is gone.)

- [ ] **Step 2: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apna-ghar-frontend/src/components/layout/Footer.tsx
git commit -m "feat: restyle Footer in Festive Craft (ink background, toran edge)"
```

---

### Task 4: PropertyCard sticker restyle

**Files:**
- Modify: `apna-ghar-frontend/src/components/properties/PropertyCard.tsx` (whole file)

This component is shared — `/properties` and `/properties/[id]` (similar properties) inherit this restyle automatically.

- [ ] **Step 1: Replace `PropertyCard.tsx` with the sticker-style version**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Heart, Star, Flame } from "lucide-react";
import type { Property } from "@/types/property";
import { formatPrice, formatArea, postedLabel } from "@/lib/utils";

export default function PropertyCard({ property }: { property: Property }) {
  const isRent = property.listingType === "rent";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-sticker transition motion-safe:hover:-translate-y-1.5 hover:border-rani hover:shadow-sticker-rani"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 motion-safe:group-hover:scale-105"
        />
        <div className="absolute left-0 top-3 flex gap-2">
          <span
            className={
              "px-4 py-1 font-ui text-xs font-bold uppercase tracking-wide text-white " +
              (isRent ? "bg-teal" : "bg-rani")
            }
            style={{
              clipPath:
                "polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%)",
            }}
          >
            {isRent ? "For Rent" : "For Sale"}
          </span>
          {property.isFeatured && (
            <span className="flex items-center gap-1 rounded-md bg-marigold px-2.5 py-1 font-ui text-xs font-bold text-ink">
              <Star className="h-3 w-3 fill-ink" /> Featured
            </span>
          )}
        </div>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-spice transition hover:bg-white hover:text-rani">
          <Heart className="h-4 w-4" />
        </span>
        {property.vastuCompliant && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 font-ui text-[11px] font-bold text-teal shadow-sm">
            <Flame className="h-3 w-3 text-flame" />
            Vāstu Compliant
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-xl text-flame">
            {formatPrice(property.price, property.listingType)}
          </p>
          <span className="rounded-full bg-sun/40 px-2.5 py-0.5 font-ui text-xs font-semibold text-spice">
            {property.propertyType}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 font-ui font-bold text-ink">
          {property.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-spice">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.locality}, {property.city}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-4 border-t-2 border-dotted border-sun pt-3 text-sm text-spice">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-marigold" />
              {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-marigold" />
              {property.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-marigold" />
            {formatArea(property.areaSqft)}
          </span>
        </div>

        <p className="mt-3 text-xs text-spice/70">
          {postedLabel(property.postedDaysAgo)} · {property.owner.type}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apna-ghar-frontend/src/components/properties/PropertyCard.tsx
git commit -m "feat: restyle PropertyCard as Festive Craft sticker card"
```

---

### Task 5: New Hero component

**Files:**
- Create: `apna-ghar-frontend/src/components/home/Hero.tsx`

(`HeroSlider.tsx` is deleted in Task 8, after `page.tsx` stops importing it — deleting it now would break the build.)

- [ ] **Step 1: Create `src/components/home/Hero.tsx`** (server component, CSS-only animation)

```tsx
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-14">
      <div>
        <span className="inline-block -rotate-2 rounded-full bg-rani px-4 py-1.5 font-ui text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_#F2A007]">
          Sapno ka ghar, yahin milega
        </span>
        <h1 className="mt-5 font-display text-5xl leading-tight text-rani text-painted sm:text-6xl">
          Ghar dhoondna,
          <br />
          ab <span className="text-flame">tyohaar</span> jaisa!
        </h1>
        <p className="mt-4 max-w-md font-ui text-lg text-spice">
          From sea-facing flats in Mumbai to garden homes in Jaipur — house
          hunting that feels like festival shopping.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href="/properties"
            className="rounded-full bg-flame px-8 py-3.5 font-ui text-base font-bold text-white shadow-offset-rani transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Shuru Karein →
          </Link>
          <Link
            href="/properties"
            className="border-b-[3px] border-dashed border-marigold pb-0.5 font-ui text-sm font-bold text-teal"
          >
            How it works
          </Link>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div
          aria-hidden
          className="absolute -bottom-3 -right-3 left-3 top-3 rounded-xl border-[2.5px] border-dashed border-marigold"
        />
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
          alt="A beautiful modern Indian home with a garden"
          width={800}
          height={640}
          priority
          className="relative rounded-xl border-4 border-white object-cover shadow-[8px_8px_0_rgba(179,24,109,0.35)]"
        />
        <div
          aria-hidden
          className="absolute -right-5 -top-7 flex h-24 w-24 items-center justify-center rounded-full shadow-lg motion-safe:animate-spin-slow"
          style={{
            background:
              "repeating-conic-gradient(#E8540C 0 15deg, #FFD34E 15deg 30deg, #B3186D 30deg 45deg, #0E8C8C 45deg 60deg)",
          }}
        >
          <span
            lang="hi"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-cream font-display text-sm text-flame motion-safe:animate-spin-slow-reverse"
          >
            अपना घर
          </span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass (Hero is not yet imported anywhere; that's fine).

- [ ] **Step 3: Commit**

```bash
git add apna-ghar-frontend/src/components/home/Hero.tsx
git commit -m "feat: add Festive Craft Hero with rangoli stamp"
```

---

### Task 6: HeroSearch pill restyle (markup only — logic untouched)

**Files:**
- Modify: `apna-ghar-frontend/src/components/home/HeroSearch.tsx` (whole file)

**IMPORTANT:** `handleSearch`, the `useState` hooks, and the router push must remain byte-for-byte identical. Only JSX classes and the button label change.

- [ ] **Step 1: Replace `HeroSearch.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Plot", "Commercial"];

export default function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<"buy" | "rent">("buy");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");

  function handleSearch() {
    const params = new URLSearchParams({ type: tab });
    if (city.trim()) params.set("city", city.trim());
    if (propertyType) params.set("propertyType", propertyType);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-3xl border-2 border-marigold bg-white p-2 shadow-offset-marigold">
      <div className="flex gap-1 p-2">
        {(["buy", "rent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-full px-5 py-2 font-ui text-sm font-bold capitalize transition " +
              (tab === t
                ? "bg-rani text-white"
                : "text-spice hover:bg-sun/30")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full border-2 border-dotted border-sun px-4">
          <MapPin className="h-5 w-5 shrink-0 text-marigold" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter city or locality"
            className="w-full bg-transparent py-3 font-ui text-sm text-ink outline-none placeholder:text-spice/60"
          />
        </div>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-full border-2 border-dotted border-sun bg-white px-4 py-3 font-ui text-sm text-spice outline-none sm:w-44"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {pt}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-full bg-flame px-7 py-3 font-ui text-sm font-bold text-white transition hover:bg-rani"
        >
          <Search className="h-4 w-4" />
          Khoj!
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apna-ghar-frontend/src/components/home/HeroSearch.tsx
git commit -m "feat: restyle HeroSearch as festive pill (logic unchanged)"
```

---

### Task 7: New CityChips and BrandStory sections

**Files:**
- Create: `apna-ghar-frontend/src/components/home/CityChips.tsx`
- Create: `apna-ghar-frontend/src/components/home/BrandStory.tsx`

- [ ] **Step 1: Create `src/components/home/CityChips.tsx`**

```tsx
import Link from "next/link";
import { POPULAR_CITIES } from "@/lib/mock-data";
import Toran from "@/components/ui/Toran";

const CHIP_STYLES = [
  "bg-flame text-white",
  "bg-rani text-white",
  "bg-teal text-white",
  "bg-marigold text-ink",
];

export default function CityChips() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
      <Toran />
      <h2 className="mt-4 font-display text-3xl text-rani text-painted sm:text-4xl">
        Apne Sheher Mein Dhoondo
      </h2>
      <p className="mt-1 font-ui text-spice">Explore homes city by city</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3.5">
        {POPULAR_CITIES.map((city, i) => (
          <Link
            key={city}
            href={`/properties?city=${city}`}
            className={`rounded-full px-7 py-3 font-ui text-base font-bold transition motion-safe:hover:-translate-y-1 motion-safe:hover:-rotate-1 ${
              CHIP_STYLES[i % CHIP_STYLES.length]
            }`}
          >
            {city}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/BrandStory.tsx`**

```tsx
import { ShieldCheck, HeartHandshake, Wallet } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    color: "bg-teal",
    title: "Verified listings",
    text: "Har ghar checked — no surprises on visit day.",
  },
  {
    icon: HeartHandshake,
    color: "bg-flame",
    title: "No brokerage drama",
    text: "Seedhi baat with owners — zero middlemen.",
  },
  {
    icon: Wallet,
    color: "bg-rani",
    title: "Har budget ke liye",
    text: "₹10K rent se ₹10Cr villas tak — sab kuch.",
  },
];

export default function BrandStory() {
  return (
    <section className="bg-gradient-to-b from-marigold/15 to-rani/10 py-14">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl text-ink">Ghar jaisa bharosa</h2>
        <p className="mt-1 font-ui text-spice">
          Why home-hunters trust ApnaGhar
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border-2 border-dashed border-marigold bg-white p-7"
            >
              <span
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white ${p.color}`}
              >
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-ui text-lg font-bold text-ink">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm text-spice">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apna-ghar-frontend/src/components/home/CityChips.tsx apna-ghar-frontend/src/components/home/BrandStory.tsx
git commit -m "feat: add CityChips and BrandStory home sections"
```

---

### Task 8: Home page assembly + delete HeroSlider

**Files:**
- Modify: `apna-ghar-frontend/src/app/page.tsx` (whole file)
- Delete: `apna-ghar-frontend/src/components/home/HeroSlider.tsx`

The old page sections (stats strip, "Browse by Property Type", "How ApnaGhar Works", bottom CTA) are intentionally removed per the approved spec — BrandStory and the Navbar/Footer CTAs replace their roles.

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/Hero";
import HeroSearch from "@/components/home/HeroSearch";
import CityChips from "@/components/home/CityChips";
import BrandStory from "@/components/home/BrandStory";
import PropertyCard from "@/components/properties/PropertyCard";
import Toran from "@/components/ui/Toran";
import { getFeaturedProperties } from "@/lib/mock-data";

export default function HomePage() {
  const featured = getFeaturedProperties();

  return (
    <div>
      <Hero />

      {/* Search pill overlapping the hero's bottom edge */}
      <div className="mx-auto -mt-10 flex max-w-7xl justify-center px-4 sm:px-6">
        <HeroSearch />
      </div>

      {/* Featured homes */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-16 text-center sm:px-6">
        <Toran />
        <h2 className="mt-4 font-display text-3xl text-flame text-painted sm:text-4xl">
          Featured Homes
        </h2>
        <p className="mt-1 font-ui text-spice">
          Haath se chune hue — handpicked for you
        </p>
        <div className="mt-8 rounded-3xl bg-gradient-to-b from-marigold/15 to-rani/10 p-6 sm:p-8">
          <div className="grid gap-7 text-left sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
        <Link
          href="/properties"
          className="mt-8 inline-flex items-center gap-1.5 border-b-[3px] border-dashed border-marigold pb-0.5 font-ui text-sm font-bold text-teal"
        >
          View all properties <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <CityChips />
      <BrandStory />
    </div>
  );
}
```

- [ ] **Step 2: Delete the slider and confirm nothing references it**

```bash
rm "apna-ghar-frontend/src/components/home/HeroSlider.tsx"
grep -rn "HeroSlider" "apna-ghar-frontend/src"
```

Expected: grep returns no matches.

- [ ] **Step 3: Verify**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: assemble Festive Craft home page, remove HeroSlider"
```

---

### Task 9: Token sweep on properties pages (class swaps only — no structural changes)

**Files:**
- Modify: `apna-ghar-frontend/src/app/properties/page.tsx`
- Modify: `apna-ghar-frontend/src/app/properties/[id]/page.tsx`
- Modify: `apna-ghar-frontend/src/components/properties/SearchFilters.tsx`
- Modify: `apna-ghar-frontend/src/components/properties/PropertyGallery.tsx`

These four files still reference the removed `brand-*`/`accent-*` tokens. Swap each occurrence per the mapping below. Do NOT change any markup, logic, or layout — only the color portion of class strings. Neutral `slate-*` classes stay as they are.

**Mapping (old → new):**

| Old class fragment | New class fragment |
|---|---|
| `brand-50` | `cream` |
| `brand-100` | `sun/30` |
| `brand-200`, `brand-300`, `brand-400` | `marigold` |
| `brand-500`, `brand-600` | `flame` |
| `brand-700`, `brand-800`, `brand-900` | `flame-dark` |
| `accent-50`, `accent-100` | `teal/10` |
| `accent-200` … `accent-500` | `teal` |
| `accent-600` | `teal` |
| `accent-700`, `accent-800`, `accent-900` | `teal-dark` |

Examples: `bg-brand-600` → `bg-flame`; `hover:bg-brand-700` → `hover:bg-flame-dark`; `text-accent-700` → `text-teal-dark`; `border-brand-300` → `border-marigold`; `bg-brand-50` → `bg-cream`.

- [ ] **Step 1: Find every occurrence**

```bash
grep -rn "brand-\|accent-" "apna-ghar-frontend/src"
```

Expected: matches only in the four files above (Tasks 2–8 already cleaned the rest).

- [ ] **Step 2: Apply the mapping in all four files**

Open each file and replace each occurrence per the table. Apply higher-number variants first (`brand-700` before `brand-50`) so prefixes aren't partially replaced.

- [ ] **Step 3: Verify no old tokens remain anywhere**

```bash
grep -rn "brand-\|accent-" "apna-ghar-frontend/src"
```

Expected: no matches at all.

- [ ] **Step 4: Verify lint + build**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass; build reports all 9 `/properties/[id]` pages generated.

- [ ] **Step 5: Commit**

```bash
git add apna-ghar-frontend/src
git commit -m "refactor: sweep brand-/accent- tokens to Festive Craft palette on properties pages"
```

---

### Task 10: Final verification (visual + functional)

**Files:** none modified — verification only.

- [ ] **Step 1: Full lint + build**

```bash
npm run lint --prefix apna-ghar-frontend
npm run build --prefix apna-ghar-frontend
```

Expected: both pass cleanly.

- [ ] **Step 2: Run the dev server and check all three pages**

```bash
npm run dev --prefix apna-ghar-frontend
```

Visit and verify against `.superpowers/brainstorm/3380-1781299283/content/blend-mockup-v2.html`:

1. `http://localhost:3000/` — bunting at top, Yatra One headline with sun shadow, spinning rangoli stamp on the hero image, search pill overlapping hero, toran dividers, sticker cards, saturated city chips, BrandStory band, ink footer with toran edge.
2. `http://localhost:3000/properties` — layout unchanged; sticker PropertyCards, festive accents on filters/buttons, no stray default-styled (token-less) elements.
3. Any detail page, e.g. `http://localhost:3000/properties/1` — layout unchanged; festive accents; similar-properties cards are sticker style.

- [ ] **Step 3: Functional checks**

1. Home search pill: pick "rent", type "Mumbai", click "Khoj!" → lands on `/properties?type=rent&city=Mumbai` with filters pre-applied.
2. City chip "Pune" → `/properties?city=Pune` filters to Pune listings.
3. Mobile width (~375px, browser devtools): hero stacks vertically, search pill fields stack, card grid is single-column, bunting still spans the width.
4. Reduced motion (devtools → Rendering → emulate `prefers-reduced-motion: reduce`): rangoli stamp does not spin, bunting does not sway, card hover does not lift.

- [ ] **Step 4: Fix anything found, then final commit if changes were needed**

```bash
git add -A
git commit -m "fix: visual polish from final verification pass"
```

(Skip the commit if Step 3 needed no changes.)

---

## Self-Review Notes (already applied)

- **Spec coverage:** palette/fonts/ornaments → Task 1; Navbar → Task 2; Footer → Task 3; PropertyCard → Task 4; Hero (replaces slider) → Tasks 5+8; search pill → Task 6; CityChips + BrandStory → Task 7; page assembly → Task 8; token sweep on properties pages → Task 9; edge cases (reduced motion, mobile, Devanagari) and verification → Tasks 1–10 (`motion-safe:` variants used in Bunting, Hero, PropertyCard, CityChips) and Task 10 checks.
- **Ordering constraint:** `HeroSlider.tsx` deletion deliberately happens in Task 8, not Task 5, so the build never breaks between tasks.
- **Type consistency:** component names used in Task 8 imports (`Hero`, `HeroSearch`, `CityChips`, `BrandStory`, `PropertyCard`, `Toran`) match the files created in Tasks 1, 5, 6, 7.
- **Known acceptable deviation:** the old home sections (stats, property-type grid, how-it-works, CTA) are removed per the approved spec structure; their CTA role lives in the Navbar "List Property" pill and Footer links.
