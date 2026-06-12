"use client";

import { useState, useEffect, useCallback } from "react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1920&q=70",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=70",
];

export default function HeroSlider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % HERO_IMAGES.length),
    [],
  );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative overflow-hidden">
      {/* Sliding background images */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={i}
          aria-hidden
          className={
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out " +
            (i === current ? "opacity-100" : "opacity-0")
          }
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}

      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-950/80 via-slate-900/68 to-slate-900/82" />

      {/* Overlaid content */}
      <div className="relative z-10">{children}</div>

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Show slide ${i + 1}`}
            className={
              "h-2 rounded-full transition-all " +
              (i === current ? "w-7 bg-brand-400" : "w-2 bg-white/55")
            }
          />
        ))}
      </div>
    </section>
  );
}
