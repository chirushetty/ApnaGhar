import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-14">
      <div>
        <span className="inline-block -rotate-2 rounded-full bg-rani px-4 py-1.5 font-ui text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_#F2A007]">
          Sapno ka ghar, yahin milega
        </span>
        <h1 className="mt-5 font-display text-5xl leading-tight text-rani text-painted sm:text-6xl">
          Ghar dhoondna,
          <br />
          ab <span className="text-flame">tyohaar</span> jaisa!
        </h1>
        <p className="mt-4 max-w-md font-ui text-lg text-spice">
          From sea-facing flats in Mumbai to garden homes in Jaipur — house
          hunting that feels like festival shopping.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href="/properties"
            className="rounded-full bg-flame px-8 py-3.5 font-ui text-base font-bold text-white shadow-offset-rani transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Shuru Karein →
          </Link>
          <Link
            href="/properties"
            className="border-b-[3px] border-dashed border-marigold pb-0.5 font-ui text-sm font-bold text-teal"
          >
            How it works
          </Link>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div
          aria-hidden
          className="absolute -bottom-3 -right-3 left-3 top-3 rounded-xl border-[2.5px] border-dashed border-marigold"
        />
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
          alt="A beautiful modern Indian home with a garden"
          width={800}
          height={640}
          priority
          className="relative rounded-xl border-4 border-white object-cover shadow-[8px_8px_0_rgba(179,24,109,0.35)]"
        />
        <div
          aria-hidden
          className="absolute -right-5 -top-7 flex h-24 w-24 items-center justify-center rounded-full shadow-lg motion-safe:animate-spin-slow"
          style={{
            background:
              "repeating-conic-gradient(#E8540C 0 15deg, #FFD34E 15deg 30deg, #B3186D 30deg 45deg, #0E8C8C 45deg 60deg)",
          }}
        >
          <span
            lang="hi"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-cream font-display text-sm text-flame motion-safe:animate-spin-slow-reverse"
          >
            अपना घर
          </span>
        </div>
      </div>
    </section>
  );
}
