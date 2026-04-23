"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/data/types";

export default function FeaturedProperties({
  properties,
}: {
  properties: Property[];
}) {
  const featured = properties.slice(0, 12);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, featured.length]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    // Step = width of 1 card (~75% del viewport en mobile, ~1/3 en desktop).
    const step = Math.max(280, el.clientWidth * 0.6);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (featured.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 px-4 sm:px-6 lg:px-8"
        >
          <p className="section-label mb-3">Selección de propiedades</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">
            Propiedades <span className="text-magenta">destacadas</span>
          </h2>
          <p className="mt-3 text-gray-400 text-base max-w-md mx-auto">
            Lo que estás buscando, lo podés encontrar
          </p>
        </motion.div>

        <div className="relative">
          {/* Arrow buttons — only render on desktop, mobile usa swipe nativo */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 text-navy transition-all hover:scale-105 ${
              canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 text-navy transition-all hover:scale-105 ${
              canRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 sm:px-6 lg:px-8 no-scrollbar"
          >
            {featured.map((property) => (
              <div
                key={property.id}
                className="snap-start shrink-0 w-[82%] sm:w-[46%] md:w-[32%] lg:w-[30%]"
              >
                <PropertyCard property={property} compact />
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex justify-center px-4"
        >
          <Link
            href="/ventas"
            className="rounded-full border-2 border-magenta px-6 py-2.5 text-sm font-semibold text-magenta transition-colors hover:bg-magenta hover:text-white"
          >
            Ver todas las propiedades
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
