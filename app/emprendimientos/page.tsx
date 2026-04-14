"use client";

import { useState, useMemo } from "react";
import { DevelopmentStatus } from "@/data/types";
import { developments } from "@/data/developments";
import DevelopmentCard from "@/components/DevelopmentCard";

const statusFilters: { value: DevelopmentStatus; label: string }[] = [
  { value: "pre-venta", label: "Pre Venta" },
  { value: "pozo", label: "Pozo" },
  { value: "en-construccion", label: "En Construcción" },
  { value: "terminado", label: "Terminado" },
];

export default function EmprendimientosPage() {
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
  }, [selectedStatuses]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-wide">
          EMPRENDIMIENTOS
        </h1>
        <p className="mt-2 text-lg text-navy-500">
          Encontrá tu próxima inversión
        </p>
      </div>

      {/* Status filter toggles */}
      <div className="flex flex-wrap gap-3 mb-8">
        {statusFilters.map(({ value, label }) => {
          const isSelected = selectedStatuses.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggleStatus(value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-magenta text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Results counter */}
      <p className="text-sm text-navy-500 mb-6">
        {filtered.length} emprendimiento{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Development cards */}
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
