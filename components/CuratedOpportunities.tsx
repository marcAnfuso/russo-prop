"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, MapPin, ArrowRight, Bed, Maximize2 } from "lucide-react";
import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  properties: Property[];
}

/**
 * Sección "Oportunidades" curada por Russo (admin /admin picks).
 *
 * Layout asimétrico: 1 hero grande + hasta 2 secundarias en columna.
 * El componente NO renderiza nada si no hay picks — la home se queda
 * limpia sin sección vacía.
 *
 * Distinto visualmente a:
 *   - FeaturedProperties (Exclusivas) · grid simétrico 3 cards
 *   - FeaturedOpportunities (Bajaron de precio) · 2 horizontales con %
 */
export default function CuratedOpportunities({ properties }: Props) {
  if (properties.length === 0) return null;

  const [hero, ...rest] = properties;
  const sidebar = rest.slice(0, 2);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-navy text-white">
      {/* Halo magenta de fondo */}
      <div
        className="absolute -top-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-magenta/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-magenta/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-magenta mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Oportunidades
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight">
            Las que <span className="italic text-magenta">recomienda Russo</span>
          </h2>
          <p className="mt-4 text-base text-white/65 leading-relaxed">
            Propiedades a un gran valor con mucha demanda. Te las seleccionamos
            para que puedas aprovechar estas oportunidades de inversión.
          </p>
        </motion.div>

        {/* Hero + sidebar · forzamos altura igual entre las columnas */}
        <div className={`grid gap-5 lg:items-stretch ${sidebar.length > 0 ? "lg:grid-cols-5" : "lg:grid-cols-1 max-w-3xl mx-auto"}`}>
          {/* HERO · ocupa 3/5 cuando hay sidebar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className={`flex ${sidebar.length > 0 ? "lg:col-span-3" : ""}`}
          >
            <HeroCard property={hero} />
          </motion.div>

          {/* SIDEBAR · 2/5 con cards apiladas. En lg+ se reparten el alto
              del hero gracias a auto-rows-fr + h-full en cada motion.div. */}
          {sidebar.length > 0 && (
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:auto-rows-fr gap-5">
              {sidebar.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                  className="flex h-full"
                >
                  <SidebarCard property={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroCard({ property }: { property: Property }) {
  const opLabel = property.operation === "venta" ? "Venta" : "Alquiler";
  const priceLabel =
    property.currency === "ARS"
      ? `$ ${formatPrice(property.price)}`
      : `USD ${formatPrice(property.price)}`;
  const cover = property.images[0];

  return (
    <Link
      href={`/propiedad/${property.id}`}
      className="group relative flex flex-col w-full h-full rounded-3xl overflow-hidden bg-navy-700 ring-1 ring-white/10 hover:ring-magenta/60 shadow-2xl transition-all duration-300"
    >
      {/* Imagen · ocupa el alto disponible (flex-1) */}
      <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] bg-navy-800 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={property.address}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-600 to-navy-800" />
        )}
        {/* Gradient para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Badge top-left */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-magenta text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
          <Sparkles className="w-3 h-3" />
          La oportunidad
        </div>

        {/* Op + código top-right */}
        <div className="absolute top-4 right-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full text-[11px] font-semibold">
          <span>{opLabel}</span>
          <span className="text-white/60 font-mono tabular-nums">{property.code}</span>
        </div>

        {/* Bottom info · todo dentro de la imagen */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2">
            {property.address}
          </h3>
          <p className="inline-flex items-center gap-1.5 text-sm text-white/85 mb-3">
            <MapPin className="w-3.5 h-3.5 text-magenta" />
            {property.locality}
          </p>

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/55 mb-0.5">
                {property.operation === "venta" ? "Precio" : "Mensual"}
              </p>
              <p className="font-mono-price text-2xl sm:text-3xl font-bold text-white">
                {priceLabel}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-white/60">
                {!!property.features.rooms && property.features.rooms > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    {property.features.rooms} amb
                  </span>
                )}
                {!!property.features.totalArea && property.features.totalArea > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    {property.features.totalArea} m²
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-magenta hover:bg-magenta-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors group-hover:translate-x-1 duration-300 flex-shrink-0">
              Ver
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SidebarCard({ property }: { property: Property }) {
  const priceLabel =
    property.currency === "ARS"
      ? `$ ${formatPrice(property.price)}`
      : `USD ${formatPrice(property.price)}`;
  const cover = property.images[0];

  return (
    <Link
      href={`/propiedad/${property.id}`}
      className="group relative flex flex-col w-full h-full rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-magenta/40 hover:bg-white/10 transition-all duration-300"
    >
      <div className="relative aspect-[5/3] bg-navy-800 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={property.address}
            fill
            sizes="(min-width: 1024px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-600 to-navy-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-2.5 right-2.5 bg-white/15 backdrop-blur-md border border-white/25 px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums text-white/85">
          {property.code}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest text-magenta font-semibold">
          {property.operation === "venta" ? "Venta" : "Alquiler"}
        </p>
        <h4 className="font-semibold text-sm leading-snug text-white line-clamp-2">
          {property.address}
        </h4>
        <p className="text-xs text-white/55 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {property.locality}
        </p>
        <p className="font-mono-price text-lg font-bold text-white mt-1">
          {priceLabel}
        </p>
      </div>
    </Link>
  );
}
