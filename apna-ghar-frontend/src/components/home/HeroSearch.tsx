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
    <div className="w-full max-w-3xl rounded-2xl bg-white p-2 shadow-2xl">
      <div className="flex gap-1 p-2">
        {(["buy", "rent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded-lg px-5 py-2 text-sm font-semibold capitalize transition " +
              (tab === t
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
          <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter city or locality"
            className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none sm:w-44"
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
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}
