"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  isRent: boolean;
  vastuCompliant: boolean;
}

export default function PropertyGallery({
  images,
  title,
  isRent,
  vastuCompliant,
}: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count = images.length;
  const go = (delta: number) =>
    setCurrent((c) => (c + delta + count) % count);

  return (
    <div>
      {/* Main slide */}
      <div
        className="group relative h-72 overflow-hidden rounded-2xl bg-sun/30 sm:h-[440px]"
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX;
          if (dx > 50) go(-1);
          else if (dx < -50) go(1);
          setTouchStartX(null);
        }}
      >
        {images.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`${title} — photo ${i + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority={i === 0}
            className={
              "object-cover transition-opacity duration-500 " +
              (i === current ? "opacity-100" : "opacity-0")
            }
          />
        ))}

        {/* Badges */}
        <span
          className={
            "absolute left-4 top-4 rounded-md px-3 py-1 font-ui text-sm font-bold text-white shadow " +
            (isRent ? "bg-teal" : "bg-rani")
          }
        >
          {isRent ? "For Rent" : "For Sale"}
        </span>
        {vastuCompliant && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1 font-ui text-xs font-bold text-teal shadow">
            <Flame className="h-3.5 w-3.5 text-flame" />
            Vāstu Compliant
          </span>
        )}

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-spice shadow-md transition hover:scale-105 hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-spice shadow-md transition hover:scale-105 hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter */}
        <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
          {current + 1} / {count}
        </span>

        {/* Dots */}
        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={
                  "h-2 rounded-full transition-all " +
                  (i === current ? "w-6 bg-white" : "w-2 bg-white/60")
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition " +
                (i === current
                  ? "ring-2 ring-flame ring-offset-2"
                  : "opacity-70 hover:opacity-100")
              }
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
