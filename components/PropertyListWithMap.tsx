"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Map, EyeOff, X, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyQuickViewModal from "@/components/PropertyQuickViewModal";
import MapView from "@/components/MapView";
import type { Property } from "@/data/types";

interface PropertyListWithMapProps {
  operationType: "venta" | "alquiler";
  /** Full inventory for the operation — filter + paginate client-side. */
  initialProperties: Property[];
  /** Kept for backwards compat; ignored now that we load everything upfront. */
  initialHasMore?: boolean;
  /** Kept for backwards compat; derived from initialProperties.length. */
  totalCount?: number | null;
}

const PAGE_SIZE = 20;

export default function PropertyListWithMap({
  operationType,
  initialProperties,
}: PropertyListWithMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filters from URL
  const initialPropertyType = searchParams.get("type") || "";
  const initialZonesParam = searchParams.get("zones");
  const initialZones = initialZonesParam ? initialZonesParam.split(",") : [];

  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [desktopMapVisible, setDesktopMapVisible] = useState(true);
  const [quickViewProperty, setQuickViewProperty] = useState<Property | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // FilterBar sees the ENTIRE inventory so filters apply across all pages.
  const [filtered, setFiltered] = useState<Property[] | null>(null);
  const activeSet = filtered ?? initialProperties;
  const totalPages = Math.max(1, Math.ceil(activeSet.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const visibleProperties = activeSet.slice(pageStart, pageStart + PAGE_SIZE);
  const showingFiltered =
    filtered !== null && filtered.length !== initialProperties.length;

  const handleFilterChange = useCallback((result: Property[]) => {
    setFiltered(result);
    setCurrentPage(0);
  }, []);

  const handleFilterStateChange = useCallback(
    (filters: { propertyType?: string; zones: string[] }) => {
      const basePath = operationType === "alquiler" ? "/alquileres" : "/ventas";
      const params = new URLSearchParams();
      if (filters.propertyType) {
        params.set("type", filters.propertyType);
      }
      if (filters.zones.length > 0) {
        params.set("zones", filters.zones.join(","));
      }
      const newUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== newUrl) {
        router.replace(newUrl);
      }
    },
    [router, operationType]
  );

  function goToPage(pageIndex: number) {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    setCurrentPage(pageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const mapProperties = useMemo(
    () =>
      activeSet.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: p.currency,
        address: p.address,
        location: p.location,
        images: p.images,
        operation: p.operation,
      })),
    [activeSet]
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (activeSet.length === 0) return [-34.6855, -58.5567];
    const avgLat = activeSet.reduce((s, p) => s + p.location.lat, 0) / activeSet.length;
    const avgLng = activeSet.reduce((s, p) => s + p.location.lng, 0) / activeSet.length;
    return [avgLat, avgLng];
  }, [activeSet]);

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar
        properties={initialProperties}
        onFilterChange={handleFilterChange}
        onFilterStateChange={handleFilterStateChange}
        operationType={operationType}
        initialPropertyType={initialPropertyType}
        initialZones={initialZones}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left: property list */}
          <div className={`w-full transition-[width] duration-300 ease-out ${desktopMapVisible ? "lg:w-[60%]" : "lg:w-full"}`}>
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-gray-500">
                {showingFiltered ? (
                  <>{activeSet.length} {activeSet.length === 1 ? "propiedad" : "propiedades"} · filtradas</>
                ) : (
                  <>{activeSet.length} {activeSet.length === 1 ? "propiedad" : "propiedades"} en total</>
                )}
              </p>

              {/* Desktop map toggle */}
              <button
                type="button"
                onClick={() => setDesktopMapVisible((v) => !v)}
                aria-pressed={desktopMapVisible}
                className={`hidden lg:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                  desktopMapVisible
                    ? "border-magenta bg-magenta-50 text-magenta shadow-sm"
                    : "border-navy-100 text-navy hover:border-navy-300 hover:bg-gray-50"
                }`}
              >
                {desktopMapVisible ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Ocultar mapa
                  </>
                ) : (
                  <>
                    <Map className="h-3.5 w-3.5" />
                    Mostrar mapa
                  </>
                )}
              </button>
            </div>

            {visibleProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="max-w-md">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-magenta-50 text-magenta">
                    <SearchX className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-navy mb-2">
                    No encontramos lo que buscás
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Con los filtros actuales no hay propiedades para mostrar.
                    Probá ampliar la zona o quitar algún filtro — a veces lo
                    que buscás está a una cuadra.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        document.querySelector("[data-testid='filter-bar']")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="block w-full rounded-lg border-2 border-magenta px-4 py-2 text-sm font-semibold text-magenta hover:bg-magenta hover:text-white transition-colors"
                    >
                      Ajustar filtros
                    </button>
                    <a
                      href={`/${operationType === 'alquiler' ? 'alquileres' : 'ventas'}`}
                      className="block w-full rounded-lg border-2 border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
                    >
                      Ver todas las propiedades
                    </a>
                    <a
                      href="/contacto"
                      className="block text-xs text-gray-400 hover:text-magenta transition-colors"
                    >
                      ¿No encontrás lo que necesitás? Contactanos
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={
                    desktopMapVisible
                      ? "flex flex-col gap-4"
                      : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  }
                >
                  {visibleProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      compact={!desktopMapVisible}
                      onHover={setHighlightedId}
                      onQuickView={(prop) => {
                        setQuickViewProperty(prop);
                        setIsQuickViewOpen(true);
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 0}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </button>

                    <span className="text-sm text-gray-600 px-2 tabular-nums">
                      Página {safePage + 1} de {totalPages}
                    </span>

                    <button
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage >= totalPages - 1}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Siguiente <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: sticky map (desktop) */}
          <div className={`hidden lg:block lg:w-[40%] transition-all duration-300 ease-out ${desktopMapVisible ? "opacity-100" : "lg:hidden opacity-0"}`}>
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

      {/* Quick View Modal */}
      <PropertyQuickViewModal
        property={quickViewProperty}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProperty(null);
        }}
      />
    </div>
  );
}
