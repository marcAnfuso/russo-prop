"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/data/types";

export default function FavoritosPage() {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const results = await Promise.all(
        favorites.map(async (id) => {
          try {
            const res = await fetch(`/api/property/${id}`);
            if (!res.ok) return null;
            return (await res.json()) as Property;
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) {
        setProperties(results.filter((p): p is Property => p !== null));
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [favorites]);

  return (
    <main className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Mis favoritos</h1>
          <p className="mt-1 text-gray-500">
            {favorites.length === 0
              ? "No tenés propiedades guardadas"
              : `${favorites.length} propiedad${favorites.length === 1 ? "" : "es"} guardada${favorites.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: favorites.length || 2 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg text-gray-500 mb-6">
              No tenés propiedades guardadas todavía.
            </p>
            <Link
              href="/ventas"
              className="inline-flex items-center gap-2 rounded-full bg-magenta px-6 py-3 text-sm font-semibold text-white hover:bg-magenta/90 transition-colors"
            >
              Explorar propiedades
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
