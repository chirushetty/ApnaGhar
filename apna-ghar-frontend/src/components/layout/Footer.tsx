import Link from "next/link";
import { Home, Mail, Phone, MapPin } from "lucide-react";
import { POPULAR_CITIES } from "@/lib/mock-data";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                <Home className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-xl font-bold text-slate-900">
                  Apna<span className="text-brand-600">Ghar</span>
                </span>
                <span lang="hi" className="mt-0.5 text-[11px] font-semibold text-brand-600">
                  अपना घर · आपके सपनों का पता
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Find your perfect home to rent or buy. Verified, Vāstu-checked
              listings from trusted owners — with zero brokerage hassle.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li><Link href="/properties?type=buy" className="hover:text-brand-600">Buy a Property</Link></li>
              <li><Link href="/properties?type=rent" className="hover:text-brand-600">Rent a Property</Link></li>
              <li><Link href="/dashboard/add-property" className="hover:text-brand-600">List Your Property</Link></li>
              <li><Link href="/properties" className="hover:text-brand-600">All Listings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Popular Cities</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    href={`/properties?city=${city}`}
                    className="hover:text-brand-600"
                  >
                    Property in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Get in Touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-600" /> hello@apnaghar.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-600" /> +91 1800 200 300
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" /> Bengaluru, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ApnaGhar. All rights reserved. This is a
          UI prototype.
        </div>
      </div>
    </footer>
  );
}
