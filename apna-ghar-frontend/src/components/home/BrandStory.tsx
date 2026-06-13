import { ShieldCheck, Handshake, Wallet } from "lucide-react";
import Toran from "@/components/ui/Toran";

const PILLARS = [
  {
    icon: ShieldCheck,
    color: "text-teal",
    title: "Verified listings",
    tagline: "har ghar checked",
    text: "Every home is vetted before it goes live — no fake photos, no ghost flats.",
  },
  {
    icon: Handshake,
    color: "text-rani",
    title: "No brokerage drama",
    tagline: "seedhi baat",
    text: "Talk to owners directly. Zero brokerage, zero middleman games.",
  },
  {
    icon: Wallet,
    color: "text-flame",
    title: "Har budget",
    tagline: "₹10K rent se ₹10Cr tak",
    text: "From a cosy 1BHK to a sea-facing villa — something for every wallet.",
  },
];

export default function BrandStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Toran />
      <h2 className="mt-6 text-center font-display text-3xl text-rani text-painted sm:text-4xl">
        Ghar jaisa bharosa
      </h2>
      <p className="mt-2 text-center font-ui text-spice">
        Why thousands of families ApnaGhar pe bharosa karte hain.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border-[2.5px] border-dashed border-marigold bg-white p-6 text-center"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun/30">
              <p.icon className={`h-7 w-7 ${p.color}`} />
            </span>
            <h3 className="mt-4 font-ui text-lg font-bold text-ink">
              {p.title}
            </h3>
            <p className="font-display text-base text-flame">{p.tagline}</p>
            <p className="mt-2 font-ui text-sm text-spice">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
