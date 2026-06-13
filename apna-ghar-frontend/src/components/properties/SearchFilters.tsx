"use client";

import { RotateCcw } from "lucide-react";
import type { PropertyType } from "@/types/property";
import { POPULAR_CITIES, ALL_AMENITIES } from "@/lib/mock-data";

export interface Filters {
  listingType: "all" | "rent" | "buy";
  city: string;
  propertyTypes: PropertyType[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number;
  furnishedOnly: boolean;
  amenities: string[];
}

export const defaultFilters: Filters = {
  listingType: "all",
  city: "",
  propertyTypes: [],
  minPrice: "",
  maxPrice: "",
  bedrooms: 0,
  furnishedOnly: false,
  amenities: [],
};

const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "House",
  "Villa",
  "Plot",
  "Commercial",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-sun/40 py-4">
      <h3 className="mb-3 font-ui text-sm font-bold text-ink">{title}</h3>
      {children}
    </div>
  );
}

export default function SearchFilters({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const toggleType = (t: PropertyType) => {
    setFilters({
      ...filters,
      propertyTypes: filters.propertyTypes.includes(t)
        ? filters.propertyTypes.filter((x) => x !== t)
        : [...filters.propertyTypes, t],
    });
  };

  const toggleAmenity = (a: string) => {
    setFilters({
      ...filters,
      amenities: filters.amenities.includes(a)
        ? filters.amenities.filter((x) => x !== a)
        : [...filters.amenities, a],
    });
  };

  return (
    <aside className="rounded-xl border-2 border-ink bg-white p-5 shadow-sticker">
      <div className="flex items-center justify-between">
        <h2 className="font-ui text-base font-bold text-ink">Filters</h2>
        <button
          onClick={() => setFilters(defaultFilters)}
          className="flex items-center gap-1 font-ui text-xs font-bold text-flame hover:text-flame-dark"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <Section title="Listing Type">
        <div className="flex gap-2">
          {(["all", "buy", "rent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, listingType: t })}
              className={
                "flex-1 rounded-md border px-2 py-1.5 font-ui text-xs font-bold capitalize transition " +
                (filters.listingType === t
                  ? "border-flame bg-flame/10 text-flame"
                  : "border-marigold/40 text-spice hover:border-marigold")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="City">
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-full rounded-md border border-marigold/40 px-3 py-2 font-ui text-sm text-spice outline-none focus:border-flame"
        >
          <option value="">All Cities</option>
          {POPULAR_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Property Type">
        <div className="space-y-2">
          {PROPERTY_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 font-ui text-sm text-spice"
            >
              <input
                type="checkbox"
                checked={filters.propertyTypes.includes(t)}
                onChange={() => toggleType(t)}
                className="h-4 w-4 rounded border-marigold/50 text-flame accent-flame"
              />
              {t}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Price Range (₹)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            placeholder="Min"
            className="w-full rounded-md border border-marigold/40 px-2 py-2 text-sm outline-none focus:border-flame"
          />
          <span className="text-spice/60">—</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            placeholder="Max"
            className="w-full rounded-md border border-marigold/40 px-2 py-2 text-sm outline-none focus:border-flame"
          />
        </div>
      </Section>

      <Section title="Bedrooms">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((b) => (
            <button
              key={b}
              onClick={() => setFilters({ ...filters, bedrooms: b })}
              className={
                "flex-1 rounded-md border px-1 py-1.5 font-ui text-xs font-bold transition " +
                (filters.bedrooms === b
                  ? "border-flame bg-flame/10 text-flame"
                  : "border-marigold/40 text-spice hover:border-marigold")
              }
            >
              {b === 0 ? "Any" : `${b}+`}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Amenities">
        <div className="space-y-2">
          {ALL_AMENITIES.slice(0, 6).map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-2 font-ui text-sm text-spice"
            >
              <input
                type="checkbox"
                checked={filters.amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="h-4 w-4 rounded border-marigold/50 accent-flame"
              />
              {a}
            </label>
          ))}
        </div>
      </Section>

      <div className="pt-4">
        <label className="flex cursor-pointer items-center gap-2 font-ui text-sm font-medium text-spice">
          <input
            type="checkbox"
            checked={filters.furnishedOnly}
            onChange={(e) =>
              setFilters({ ...filters, furnishedOnly: e.target.checked })
            }
            className="h-4 w-4 rounded border-marigold/50 accent-flame"
          />
          Furnished only
        </label>
      </div>
    </aside>
  );
}
