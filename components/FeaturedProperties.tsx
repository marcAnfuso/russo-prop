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
          {/* Línea ornamental con diamantes — estilo magazine premium */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-12 bg-magenta/40" aria-hidden="true" />
            <span className="text-magenta text-xs" aria-hidden="true">◆</span>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-magenta">
              Selección Russo
            </p>
            <span className="text-magenta text-xs" aria-hidden="true">◆</span>
            <span className="h-px w-12 bg-magenta/40" aria-hidden="true" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">
            Propiedades <span className="text-magenta">destacadas</span>
          </h2>
          <p className="mt-3 text-sm italic text-gray-400 max-w-md mx-auto">
            Las que el equipo eligió, una por una.
          </p>
        </motion.div>

        <div className="relative">
          {/* Arrow buttons — z-30 así superan al Link overlay del card
              (z-10) sin dejar que medio pixel de miss toque la propiedad. */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Anterior"
            className={`hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 items-center justify-center h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 text-navy transition-all hover:scale-105 hover:border-magenta ${
              canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Siguiente"
            className={`hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 items-center justify-center h-12 w-12 rounded-full bg-white shadow-lg border border-gray-200 text-navy transition-all hover:scale-105 hover:border-magenta ${
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
                className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-[32%] relative"
              >
                {/* Cinta diagonal "Destacada" en la esquina superior izq.
                    Va por encima del card sin invadir contenido. Saltea
                    el badge de Venta/Alquiler para que no se solape. */}
                <div
                  aria-hidden="true"
                  className="absolute -top-1.5 -left-1.5 z-30 h-28 w-28 overflow-hidden pointer-events-none"
                >
                  <div className="absolute top-5 -left-6 w-40 rotate-[-45deg] bg-magenta py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                    ★ Destacada
                  </div>
                </div>
                <PropertyCard property={property} compact hideOperationBadge />
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
