import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Sofa,
  Car,
  CheckCircle2,
  Phone,
  CalendarDays,
  Share2,
  Heart,
  Building2,
  Compass,
  Flame,
} from "lucide-react";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyGallery from "@/components/properties/PropertyGallery";
import {
  getPropertyById,
  getSimilarProperties,
  properties,
} from "@/lib/mock-data";
import { formatPrice, formatArea, postedLabel } from "@/lib/utils";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const property = getPropertyById(params.id);
  if (!property) return { title: "Property not found — ApnaGhar" };
  return {
    title: `${property.title} — ApnaGhar`,
    description: property.description.slice(0, 150),
  };
}

export default function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const property = getPropertyById(params.id);
  if (!property) notFound();

  const isRent = property.listingType === "rent";
  const similar = getSimilarProperties(property);

  const specs = [
    property.bedrooms > 0 && {
      icon: Bed,
      label: "Bedrooms",
      value: property.bedrooms,
    },
    property.bathrooms > 0 && {
      icon: Bath,
      label: "Bathrooms",
      value: property.bathrooms,
    },
    { icon: Maximize, label: "Area", value: formatArea(property.areaSqft) },
    { icon: Building2, label: "Type", value: property.propertyType },
    {
      icon: Sofa,
      label: "Furnishing",
      value: property.isFurnished ? "Furnished" : "Unfurnished",
    },
    {
      icon: Car,
      label: "Parking",
      value: property.parkingAvailable ? "Available" : "Not available",
    },
    {
      icon: Compass,
      label: "Vāstu",
      value: property.vastuCompliant ? "Compliant" : "Not specified",
    },
  ].filter(Boolean) as { icon: typeof Bed; label: string; value: string | number }[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/properties" className="hover:text-brand-600">
          Properties
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{property.city}</span>
      </nav>

      {/* Gallery */}
      <div className="mt-4">
        <PropertyGallery
          images={property.images}
          title={property.title}
          isRent={isRent}
          vastuCompliant={property.vastuCompliant}
        />
      </div>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {property.title}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-4 w-4" />
            {property.locality}, {property.city}, {property.state}
          </p>
          {property.vastuCompliant && (
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
              <Flame className="h-3.5 w-3.5 text-brand-500" />
              Vāstu Shastra Compliant
            </span>
          )}
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-extrabold text-brand-700 sm:text-3xl">
            {formatPrice(property.price, property.listingType)}
          </p>
          <div className="mt-2 flex gap-2 sm:justify-end">
            <button className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Heart className="h-4 w-4" /> Save
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2">
          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <s.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Overview</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {property.description}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              {postedLabel(property.postedDaysAgo)}
            </p>
          </section>

          {/* Amenities */}
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">
              Amenities &amp; Features
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  {a}
                </div>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">Location</h2>
            <div className="mt-3 flex h-56 flex-col items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-brand-50 to-slate-100">
              <MapPin className="h-8 w-8 text-brand-600" />
              <p className="mt-2 font-semibold text-slate-700">
                {property.locality}, {property.city}
              </p>
              <p className="text-sm text-slate-400">
                Interactive map will appear here
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar — contact */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:sticky lg:top-20">
            <p className="text-sm text-slate-400">Listed by</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                {property.owner.name.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-slate-900">
                  {property.owner.name}
                </p>
                <p className="text-xs text-slate-500">{property.owner.type}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <input
                type="tel"
                placeholder="Phone number"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <textarea
                rows={3}
                placeholder={`I'm interested in "${property.title}". Please share more details.`}
                className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              <Phone className="h-4 w-4" /> Contact Owner
            </button>
            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              <CalendarDays className="h-4 w-4" /> Schedule a Visit
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              No brokerage · Verified listing
            </p>
          </div>
        </aside>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">
            Similar Properties in {property.city}
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
