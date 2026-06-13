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
