"use client";

import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/data/properties";

export default function FeaturedProperties() {
  const featured = properties.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl text-navy uppercase tracking-wide">
            PROPIEDADES <span className="font-bold">DESTACADAS</span>
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Lo que estas buscando, lo podes encontrar
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/ventas"
            className="rounded-full border-2 border-magenta px-6 py-2.5 text-sm font-semibold text-magenta transition-colors hover:bg-magenta hover:text-white"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}
