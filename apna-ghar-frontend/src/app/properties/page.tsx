"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, SearchX } from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import SearchFilters, {
  type Filters,
  defaultFilters,
} from "@/components/properties/SearchFilters";
import { properties } from "@/lib/mock-data";
import type { PropertyType } from "@/types/property";

type SortKey = "newest" | "price_asc" | "price_desc";

function PropertiesContent() {
  const searchParams = useSearchParams();

  const initialFilters = useMemo<Filters>(() => {
    const type = searchParams.get("type");
    const city = searchParams.get("city") ?? "";
    const propertyType = searchParams.get("propertyType");
    return {
      ...defaultFilters,
      listingType:
        type === "rent" || type === "buy" ? type : defaultFilters.listingType,
      city,
      propertyTypes: propertyType
        ? [propertyType as PropertyType]
        : defaultFilters.propertyTypes,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sort, setSort] = useState<SortKey>("newest");

  const results = useMemo(() => {
    const min = filters.minPrice ? Number(filters.minPrice) : null;
    const max = filters.maxPrice ? Number(filters.maxPrice) : null;

    const filtered = properties.filter((p) => {
      if (filters.listingType !== "all" && p.listingType !== filters.listingType)
        return false;
      if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase())
        return false;
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(p.propertyType)
      )
        return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      if (filters.bedrooms > 0 && p.bedrooms < filters.bedrooms) return false;
      if (filters.furnishedOnly && !p.isFurnished) return false;
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => p.amenities.includes(a))
      )
        return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return a.postedDaysAgo - b.postedDaysAgo;
    });
  }, [filters, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="font-ui text-sm text-spice/70">
        <Link href="/" className="hover:text-flame">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-spice">Properties</span>
      </nav>

      <h1 className="mt-2 font-display text-3xl text-rani text-painted">
        Properties for{" "}
        {filters.listingType === "all"
          ? "Sale & Rent"
          : filters.listingType === "buy"
            ? "Sale"
            : "Rent"}
        {filters.city ? ` in ${filters.city}` : ""}
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <SearchFilters filters={filters} setFilters={setFilters} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between rounded-lg border-2 border-ink bg-white px-4 py-3 shadow-sticker">
            <p className="flex items-center gap-2 font-ui text-sm text-spice">
              <SlidersHorizontal className="h-4 w-4 text-marigold" />
              <span className="font-bold text-ink">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "property" : "properties"} found
            </p>
            <label className="flex items-center gap-2 font-ui text-sm text-spice">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-marigold/40 px-2 py-1.5 text-sm outline-none focus:border-flame"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-marigold bg-white py-20 text-center">
              <SearchX className="h-10 w-10 text-marigold/50" />
              <p className="mt-3 font-ui font-bold text-ink">
                No properties match your filters
              </p>
              <p className="mt-1 font-ui text-sm text-spice/70">
                Try widening your search or resetting the filters.
              </p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="mt-4 rounded-full bg-flame px-6 py-2.5 font-ui text-sm font-bold text-white transition hover:bg-flame-dark"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 text-center font-ui text-spice/60">
          Loading properties…
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
