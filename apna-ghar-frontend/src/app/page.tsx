import Link from "next/link";
import {
  Search,
  MessageSquare,
  KeyRound,
  Building2,
  Home as HomeIcon,
  Castle,
  Trees,
  Store,
  ArrowRight,
  Flame,
} from "lucide-react";
import HeroSlider from "@/components/home/HeroSlider";
import HeroSearch from "@/components/home/HeroSearch";
import PropertyCard from "@/components/properties/PropertyCard";
import { getFeaturedProperties, POPULAR_CITIES } from "@/lib/mock-data";

const STATS = [
  { value: "12,500+", label: "Active Listings" },
  { value: "8", label: "Cities Covered" },
  { value: "9,000+", label: "Happy Customers" },
  { value: "Zero", label: "Brokerage" },
];

const PROPERTY_TYPES = [
  { name: "Apartment", icon: Building2 },
  { name: "House", icon: HomeIcon },
  { name: "Villa", icon: Castle },
  { name: "Plot", icon: Trees },
  { name: "Commercial", icon: Store },
];

const STEPS = [
  {
    icon: Search,
    title: "Search Properties",
    text: "Browse thousands of verified listings and filter by city, budget, and type.",
  },
  {
    icon: MessageSquare,
    title: "Connect with Owners",
    text: "Contact property owners directly — no middlemen, no brokerage fees.",
  },
  {
    icon: KeyRound,
    title: "Move In",
    text: "Schedule a visit, finalise the deal, and step into your new home.",
  },
];

export default function HomePage() {
  const featured = getFeaturedProperties();

  return (
    <div>
      {/* Hero */}
      <HeroSlider>
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:py-32">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-orange-100 backdrop-blur">
            <Flame className="h-4 w-4 text-brand-400" />
            <span lang="hi">आपके सपनों का घर</span> · Your dream home awaits
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ghar Dhoondhna, Ab Hua Aasaan
          </h1>
          <p className="mt-4 max-w-xl text-balance text-lg text-slate-200">
            Verified, Vāstu-checked homes to rent or buy across India —
            connect directly with owners and pay zero brokerage.
          </p>
          <div className="mt-8 flex w-full justify-center">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-200">
            <span>Popular:</span>
            {POPULAR_CITIES.slice(0, 5).map((city) => (
              <Link
                key={city}
                href={`/properties?city=${city}`}
                className="rounded-full border border-white/30 px-3 py-1 hover:bg-white/10"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </HeroSlider>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-brand-600 sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Property types */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Browse by Property Type
        </h2>
        <p className="mt-1 text-slate-500">
          Explore the kind of space that fits your needs.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PROPERTY_TYPES.map((t) => (
            <Link
              key={t.name}
              href={`/properties?propertyType=${t.name}`}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <t.icon className="h-6 w-6" />
              </span>
              <span className="font-semibold text-slate-800">{t.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Properties
            </h2>
            <p className="mt-1 text-slate-500">
              Hand-picked listings you shouldn&apos;t miss.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            How ApnaGhar Works
          </h2>
          <p className="mt-1 text-center text-slate-500">
            Three simple steps to your next home.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-accent-600">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-brand-700 px-8 py-12 text-center sm:py-16">
          <h2 className="text-balance text-2xl font-bold text-white sm:text-3xl">
            Have a property to rent or sell?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-balance text-brand-100">
            List your property on ApnaGhar for free and reach thousands of
            verified buyers and tenants.
          </p>
          <Link
            href="/dashboard/add-property"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            List Your Property <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
