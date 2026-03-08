"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { developments } from "@/data/developments";
import { formatPrice } from "@/lib/utils";
import type { DevelopmentStatus } from "@/data/types";

const statusLabels: Record<DevelopmentStatus, string> = {
  "pre-venta": "Pre-venta",
  pozo: "Pozo",
  "en-construccion": "En construccion",
  terminado: "Terminado",
};

const statusColors: Record<DevelopmentStatus, string> = {
  "pre-venta": "bg-amber-500",
  pozo: "bg-orange-500",
  "en-construccion": "bg-blue-500",
  terminado: "bg-emerald-500",
};

export default function FeaturedDevelopments() {
  const featured = developments.filter((d) => d.featured);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-navy text-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-magenta mb-3">Nuevos proyectos</p>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Emprendimientos destacados
          </h2>
          <p className="mt-3 text-white/50 text-base max-w-md mx-auto">
            Invertí en tu futuro con los mejores proyectos de zona oeste
          </p>
        </div>

        {/* Alternating layouts */}
        <div className="flex flex-col gap-20">
          {featured.map((dev, index) => {
            const isReversed = index % 2 === 1;
            const imageSrc = dev.images.length > 0 ? dev.images[0] : null;

            return (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`flex flex-col gap-8 items-center ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={dev.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-navy-400 to-navy-600" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    {dev.name}
                  </h3>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${
                        statusColors[dev.status]
                      }`}
                    >
                      {statusLabels[dev.status]}
                    </span>
                    <span className="text-white/60 text-sm">
                      {dev.locality}
                      {dev.district && dev.district !== dev.locality
                        ? `, ${dev.district}`
                        : ""}
                    </span>
                  </div>

                  <p className="text-white/80 leading-relaxed line-clamp-3">
                    {dev.description}
                  </p>

                  <p className="text-lg font-semibold">
                    Desde USD {formatPrice(dev.priceFrom)} — Hasta USD{" "}
                    {formatPrice(dev.priceTo)}
                  </p>

                  <div>
                    <Link
                      href={`/emprendimiento/${dev.id}`}
                      className="inline-block rounded-full bg-magenta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-magenta-600"
                    >
                      Ver emprendimiento
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
