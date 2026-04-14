"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface BarrioStats {
  pricePerSqM: string;
  avgTicket: string;
  daysToSell: string;
  trend: string; // e.g. "↑ 3.2%"
  trendLabel: string;
}

interface BarrioHighlight {
  title: string;
  text: string;
}

interface BarrioDestacadoProps {
  slug: string;
  name: string;
  district: string;
  description: string;
  image: string;
  propertyCount: number;
  stats: BarrioStats;
  highlights: BarrioHighlight[];
}

const defaultProps: BarrioDestacadoProps = {
  slug: "San Justo",
  name: "San Justo",
  district: "La Matanza · Centro",
  description:
    "El corazón administrativo y comercial de La Matanza. Plaza principal, municipalidad, estación del Sarmiento, y el Hospital Paroissien a pocas cuadras.",
  image: "/images/neighborhoods/san-justo.jpg",
  propertyCount: 142,
  stats: {
    pricePerSqM: "USD 1.850",
    avgTicket: "USD 128K",
    daysToSell: "47 días",
    trend: "↑ 3.2%",
    trendLabel: "este mes",
  },
  highlights: [
    {
      title: "Conectividad total",
      text: "3 líneas de colectivo y estación del Sarmiento en 5 minutos.",
    },
    {
      title: "Gastronomía en alza",
      text: "Av. Perón concentra los mejores lugares del oeste.",
    },
    {
      title: "Ideal para inversión",
      text: "El 70% de las propiedades son alquiler permanente.",
    },
  ],
};

export default function BarrioDestacado(props: Partial<BarrioDestacadoProps>) {
  const b = { ...defaultProps, ...props };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Barrio destacado
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy max-w-2xl">
            Vivir en{" "}
            <span className="italic text-magenta">{b.name}</span>
          </h2>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid lg:grid-cols-12 gap-10 items-start"
        >
          {/* Left: big image */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl group">
              <Image
                src={b.image}
                alt={b.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <span className="text-xs font-semibold uppercase tracking-widest mb-2 text-white/80">
                  Guía de barrio
                </span>
                <h3 className="font-display text-5xl lg:text-6xl font-semibold leading-none">
                  {b.name}
                </h3>
              </div>
              <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-navy shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-magenta opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-magenta" />
                </span>
                {b.propertyCount} propiedades
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                <MapPin className="h-3 w-3" />
                {b.district}
              </p>
              <p className="text-lg leading-relaxed text-gray-600">
                {b.description}{" "}
                <span className="font-semibold text-navy">
                  Russo tiene sede acá desde hace 30 años.
                </span>
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                  Precio m² promedio
                </p>
                <p className="font-mono-price text-2xl font-semibold text-navy">
                  {b.stats.pricePerSqM}
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
                  {b.stats.trend} {b.stats.trendLabel}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                  Ticket promedio
                </p>
                <p className="font-mono-price text-2xl font-semibold text-navy">
                  {b.stats.avgTicket}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Casa 3 amb.</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                  Tiempo venta
                </p>
                <p className="font-mono-price text-2xl font-semibold text-navy">
                  {b.stats.daysToSell}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">vs. 2024</p>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-3">
                Lo que lo hace especial
              </p>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {b.highlights.map((h) => (
                  <li key={h.title} className="flex gap-3">
                    <span className="text-magenta flex-shrink-0 mt-0.5">→</span>
                    <span>
                      <span className="font-semibold">{h.title}:</span> {h.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/ventas?zones=${encodeURIComponent(b.slug)}`}
              className="inline-flex items-center gap-2 text-magenta font-semibold hover:gap-3 transition-all duration-200"
            >
              Explorar propiedades en {b.name} →
            </Link>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
