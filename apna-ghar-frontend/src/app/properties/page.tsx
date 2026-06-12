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
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Properties</span>
      </nav>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">
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
          <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-900">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "property" : "properties"} found
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
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
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <SearchX className="h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No properties match your filters
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try widening your search or resetting the filters.
              </p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
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
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-400">
          Loading properties…
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
