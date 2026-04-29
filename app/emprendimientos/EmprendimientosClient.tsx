"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Development, DevelopmentStatus } from "@/data/types";
import DevelopmentCard from "@/components/DevelopmentCard";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />
  ),
});

const statusFilters: { value: DevelopmentStatus; label: string }[] = [
  { value: "pre-venta", label: "Pre Venta" },
  { value: "pozo", label: "Pozo" },
  { value: "en-construccion", label: "En Construcción" },
  { value: "terminado", label: "Terminado" },
];

interface Props {
  developments: Development[];
}

export default function EmprendimientosClient({ developments }: Props) {
  const [selectedStatuses, setSelectedStatuses] = useState<DevelopmentStatus[]>(
    []
  );

  const toggleStatus = (status: DevelopmentStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filtered = useMemo(() => {
    if (selectedStatuses.length === 0) return developments;
    return developments.filter((d) => selectedStatuses.includes(d.status));
  }, [selectedStatuses, developments]);

  const mapProperties = useMemo(
    () =>
      filtered.map((d) => ({
        id: d.id,
        title: d.name,
        price: d.priceFrom,
        address: d.address,
        location: d.location,
        images: d.images,
      })),
    [filtered]
  );

  const mapCenter = useMemo<[number, number]>(() => {
    if (filtered.length === 0) return [-34.6855, -58.5567];
    const avgLat = filtered.reduce((s, d) => s + d.location.lat, 0) / filtered.length;
    const avgLng = filtered.reduce((s, d) => s + d.location.lng, 0) / filtered.length;
    return [avgLat, avgLng];
  }, [filtered]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-12 gap-8 mb-10">
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-8 w-1 rounded-full bg-magenta" />
            <p className="text-xs font-semibold uppercase tracking-widest text-magenta">
              Desarrollos inmobiliarios
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl 2xl:text-6xl font-semibold leading-[1.05] tracking-tight text-navy mb-4">
            Emprendimientos
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-md mb-6">
            Los mejores proyectos de zona oeste, curados uno por uno.{" "}
            <span className="text-navy font-semibold">
              Russo te acompaña desde el pozo hasta la escritura.
            </span>
          </p>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map(({ value, label }) => {
              const isSelected = selectedStatuses.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleStatus(value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                    isSelected
                      ? "border-magenta bg-magenta text-white shadow-sm"
                      : "border-navy-100 text-navy hover:border-navy-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 h-[360px] lg:h-[440px] rounded-2xl overflow-hidden shadow-card border border-gray-100">
          <MapView
            properties={mapProperties}
            center={mapCenter}
            zoom={12}
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="h-px flex-1 bg-gray-100" />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {filtered.length} emprendimiento{filtered.length !== 1 ? "s" : ""}
          {selectedStatuses.length > 0 && " filtrados"}
        </p>
        <span className="h-px flex-1 bg-gray-100" />
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filtered.map((dev) => (
            <DevelopmentCard key={dev.id} development={dev} />
          ))}
        </div>
      ) : (
        <p className="text-center text-navy-400 py-12">
          No hay emprendimientos con esos filtros.
        </p>
      )}
    </section>
  );
}
