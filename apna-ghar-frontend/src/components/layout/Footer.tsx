import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/mock-data";
import Toran from "@/components/ui/Toran";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink">
      <div className="pt-1">
        <Toran count={28} />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex flex-col leading-none">
              <span lang="hi" className="font-display text-2xl text-sun">
                अपना घर
              </span>
              <span lang="hi" className="mt-1.5 font-ui text-[11px] font-semibold text-marigold">
                आपके सपनों का पता
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Find your perfect home to rent or buy. Verified, Vāstu-checked
              listings from trusted owners — with zero brokerage hassle.
            </p>
          </div>

          <div>
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-sun">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              <li><Link href="/properties?type=buy" className="hover:text-sun">Buy a Property</Link></li>
              <li><Link href="/properties?type=rent" className="hover:text-sun">Rent a Property</Link></li>
              <li><Link href="/dashboard/add-property" className="hover:text-sun">List Your Property</Link></li>
              <li><Link href="/properties" className="hover:text-sun">All Listings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-sun">
              Popular Cities
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link href={`/properties?city=${city}`} className="hover:text-sun">
                    Property in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-ui text-sm font-bold uppercase tracking-wider text-sun">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-marigold" /> hello@apnaghar.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-marigold" /> +91 1800 200 300
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-marigold" /> Bengaluru, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-cream/15 pt-6 text-center text-sm text-cream/50">
          © {new Date().getFullYear()} ApnaGhar. All rights reserved. This is a
          UI prototype.
        </div>
      </div>
    </footer>
  );
}
