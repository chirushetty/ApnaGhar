import Link from "next/link";
import { Home, Heart, Plus } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Apna<span className="text-brand-600">Ghar</span>
            </span>
            <span lang="hi" className="mt-0.5 text-[11px] font-semibold text-brand-600">
              अपना घर
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/properties?type=buy"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Buy
          </Link>
          <Link
            href="/properties?type=rent"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Rent
          </Link>
          <Link
            href="/properties"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            All Properties
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/saved"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 sm:flex"
            aria-label="Saved properties"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/dashboard/add-property"
            className="hidden items-center gap-1.5 rounded-md border border-brand-600 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 sm:flex"
          >
            <Plus className="h-4 w-4" />
            List Property
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
