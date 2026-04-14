"use client";

import Link from "next/link";
import Image from "next/image";
import { Maximize2, Home, Droplets, Car } from "lucide-react";
import type { Property } from "@/data/types";
import ContactButtons from "@/components/ContactButtons";
import FavoriteButton from "@/components/FavoriteButton";

interface PropertyCardProps {
  property: Property;
  onHover?: (id: string | null) => void;
  onQuickView?: (property: Property) => void;
  compact?: boolean;
}

function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PropertyCard({ property, onHover, onQuickView, compact = false }: PropertyCardProps) {
  const { id, code, operation, price, currency, address, locality, district, images, features } = property;

  const isAlquiler = operation === "alquiler";
  const currencyLabel = currency === "ARS" ? "$" : "USD";
  const priceLabel =
    price === 9999999
      ? "Reservado"
      : `${currencyLabel} ${formatPrice(price)}${isAlquiler ? "/mes" : ""}`;
  const imageSrc = images.length > 0 ? images[0] : null;

  const featureItems: { icon: React.ReactNode; value: number; label: string }[] = [];
  if (features.totalArea)  featureItems.push({ icon: <Maximize2 className="w-3.5 h-3.5" />, value: features.totalArea, label: "m²" });
  if (features.rooms)      featureItems.push({ icon: <Home className="w-3.5 h-3.5" />, value: features.rooms, label: "amb." });
  if (features.bathrooms)  featureItems.push({ icon: <Droplets className="w-3.5 h-3.5" />, value: features.bathrooms, label: "baños" });
  if (features.garage)     featureItems.push({ icon: <Car className="w-3.5 h-3.5" />, value: features.garage, label: "coch." });

  return (
    <article
      className={`group relative flex overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ease-out ${compact ? "flex-col h-full" : "flex-col sm:flex-row"}`}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Link href={`/propiedad/${id}`} className="absolute inset-0 z-10" aria-label={`Ver propiedad ${code}`} />

      {/* Image */}
      <div
        className={`relative flex-shrink-0 overflow-hidden cursor-pointer ${compact ? "w-full aspect-[4/3]" : "w-full sm:w-[38%] aspect-[4/3] sm:aspect-auto"}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onQuickView?.(property);
        }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Propiedad ${code}`}
            fill
            sizes="(max-width: 640px) 100vw, 38vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-200" />
        )}
        {!compact && (
          <span className={`absolute top-3 left-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm ${isAlquiler ? "bg-navy/90" : "bg-magenta/90"}`}>
            {isAlquiler ? "Alquiler" : "Venta"}
          </span>
        )}
        {price === 9999999 ? (
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

      {/* Content */}
      <div className="flex flex-col justify-between gap-3 p-5 w-full flex-1">
        <div className="space-y-1">
          <p className="text-2xl font-bold tracking-tight text-gray-900">{priceLabel}</p>
          <p className="text-sm font-medium text-gray-700">{address}</p>
          {(locality || district) && (
            <p className="text-xs text-gray-400">
              {locality}{district && district !== locality ? `, ${district}` : ""}
            </p>
          )}
        </div>

        {featureItems.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {featureItems.map((item, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="text-navy-300">{item.icon}</span>
                <span>{item.value} {item.label}</span>
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
