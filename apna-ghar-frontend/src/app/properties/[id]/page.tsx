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
      <nav className="font-ui text-sm text-spice/70">
        <Link href="/" className="hover:text-flame">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/properties" className="hover:text-flame">
          Properties
        </Link>
        <span className="mx-2">/</span>
        <span className="text-spice">{property.city}</span>
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
      <div className="mt-6 flex flex-col gap-4 border-b-2 border-dotted border-marigold pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-rani text-painted sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 font-ui text-spice">
            <MapPin className="h-4 w-4 text-marigold" />
            {property.locality}, {property.city}, {property.state}
          </p>
          {property.vastuCompliant && (
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-teal/10 px-2.5 py-1 font-ui text-xs font-bold text-teal">
              <Flame className="h-3.5 w-3.5 text-flame" />
              Vāstu Shastra Compliant
            </span>
          )}
        </div>
        <div className="sm:text-right">
          <p className="font-display text-3xl text-flame sm:text-4xl">
            {formatPrice(property.price, property.listingType)}
          </p>
          <div className="mt-2 flex gap-2 sm:justify-end">
            <button className="flex items-center gap-1.5 rounded-full border border-marigold/40 px-4 py-1.5 font-ui text-sm font-medium text-spice transition hover:bg-sun/20">
              <Heart className="h-4 w-4" /> Save
            </button>
            <button className="flex items-center gap-1.5 rounded-full border border-marigold/40 px-4 py-1.5 font-ui text-sm font-medium text-spice transition hover:bg-sun/20">
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
                className="flex items-center gap-3 rounded-lg border border-marigold/40 bg-white p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sun/30 text-flame">
                  <s.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-ui text-xs text-spice/60">{s.label}</p>
                  <p className="font-ui text-sm font-bold text-ink">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <section className="mt-8">
            <h2 className="font-ui text-lg font-bold text-ink">Overview</h2>
            <p className="mt-3 leading-relaxed text-spice">
              {property.description}
            </p>
            <p className="mt-3 font-ui text-sm text-spice/60">
              {postedLabel(property.postedDaysAgo)}
            </p>
          </section>

          {/* Amenities */}
          <section className="mt-8">
            <h2 className="font-ui text-lg font-bold text-ink">
              Amenities &amp; Features
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 font-ui text-sm text-spice"
                >
                  <CheckCircle2 className="h-4 w-4 text-teal" />
                  {a}
                </div>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="mt-8">
            <h2 className="font-ui text-lg font-bold text-ink">Location</h2>
            <div className="mt-3 flex h-56 flex-col items-center justify-center rounded-xl border border-marigold/40 bg-gradient-to-br from-sun/30 to-marigold/10">
              <MapPin className="h-8 w-8 text-flame" />
              <p className="mt-2 font-ui font-bold text-ink">
                {property.locality}, {property.city}
              </p>
              <p className="font-ui text-sm text-spice/60">
                Interactive map will appear here
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar — contact */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border-2 border-ink bg-white p-5 shadow-sticker lg:sticky lg:top-20">
            <p className="font-ui text-sm text-spice/60">Listed by</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun/40 font-display text-lg text-flame">
                {property.owner.name.charAt(0)}
              </span>
              <div>
                <p className="font-ui font-bold text-ink">
                  {property.owner.name}
                </p>
                <p className="font-ui text-xs text-spice/70">
                  {property.owner.type}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-md border border-marigold/40 px-3 py-2 text-sm outline-none focus:border-flame"
              />
              <input
                type="tel"
                placeholder="Phone number"
                className="w-full rounded-md border border-marigold/40 px-3 py-2 text-sm outline-none focus:border-flame"
              />
              <textarea
                rows={3}
                placeholder={`I'm interested in "${property.title}". Please share more details.`}
                className="w-full resize-none rounded-md border border-marigold/40 px-3 py-2 text-sm outline-none focus:border-flame"
              />
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-flame px-4 py-2.5 font-ui text-sm font-bold text-white transition hover:bg-flame-dark">
              <Phone className="h-4 w-4" /> Contact Owner
            </button>
            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-flame px-4 py-2.5 font-ui text-sm font-bold text-flame transition hover:bg-flame/10">
              <CalendarDays className="h-4 w-4" /> Schedule a Visit
            </button>
            <p className="mt-3 text-center font-ui text-xs text-spice/60">
              No brokerage · Verified listing
            </p>
          </div>
        </aside>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl text-rani text-painted">
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
