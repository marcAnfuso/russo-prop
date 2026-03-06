import Link from "next/link";
import Image from "next/image";
import { Building2, Maximize2, Home, Droplets } from "lucide-react";
import { Development, DevelopmentStatus } from "@/data/types";
import { formatPrice } from "@/lib/utils";
import ContactButtons from "@/components/ContactButtons";

interface DevelopmentCardProps {
  development: Development;
}

const statusConfig: Record<
  DevelopmentStatus,
  { label: string; color: string }
> = {
  "pre-venta": { label: "Pre Venta", color: "bg-blue-500" },
  pozo: { label: "Pozo", color: "bg-amber-500" },
  "en-construccion": { label: "En Construccion", color: "bg-orange-500" },
  terminado: { label: "Terminado", color: "bg-green-500" },
};

export default function DevelopmentCard({ development }: DevelopmentCardProps) {
  const {
    id,
    code,
    name,
    address,
    locality,
    district,
    status,
    deliveryDate,
    priceFrom,
    priceTo,
    totalUnits,
    areaRange,
    roomsRange,
    bathrooms,
    images,
  } = development;

  const { label: statusLabel, color: statusColor } = statusConfig[status];
  const imageSrc = images?.[0];

  return (
    <Link
      href={`/emprendimiento/${id}`}
      className="group flex flex-col md:flex-row overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Left: Image (40%) */}
      <div className="relative w-full md:w-[40%] aspect-[4/3] flex-shrink-0">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-200 to-navy-400" />
        )}
      </div>

      {/* Right: Content (60%) */}
      <div className="flex flex-col justify-between w-full md:w-[60%] p-4 sm:p-5 gap-3">
        {/* Top row: status + delivery */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`${statusColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
          >
            {statusLabel}
          </span>
          {deliveryDate && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              Entrega: {deliveryDate}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-navy leading-tight group-hover:text-magenta transition-colors">
          {name}
        </h3>

        {/* Price range */}
        <p className="text-base text-navy-700">
          Desde{" "}
          <span className="text-xl font-bold text-navy">
            {formatPrice(priceFrom)}
          </span>{" "}
          hasta{" "}
          <span className="text-xl font-bold text-navy">
            {formatPrice(priceTo)}
          </span>{" "}
          <span className="text-sm font-medium text-navy-400">USD</span>
        </p>

        {/* Address */}
        <p className="text-sm text-navy-500 leading-snug">
          {address}
          {(locality || district) && (
            <span className="text-navy-400">
              {" "}
              &middot; {[locality, district].filter(Boolean).join(", ")}
            </span>
          )}
        </p>

        {/* Features row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-500">
          {totalUnits > 0 && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              {totalUnits} Unidades
            </span>
          )}
          {areaRange && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
              {areaRange}
            </span>
          )}
          {roomsRange && (
            <span className="inline-flex items-center gap-1">
              <Home className="h-4 w-4" aria-hidden="true" />
              {roomsRange} Ambientes
            </span>
          )}
          {bathrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-4 w-4" aria-hidden="true" />
              {bathrooms} {bathrooms === 1 ? "Bano" : "Banos"}
            </span>
          )}
        </div>

        {/* Contact buttons */}
        <div className="flex justify-end mt-auto pt-1">
          <ContactButtons propertyCode={code} size="sm" />
        </div>
      </div>
    </Link>
  );
}
