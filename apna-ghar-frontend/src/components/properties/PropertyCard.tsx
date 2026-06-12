import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, Heart, Star, Flame } from "lucide-react";
import type { Property } from "@/types/property";
import { formatPrice, formatArea, postedLabel } from "@/lib/utils";

export default function PropertyCard({ property }: { property: Property }) {
  const isRent = property.listingType === "rent";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-white shadow-sticker transition motion-safe:hover:-translate-y-1.5 hover:border-rani hover:shadow-sticker-rani"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 motion-safe:group-hover:scale-105"
        />
        <div className="absolute left-0 top-3 flex gap-2">
          <span
            className={
              "px-4 py-1 font-ui text-xs font-bold uppercase tracking-wide text-white " +
              (isRent ? "bg-teal" : "bg-rani")
            }
            style={{
              clipPath:
                "polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%)",
            }}
          >
            {isRent ? "For Rent" : "For Sale"}
          </span>
          {property.isFeatured && (
            <span className="flex items-center gap-1 rounded-md bg-marigold px-2.5 py-1 font-ui text-xs font-bold text-ink">
              <Star className="h-3 w-3 fill-ink" /> Featured
            </span>
          )}
        </div>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-spice transition hover:bg-white hover:text-rani">
          <Heart className="h-4 w-4" />
        </span>
        {property.vastuCompliant && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 font-ui text-[11px] font-bold text-teal shadow-sm">
            <Flame className="h-3 w-3 text-flame" />
            Vāstu Compliant
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-xl text-flame">
            {formatPrice(property.price, property.listingType)}
          </p>
          <span className="rounded-full bg-sun/40 px-2.5 py-0.5 font-ui text-xs font-semibold text-spice">
            {property.propertyType}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 font-ui font-bold text-ink">
          {property.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-spice">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.locality}, {property.city}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-4 border-t-2 border-dotted border-sun pt-3 text-sm text-spice">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-marigold" />
              {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-marigold" />
              {property.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-marigold" />
            {formatArea(property.areaSqft)}
          </span>
        </div>

        <p className="mt-3 text-xs text-spice/70">
          {postedLabel(property.postedDaysAgo)} · {property.owner.type}
        </p>
      </div>
    </Link>
  );
}
