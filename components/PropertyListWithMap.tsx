"use client";

import { useState, useMemo, useCallback } from "react";
import { Map, X, ChevronLeft, ChevronRight } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import MapView from "@/components/MapView";
import type { Property } from "@/data/types";
import type { FetchPropertiesResult } from "@/lib/xintel";

interface PropertyListWithMapProps {
  operationType: "venta" | "alquiler";
  initialProperties: Property[];
  initialHasMore: boolean;
  totalCount: number | null;
}

export default function PropertyListWithMap({
  operationType,
  initialProperties,
  initialHasMore,
  totalCount,
}: PropertyListWithMapProps) {
  const [pages, setPages] = useState<Property[][]>([initialProperties]);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed into pages[]
  const [loadingPage, setLoadingPage] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | undefined>(undefined);

  const displayed = pages[currentPage] ?? [];

  // FilterBar only sees the current page — keeps filter options and results consistent
  const baseProperties = displayed;
  const [filtered, setFiltered] = useState<Property[] | null>(null);

  const handleFilterChange = useCallback((result: Property[]) => {
    setFiltered(result);
  }, []);

  const handleFilterStateChange = useCallback((filters: { propertyType?: string; zones: string[] }) => {
    // Reset pages when property type filter changes so we fetch fresh results from API
    if (filters.propertyType !== selectedPropertyType) {
      setPages([initialProperties]);
      setCurrentPage(0);
      setFiltered(null);
    }
    setSelectedPropertyType(filters.propertyType);
  }, [selectedPropertyType, initialProperties]);

  // A filter is "active" if the result differs from the full current page
  const showingFiltered =
    filtered !== null && filtered.length !== displayed.length;
  const visibleProperties = filtered !== null ? filtered : displayed;

  async function goToPage(pageIndex: number) {
    // Page already loaded
    if (pages[pageIndex]) {
      setCurrentPage(pageIndex);
      setFiltered(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Fetch from API
    setLoadingPage(true);
    try {
      const res = await fetch(
        `/api/properties?operation=${operationType}&page=${pageIndex + 1}`
      );
      const data: FetchPropertiesResult = await res.json();
      setPages((prev) => {
        const next = [...prev];
        next[pageIndex] = data.properties;
        return next;
      });
      setHasMore(data.hasMore);
      setCurrentPage(pageIndex);
      setFiltered(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoadingPage(false);
    }
  }

  const mapProperties = useMemo(
    () =>
      visibleProperties.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: p.currency,
        address: p.address,
        location: p.location,
        images: p.images,
        operation: p.operation,
      })),
    [visibleProperties]
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (visibleProperties.length === 0) return [-34.6855, -58.5567];
    const avgLat = visibleProperties.reduce((s, p) => s + p.location.lat, 0) / visibleProperties.length;
    const avgLng = visibleProperties.reduce((s, p) => s + p.location.lng, 0) / visibleProperties.length;
    return [avgLat, avgLng];
  }, [visibleProperties]);

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar
        properties={baseProperties}
        onFilterChange={handleFilterChange}
        onFilterStateChange={handleFilterStateChange}
        operationType={operationType}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left: property list */}
          <div className="w-full lg:w-[60%]">
            <p className="text-sm text-gray-500 mb-4">
              {showingFiltered ? (
                <>{visibleProperties.length} {visibleProperties.length === 1 ? "propiedad" : "propiedades"} (filtradas)</>
              ) : totalCount !== null ? (
                <>Mostrando {visibleProperties.length} de {totalCount} propiedades</>
              ) : hasMore ? (
                <>Mostrando {visibleProperties.length} propiedades…</>
              ) : (
                <>{visibleProperties.length} {visibleProperties.length === 1 ? "propiedad" : "propiedades"}</>
              )}
            </p>

            {visibleProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg text-navy-300">
                  No encontramos propiedades con esos filtros. Proba ajustando tu busqueda.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {visibleProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onHover={setHighlightedId}
                    />
                  ))}
                </div>

                {/* Pagination — only when not filtering */}
                {!showingFiltered && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 0 || loadingPage}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </button>

                    <span className="text-sm text-gray-600 px-2">
                      Página {currentPage + 1}{totalCount ? ` de ${Math.ceil(totalCount / 20)}` : ""}
                    </span>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={!hasMore && !pages[currentPage + 1] || loadingPage}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      {loadingPage ? "Cargando…" : <>Siguiente <ChevronRight className="h-4 w-4" /></>}
                    </button>
                  </div>
                )}
              </>
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
