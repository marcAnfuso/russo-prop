import Link from "next/link";
import Image from "next/image";
import { Building2, Maximize2, Home, Droplets } from "lucide-react";
import { Development, DevelopmentStatus } from "@/data/types";
import { formatPrice } from "@/lib/utils";
import ContactButtons from "@/components/ContactButtons";

interface DevelopmentCardProps {
  development: Development;
}

const statusConfig: Record<DevelopmentStatus, { label: string; color: string; dot: string }> = {
  "pre-venta":      { label: "Pre Venta",      color: "bg-violet-50 text-violet-700 border-violet-200",  dot: "bg-violet-500" },
  pozo:             { label: "En Pozo",         color: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-500" },
  "en-construccion":{ label: "En Construccion", color: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-blue-500" },
  terminado:        { label: "Terminado",        color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

export default function DevelopmentCard({ development }: DevelopmentCardProps) {
  const { id, code, name, address, locality, district, status, deliveryDate,
          priceFrom, priceTo, totalUnits, areaRange, roomsRange, bathrooms, images } = development;

  const { label: statusLabel, color: statusColor, dot: statusDot } = statusConfig[status];
  const imageSrc = images?.[0];

  return (
    <Link
      href={`/emprendimiento/${id}`}
      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ease-out"
    >
      {/* Image */}
      <div className="relative w-full sm:w-[38%] aspect-[4/3] sm:aspect-auto flex-shrink-0 overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 38vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between gap-3 p-5 w-full">
        {/* Status + delivery */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
            {statusLabel}
          </span>
          {deliveryDate && (
            <span className="text-xs text-gray-400">Entrega: {deliveryDate}</span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-navy group-hover:text-magenta transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-400">
            {address}{(locality || district) ? ` · ${[locality, district].filter(Boolean).join(", ")}` : ""}
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Desde <span className="text-xl font-bold tracking-tight text-gray-900">USD {formatPrice(priceFrom)}</span>
          {" "}&ndash; hasta <span className="font-bold text-gray-900">USD {formatPrice(priceTo)}</span>
        </p>

        <ul className="flex flex-wrap gap-4 text-xs text-gray-500">
          {totalUnits > 0 && (
            <li className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-navy-300" />{totalUnits} unidades</li>
          )}
          {areaRange && (
            <li className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-navy-300" />{areaRange}</li>
          )}
          {roomsRange && (
            <li className="flex items-center gap-1.5"><Home className="h-3.5 w-3.5 text-navy-300" />{roomsRange} amb.</li>
          )}
          {bathrooms > 0 && (
            <li className="flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-navy-300" />{bathrooms} baño{bathrooms > 1 ? "s" : ""}</li>
          )}
        </ul>

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <ContactButtons propertyCode={code} size="sm" />
        </div>
      </div>
    </Link>
  );
}
