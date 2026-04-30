"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Maximize2,
  Home,
  Droplets,
  Car,
  BedDouble,
  ArrowUpRight,
} from "lucide-react";
import type { Property } from "@/data/types";
import ContactButtons from "@/components/ContactButtons";
import FavoriteButton from "@/components/FavoriteButton";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  onHover?: (id: string | null) => void;
  onQuickView?: (property: Property) => void;
  compact?: boolean;
  /** Esconde el badge "Venta"/"Alquiler" arriba a la izquierda · útil
   * cuando algo lo pisa (ej. cinta diagonal de Destacadas). */
  hideOperationBadge?: boolean;
}

const COMMERCIAL_TYPE_LABEL: Partial<Record<string, string>> = {
  local: "Local",
  oficina: "Oficina",
  terreno: "Terreno",
  cochera: "Cochera",
  edificio: "Edificio",
  galpon: "Galpón",
  negocio: "Negocio",
  quinta: "Quinta",
  campo: "Campo",
};

export default function PropertyCard({
  property,
  onHover,
  onQuickView,
  compact = false,
  hideOperationBadge = false,
}: PropertyCardProps) {
  const {
    id,
    code,
    operation,
    type,
    subtype,
    price,
    currency,
    address,
    locality,
    district,
    images,
    features,
  } = property;

  const isAlquiler = operation === "alquiler";
  const currencyLabel = currency === "ARS" ? "$" : "USD";
  const priceLabel = property.sold
    ? "Vendida"
    : price === 9999999
    ? "Reservado"
    : `${currencyLabel} ${formatPrice(price)}`;
  const imageSrc = images.length > 0 ? images[0] : null;
  const badgeLabel = subtype ?? COMMERCIAL_TYPE_LABEL[type];

  const area = features.coveredArea || features.totalArea;
  const showBedrooms =
    !!features.bedrooms &&
    features.bedrooms > 0 &&
    (features.rooms == null || features.bedrooms < features.rooms);

  const featureItems: { icon: React.ReactNode; value: string; key: string }[] = [];
  if (area) featureItems.push({ icon: <Maximize2 className="w-3.5 h-3.5" />, value: `${area} m²`, key: "area" });
  if (features.rooms) featureItems.push({ icon: <Home className="w-3.5 h-3.5" />, value: `${features.rooms} amb.`, key: "rooms" });
  if (showBedrooms) featureItems.push({ icon: <BedDouble className="w-3.5 h-3.5" />, value: `${features.bedrooms} dorm.`, key: "bed" });
  if (features.bathrooms) featureItems.push({ icon: <Droplets className="w-3.5 h-3.5" />, value: `${features.bathrooms} baños`, key: "bath" });
  if (features.garage) featureItems.push({ icon: <Car className="w-3.5 h-3.5" />, value: `${features.garage} coch.`, key: "garage" });

  const premiumHover =
    "hover:shadow-[0_20px_50px_-12px_rgba(230,0,126,0.25),0_8px_20px_-8px_rgba(26,34,81,0.15)] hover:-translate-y-1 hover:border-magenta/30";

  // ── Compact (vertical): precio flotante sobre la foto ───────────────────
  if (compact) {
    return (
      <article
        className={`group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card transition-all duration-300 ease-out ${premiumHover}`}
        onMouseEnter={() => onHover?.(id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <Link
          href={`/propiedad/${id}`}
          className="absolute inset-0 z-0"
          aria-label={`Ver propiedad ${code}`}
        />

        <div
          className="relative z-10 flex-shrink-0 overflow-hidden w-full aspect-[4/3] cursor-pointer"
          role={onQuickView ? "button" : undefined}
          tabIndex={onQuickView ? 0 : undefined}
          aria-label={onQuickView ? `Vista rápida de ${code}` : undefined}
          onClick={(e) => {
            if (!onQuickView) return;
            e.preventDefault();
            e.stopPropagation();
            onQuickView(property);
          }}
          onKeyDown={(e) => {
            if (!onQuickView) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onQuickView(property);
            }
          }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`Propiedad ${code}`}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-200" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

          {!hideOperationBadge && (
            <span
              className={`absolute top-3 left-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm ${
                isAlquiler ? "bg-navy/90" : "bg-magenta/90"
              }`}
            >
              {isAlquiler ? "Alquiler" : "Venta"}
            </span>
          )}

          {property.sold ? (
            <span className="absolute top-3 right-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white bg-emerald-500 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.5)]">
              Vendimos
            </span>
          ) : price === 9999999 ? (
            <span className="absolute top-3 right-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white bg-amber-500">
              Reservado
            </span>
          ) : (
            <FavoriteButton propertyId={id} />
          )}

          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {badgeLabel && (
                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white mb-1.5">
                  {badgeLabel}
                </span>
              )}
              <p className="text-xl font-bold text-white drop-shadow-md truncate">
                {priceLabel}
              </p>
            </div>
            <span className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-magenta text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 p-4 w-full flex-1">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-gray-900 truncate">{address}</p>
            {(locality || district) && (
              <p className="text-xs text-gray-400 truncate">
                {locality}
                {district && district !== locality ? `, ${district}` : ""}
              </p>
            )}
          </div>

          {featureItems.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {featureItems.slice(0, 4).map((item) => (
                <li key={item.key} className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="text-magenta/70">{item.icon}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    );
  }

  // ── Horizontal (imagen izquierda, contenido derecha) ─────────────────────
  return (
    <article
      className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card transition-all duration-300 ease-out ${premiumHover}`}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link
        href={`/propiedad/${id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver propiedad ${code}`}
      />

      <div
        className="relative z-10 flex-shrink-0 overflow-hidden cursor-pointer w-full sm:w-[38%] aspect-[4/3] sm:aspect-auto"
        role={onQuickView ? "button" : undefined}
        tabIndex={onQuickView ? 0 : undefined}
        aria-label={onQuickView ? `Vista rápida de ${code}` : undefined}
        onClick={(e) => {
          if (!onQuickView) return;
          e.preventDefault();
          e.stopPropagation();
          onQuickView(property);
        }}
        onKeyDown={(e) => {
          if (!onQuickView) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onQuickView(property);
          }
        }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Propiedad ${code}`}
            fill
            sizes="(max-width: 640px) 100vw, 38vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-200" />
        )}

        <span
          className={`absolute top-3 left-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm ${
            isAlquiler ? "bg-navy/90" : "bg-magenta/90"
          }`}
        >
          {isAlquiler ? "Alquiler" : "Venta"}
        </span>

        {property.sold ? (
          <span className="absolute top-3 right-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white bg-emerald-500 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.5)]">
            Vendimos
          </span>
        ) : price === 9999999 ? (
          <span className="absolute top-3 right-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white bg-amber-500 backdrop-blur-sm">
            Reservado
          </span>
        ) : (
          <FavoriteButton propertyId={id} />
        )}

        <div className="absolute inset-0 z-[5] bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-navy opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
            Vista rápida
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 p-5 w-full flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-2xl font-bold tracking-tight text-gray-900">{priceLabel}</p>
            {badgeLabel && (
              <span className="inline-flex items-center rounded-full bg-magenta-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-magenta">
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">{address}</p>
          {(locality || district) && (
            <p className="text-xs text-gray-400">
              {locality}
              {district && district !== locality ? `, ${district}` : ""}
            </p>
          )}
        </div>

        {featureItems.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {featureItems.map((item) => (
              <li key={item.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="text-navy-300">{item.icon}</span>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="relative z-20 flex justify-end pt-2 border-t border-gray-50">
          <ContactButtons propertyCode={code} size="sm" compact={compact} />
        </div>
      </div>
    </article>
  );
}
