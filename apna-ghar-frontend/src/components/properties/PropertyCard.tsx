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
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={
              "rounded-md px-2.5 py-1 text-xs font-semibold text-white " +
              (isRent ? "bg-accent-600" : "bg-brand-600")
            }
          >
            {isRent ? "For Rent" : "For Sale"}
          </span>
          {property.isFeatured && (
            <span className="flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
              <Star className="h-3 w-3 fill-white" /> Featured
            </span>
          )}
        </div>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 transition hover:bg-white hover:text-rose-500">
          <Heart className="h-4 w-4" />
        </span>
        {property.vastuCompliant && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-accent-700 shadow-sm">
            <Flame className="h-3 w-3 text-brand-500" />
            Vāstu Compliant
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-brand-700">
            {formatPrice(property.price, property.listingType)}
          </p>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {property.propertyType}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 font-semibold text-slate-900">
          {property.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.locality}, {property.city}
          </span>
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-slate-400" />
              {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-slate-400" />
              {property.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4 text-slate-400" />
            {formatArea(property.areaSqft)}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          {postedLabel(property.postedDaysAgo)} · {property.owner.type}
        </p>
      </div>
    </Link>
  );
}
