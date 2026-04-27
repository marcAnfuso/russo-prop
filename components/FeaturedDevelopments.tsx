"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Development, DevelopmentStatus } from "@/data/types";

const statusLabels: Record<DevelopmentStatus, string> = {
  "pre-venta": "Pre-venta",
  pozo: "Pozo",
  "en-construccion": "En construcción",
  terminado: "Terminado",
};

const statusColors: Record<DevelopmentStatus, string> = {
  "pre-venta": "bg-amber-500",
  pozo: "bg-orange-500",
  "en-construccion": "bg-blue-500",
  terminado: "bg-emerald-500",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

interface Props {
  developments: Development[];
}

export default function FeaturedDevelopments({ developments }: Props) {
  // Mostramos todos los visibles (los ocultos ya se filtraron arriba en
  // fetchPublicDevelopments). Si Russo tiene 5 visibles → 5 cards;
  // si tiene 7 → 7. El admin maneja qué aparece desde el toggle de
  // visibilidad.
  const featured = developments;

  if (featured.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-navy text-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-magenta mb-3">Nuevos proyectos</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Emprendimientos</h2>
          <p className="mt-3 text-white/50 text-base max-w-md mx-auto">
            Invertí en tu futuro con los mejores proyectos de zona oeste
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featured.map((dev) => {
            const imageSrc = dev.images.length > 0 ? dev.images[0] : null;
            return (
              <motion.div key={dev.id} variants={cardVariants}>
                <Link
                  href={`/emprendimiento/${dev.id}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-magenta/40 transition-all duration-200"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={dev.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-navy-400 to-navy-600" />
                    )}
                    <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ${statusColors[dev.status]}`}>
                      {statusLabels[dev.status]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-magenta transition-colors">
                      {dev.name}
                    </h3>
                    <p className="text-xs text-white/50">
                      {dev.locality}{dev.district && dev.district !== dev.locality ? `, ${dev.district}` : ""}
                    </p>
                    <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{dev.description}</p>
                    <span className="mt-1 text-sm font-semibold text-magenta">Ver más →</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            href="/emprendimientos"
            className="inline-block rounded-full border-2 border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-magenta hover:text-magenta"
          >
            Ver todos los emprendimientos
          </Link>
        </div>
      </div>
    </section>
  );
}
