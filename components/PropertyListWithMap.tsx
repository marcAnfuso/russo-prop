"use client";

import { useState, useMemo, useCallback } from "react";
import { Map, X } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import MapView from "@/components/MapView";
import { properties as allProperties } from "@/data/properties";
import type { Property } from "@/data/types";

interface PropertyListWithMapProps {
  operationType: "venta" | "alquiler";
}

export default function PropertyListWithMap({
  operationType,
}: PropertyListWithMapProps) {
  const baseProperties = useMemo(
    () => allProperties.filter((p) => p.operation === operationType),
    [operationType]
  );

  const [filtered, setFiltered] = useState<Property[]>(baseProperties);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const handleFilterChange = useCallback((result: Property[]) => {
    setFiltered(result);
  }, []);

  const mapProperties = useMemo(
    () =>
      filtered.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        address: p.address,
        location: p.location,
        images: p.images,
        operation: p.operation,
      })),
    [filtered]
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (filtered.length === 0) return [-34.6855, -58.5567];
    const avgLat =
      filtered.reduce((sum, p) => sum + p.location.lat, 0) / filtered.length;
    const avgLng =
      filtered.reduce((sum, p) => sum + p.location.lng, 0) / filtered.length;
    return [avgLat, avgLng];
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter bar */}
      <FilterBar
        properties={baseProperties}
        onFilterChange={handleFilterChange}
        operationType={operationType}
      />

      {/* Split view */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left: property list */}
          <div className="w-full lg:w-[60%]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg text-navy-300">
                  No encontramos propiedades con esos filtros. Proba ajustando
                  tu busqueda.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onHover={setHighlightedId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: sticky map (desktop) */}
          <div className="hidden lg:block lg:w-[40%]">
            <div className="sticky top-[140px] h-[calc(100vh-160px)] rounded-xl overflow-hidden shadow-md">
              <MapView
                properties={mapProperties}
                highlightedId={highlightedId}
                center={mapCenter}
                zoom={13}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: floating "Ver mapa" button */}
      <button
        type="button"
        onClick={() => setShowMobileMap(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-magenta px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 lg:hidden"
      >
        <Map className="h-4 w-4" />
        Ver mapa
      </button>

      {/* Mobile: fullscreen map overlay */}
      {showMobileMap && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobileMap(false)}
            className="absolute top-4 right-4 z-[60] flex items-center justify-center rounded-full bg-white p-2 shadow-lg"
            aria-label="Cerrar mapa"
          >
            <X className="h-5 w-5 text-navy" />
          </button>
          <MapView
            properties={mapProperties}
            highlightedId={highlightedId}
            center={mapCenter}
            zoom={13}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
