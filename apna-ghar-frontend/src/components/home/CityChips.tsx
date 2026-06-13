import Link from "next/link";
import { POPULAR_CITIES } from "@/lib/mock-data";
import Toran from "@/components/ui/Toran";

const CHIP_COLORS = [
  "bg-flame text-white hover:bg-flame-dark",
  "bg-rani text-white hover:bg-rani-dark",
  "bg-teal text-white hover:bg-teal-dark",
  "bg-marigold text-ink hover:bg-sun",
];

export default function CityChips() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Toran />
      <h2 className="mt-6 text-center font-display text-3xl text-rani text-painted sm:text-4xl">
        Apne Sheher Mein Dhoondo
      </h2>
      <p className="mt-2 text-center font-ui text-spice">
        Pick your city — every gali, har mohalla covered.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {POPULAR_CITIES.map((city, i) => (
          <Link
            key={city}
            href={`/properties?city=${city}`}
            className={`rounded-full px-6 py-2.5 font-ui text-sm font-bold shadow-offset-marigold transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${
              CHIP_COLORS[i % CHIP_COLORS.length]
            }`}
          >
            {city}
          </Link>
        ))}
      </div>
    </section>
  );
}
