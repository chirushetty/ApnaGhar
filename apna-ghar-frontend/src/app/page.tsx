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

      {/* Search pill — overlaps the hero's bottom edge */}
      <div className="relative z-10 -mt-10 mb-4 flex justify-center px-4">
        <HeroSearch />
      </div>

      {/* Featured Homes */}
      <section className="mt-10 bg-gradient-to-b from-marigold/15 to-rani/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Toran />
          <h2 className="mt-6 text-center font-display text-3xl text-rani text-painted sm:text-4xl">
            Aaj ke Chuninda Ghar
          </h2>
          <p className="mt-2 text-center font-ui text-spice">
            Haath se chune hue — handpicked for you.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-full bg-flame px-8 py-3.5 font-ui text-base font-bold text-white shadow-offset-rani transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              Saare ghar dekho <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explore by City */}
      <CityChips />

      {/* Brand story */}
      <BrandStory />
    </div>
  );
}
