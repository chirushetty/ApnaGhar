import Link from "next/link";
import { Heart, Plus } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-marigold/60 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span lang="hi" className="font-display text-2xl text-flame text-painted">
            अपना घर
          </span>
          <span className="mt-0.5 font-ui text-[11px] font-bold tracking-widest text-spice">
            APNAGHAR
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/properties?type=buy"
            className="rounded-full px-4 py-2 font-ui text-sm font-semibold text-spice hover:bg-sun/30 hover:text-ink"
          >
            Buy
          </Link>
          <Link
            href="/properties?type=rent"
            className="rounded-full px-4 py-2 font-ui text-sm font-semibold text-spice hover:bg-sun/30 hover:text-ink"
          >
            Rent
          </Link>
          <Link
            href="/properties"
            className="rounded-full px-4 py-2 font-ui text-sm font-semibold text-spice hover:bg-sun/30 hover:text-ink"
          >
            All Properties
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-spice hover:bg-sun/30 hover:text-rani sm:flex"
            aria-label="Saved properties"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/dashboard/add-property"
            className="hidden items-center gap-1.5 rounded-full bg-teal px-4 py-2 font-ui text-sm font-bold text-white shadow-offset-rani transition hover:-translate-y-0.5 sm:flex"
          >
            <Plus className="h-4 w-4" />
            List Property
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-flame px-4 py-2 font-ui text-sm font-bold text-white transition hover:bg-rani"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
