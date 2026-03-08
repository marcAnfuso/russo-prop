"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Maximize2, Home, Droplets, Car } from "lucide-react";
import type { Property } from "@/data/types";
import ContactButtons from "@/components/ContactButtons";

interface PropertyCardProps {
  property: Property;
  onHover?: (id: string | null) => void;
}

function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PropertyCard({ property, onHover }: PropertyCardProps) {
  const {
    id,
    code,
    operation,
    price,
    address,
    locality,
    district,
    images,
    features,
  } = property;

  const isAlquiler = operation === "alquiler";
  const priceLabel = `${formatPrice(price)} USD${isAlquiler ? "/mes" : ""}`;
  const imageSrc = images.length > 0 ? images[0] : null;

  const featureItems: { icon: React.ReactNode; value: number; label: string }[] = [];

  if (features.totalArea) {
    featureItems.push({
      icon: <Maximize2 className="w-4 h-4" />,
      value: features.totalArea,
      label: "m\u00B2",
    });
  }
  if (features.rooms) {
    featureItems.push({
      icon: <Home className="w-4 h-4" />,
      value: features.rooms,
      label: "amb.",
    });
  }
  if (features.bathrooms) {
    featureItems.push({
      icon: <Droplets className="w-4 h-4" />,
      value: features.bathrooms,
      label: features.bathrooms === 1 ? "bano" : "banos",
    });
  }
  if (features.garage) {
    featureItems.push({
      icon: <Car className="w-4 h-4" />,
      value: features.garage,
      label: features.garage === 1 ? "cochera" : "cocheras",
    });
  }

  return (
    <motion.article
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col md:flex-row overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Clickable link overlay */}
      <Link
        href={`/propiedad/${id}`}
        className="absolute inset-0 z-10"
        aria-label={`Ver propiedad ${code} - ${address}`}
      />

      {/* Image section */}
      <div className="relative w-full md:w-2/5 aspect-[4/3] flex-shrink-0">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Propiedad ${code} - ${address}`}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-200 to-navy-400" />
        )}

        {/* Operation badge */}
        <span
          className={`absolute top-3 left-3 z-20 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${
            isAlquiler ? "bg-navy" : "bg-magenta"
          }`}
        >
          {operation === "venta" ? "Venta" : "Alquiler"}
        </span>
      </div>

      {/* Content section */}
      <div className="flex w-full md:w-3/5 flex-col justify-between p-4 md:p-5">
        <div>
          {/* Price */}
          <p className="text-xl font-bold text-gray-900 md:text-2xl">
            {priceLabel}
          </p>

          {/* Address */}
          <p className="mt-1 text-sm font-medium text-gray-700">{address}</p>
          <p className="text-sm text-gray-500">
            {locality}
            {district && district !== locality ? `, ${district}` : ""}
          </p>

          {/* Features */}
          {featureItems.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {featureItems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  {item.icon}
                  <span>
                    {item.value} {item.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contact buttons */}
        <div className="relative z-20 mt-4 flex justify-end">
          <ContactButtons propertyCode={code} size="sm" />
        </div>
      </div>
    </motion.article>
  );
}
