import Link from "next/link";
import Image from "next/image";
import { Building2, Maximize2, Home, Bed, MapPin, ArrowRight } from "lucide-react";
import { Development, DevelopmentStatus } from "@/data/types";
import { formatPrice } from "@/lib/utils";

interface DevelopmentCardProps {
  development: Development;
}

const statusConfig: Record<DevelopmentStatus, { label: string; dot: string }> = {
  "pre-venta":       { label: "Pre Venta",       dot: "bg-violet-500" },
  pozo:              { label: "En Pozo",         dot: "bg-amber-500" },
  "en-construccion": { label: "En Construcción", dot: "bg-blue-500" },
  terminado:         { label: "Terminado",       dot: "bg-emerald-500" },
};

export default function DevelopmentCard({ development }: DevelopmentCardProps) {
  const { id, name, address, locality, district, status, deliveryDate,
          priceFrom, priceTo, totalUnits, areaRange, roomsRange, images } = development;

  const { label: statusLabel, dot: statusDot } = statusConfig[status];
  const imageSrc = images?.[0];
  const location = [locality, district].filter(Boolean).join(", ");

  return (
    <article className="group relative grid md:grid-cols-2 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out">
      <Link
        href={`/emprendimiento/${id}`}
        className="absolute inset-0 z-10"
        aria-label={`Ver emprendimiento ${name}`}
      />

      {/* Left: Content */}
      <div className="flex flex-col gap-5 p-6 lg:p-8 md:order-1">
        {/* Status dot + delivery */}
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
          <span className="text-gray-500">{statusLabel}</span>
          {deliveryDate && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">Entrega {deliveryDate}</span>
            </>
          )}
        </div>

        {/* Title + address */}
        <div>
          <h3 className="font-display text-3xl lg:text-4xl font-semibold leading-none tracking-tight text-navy group-hover:text-magenta transition-colors">
            {name}
          </h3>
          {address && (
            <p className="mt-2 text-sm text-gray-500">{address}</p>
          )}
        </div>

        {/* Features stacked with icons */}
        <ul className="flex flex-col gap-2.5 text-sm text-gray-600 border-l-2 border-gray-100 pl-4">
          {roomsRange && (
            <li className="flex items-center gap-2.5">
              <Bed className="h-4 w-4 text-magenta flex-shrink-0" />
              <span><span className="font-semibold text-navy">{roomsRange}</span> ambientes</span>
            </li>
          )}
          {areaRange && (
            <li className="flex items-center gap-2.5">
              <Maximize2 className="h-4 w-4 text-magenta flex-shrink-0" />
              <span><span className="font-semibold text-navy">{areaRange}</span></span>
            </li>
          )}
          {totalUnits > 0 && (
            <li className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-magenta flex-shrink-0" />
              <span><span className="font-semibold text-navy">{totalUnits}</span> unidades</span>
            </li>
          )}
          {location && (
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-magenta flex-shrink-0" />
              <span>{location}</span>
            </li>
          )}
        </ul>

        {/* Price range */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
            Rango de precios
          </p>
          <p className="font-mono-price text-lg font-bold text-navy">
            <span className="text-gray-400 text-sm font-medium">desde</span>{" "}
            <span className="text-magenta">USD {formatPrice(priceFrom)}</span>
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1.5 text-sm font-semibold text-magenta group-hover:gap-3 transition-all">
          Ver emprendimiento
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Right: Image */}
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px] overflow-hidden md:order-2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-300 flex items-center justify-center">
            <Home className="h-12 w-12 text-white/40" />
          </div>
        )}
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors duration-300" />
      </div>
    </article>
  );
}
