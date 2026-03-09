"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Property } from "@/data/types";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const LOCALITIES = [
  "San Justo",
  "Ciudadela",
  "Haedo",
  "Ramos Mejia",
  "Moron",
  "La Matanza",
  "Tres de Febrero",
  "Isidro Casanova",
  "Gonzalez Catan",
  "Laferrere",
] as const;

const PROPERTY_TYPES: { label: string; value: Property["type"] }[] = [
  { label: "Departamento", value: "departamento" },
  { label: "Casa", value: "casa" },
  { label: "PH", value: "ph" },
  { label: "Terrenos", value: "terreno" },
  { label: "Cochera", value: "cochera" },
  { label: "Local", value: "local" },
  { label: "Oficina", value: "oficina" },
];

const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Hasta 50.000", min: 0, max: 50_000 },
  { label: "50.000 - 100.000", min: 50_000, max: 100_000 },
  { label: "100.000 - 200.000", min: 100_000, max: 200_000 },
  { label: "200.000 - 500.000", min: 200_000, max: 500_000 },
  { label: "Mas de 500.000", min: 500_000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Mas recientes", value: "recent" },
  { label: "Menor precio", value: "price-asc" },
  { label: "Mayor precio", value: "price-desc" },
] as const;

const AGE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Hasta 5 anos", min: 0, max: 5 },
  { label: "5 - 20", min: 5, max: 20 },
  { label: "20 - 50", min: 20, max: 50 },
  { label: "Mas de 50", min: 50, max: Infinity },
];

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface FilterBarProps {
  properties: Property[];
  onFilterChange: (filtered: Property[]) => void;
  operationType?: "venta" | "alquiler";
}

/* ------------------------------------------------------------------ */
/*  Dropdown helper                                                   */
/* ------------------------------------------------------------------ */

function Dropdown({
  label,
  value,
  options,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayLabel = value
    ? options.find((o) => o.value === value)?.label ?? label
    : label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
          value
            ? "border-magenta bg-magenta-50 text-magenta"
            : "border-navy-100 bg-white text-navy hover:border-navy-200"
        }`}
      >
        <span className="whitespace-nowrap">{displayLabel}</span>
        {value && onClear ? (
          <X
            className="h-3.5 w-3.5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          />
        ) : (
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-40 mt-1 max-h-60 w-max min-w-full overflow-auto rounded-lg border border-navy-100 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-navy-50 ${
                opt.value === value ? "text-magenta font-medium" : "text-navy"
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ToggleGroup helper                                                */
/* ------------------------------------------------------------------ */

function ToggleGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-navy-300">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(value === opt.value ? null : opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              value === opt.value
                ? "border-magenta bg-magenta-50 text-magenta font-medium"
                : "border-navy-100 text-navy hover:border-navy-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function FilterBar({
  properties,
  onFilterChange,
  operationType,
}: FilterBarProps) {
  const router = useRouter();
  /* ---- filter state ---- */
  const [zones, setZones] = useState<string[]>([]);
  const [zoneQuery, setZoneQuery] = useState("");
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [expanded, setExpanded] = useState(false);

  /* expanded filters */
  const [ambientes, setAmbientes] = useState<string | null>(null);
  const [banos, setBanos] = useState<string | null>(null);
  const [superficieMin, setSuperficieMin] = useState("");
  const [superficieMax, setSuperficieMax] = useState("");
  const [cochera, setCochera] = useState<string | null>(null);
  const [antiguedad, setAntiguedad] = useState<string | null>(null);

  /* sort */
  const [sortBy, setSortBy] = useState("recent");

  /* refs */
  const zoneInputRef = useRef<HTMLDivElement>(null);

  /* ---- close zone dropdown on outside click ---- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (zoneInputRef.current && !zoneInputRef.current.contains(e.target as Node)) {
        setZoneDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---- count active expanded filters ---- */
  const expandedFilterCount = useMemo(() => {
    let n = 0;
    if (ambientes) n++;
    if (banos) n++;
    if (superficieMin || superficieMax) n++;
    if (cochera) n++;
    if (antiguedad) n++;
    return n;
  }, [ambientes, banos, superficieMin, superficieMax, cochera, antiguedad]);

  /* ---- filter + sort logic ---- */
  const applyFilters = useCallback(() => {
    let result = [...properties];

    // zones
    if (zones.length > 0) {
      const lower = zones.map((z) => z.toLowerCase());
      result = result.filter((p) => lower.includes(p.locality.toLowerCase()));
    }

    // property type
    if (propertyType) {
      result = result.filter((p) => p.type === propertyType);
    }

    // operation
    if (operation) {
      result = result.filter((p) => p.operation === operation);
    }

    // price range
    if (priceRange) {
      const range = PRICE_RANGES[Number(priceRange)];
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    // ambientes (rooms)
    if (ambientes) {
      const num = Number(ambientes);
      if (ambientes === "5") {
        result = result.filter((p) => (p.features.rooms ?? 0) >= 5);
      } else {
        result = result.filter((p) => p.features.rooms === num);
      }
    }

    // banos
    if (banos) {
      const num = Number(banos);
      if (banos === "3") {
        result = result.filter((p) => (p.features.bathrooms ?? 0) >= 3);
      } else {
        result = result.filter((p) => p.features.bathrooms === num);
      }
    }

    // superficie
    const minArea = superficieMin ? Number(superficieMin) : 0;
    const maxArea = superficieMax ? Number(superficieMax) : Infinity;
    if (minArea > 0 || maxArea < Infinity) {
      result = result.filter((p) => {
        const area = p.features.totalArea ?? 0;
        return area >= minArea && area <= maxArea;
      });
    }

    // cochera
    if (cochera === "si") {
      result = result.filter((p) => (p.features.garage ?? 0) > 0);
    } else if (cochera === "no") {
      result = result.filter((p) => (p.features.garage ?? 0) === 0);
    }

    // antiguedad
    if (antiguedad) {
      const ageRange = AGE_RANGES[Number(antiguedad)];
      if (ageRange) {
        result = result.filter((p) => {
          const age = p.features.age ?? 0;
          return age >= ageRange.min && age <= ageRange.max;
        });
      }
    }

    // sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    // "recent" keeps original order

    onFilterChange(result);
  }, [
    properties,
    zones,
    propertyType,
    operation,
    priceRange,
    ambientes,
    banos,
    superficieMin,
    superficieMax,
    cochera,
    antiguedad,
    sortBy,
    onFilterChange,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  /* ---- zone suggestions ---- */
  const zoneSuggestions = useMemo(() => {
    if (!zoneQuery.trim()) return LOCALITIES.filter((l) => !zones.includes(l));
    const q = zoneQuery.toLowerCase();
    return LOCALITIES.filter(
      (l) => l.toLowerCase().includes(q) && !zones.includes(l)
    );
  }, [zoneQuery, zones]);

  const addZone = (z: string) => {
    if (!zones.includes(z)) {
      setZones((prev) => [...prev, z]);
    }
    setZoneQuery("");
    setZoneDropdownOpen(false);
  };

  const removeZone = (z: string) => {
    setZones((prev) => prev.filter((zone) => zone !== z));
  };

  /* ---- zone display text ---- */
  const zoneLabel = zones.length > 0 ? zones.join(", ") : "Todas las zonas";

  return (
    <div className="sticky top-[72px] z-30 bg-white border-b border-navy-100 shadow-sm">
      {/* ---- Main filter row ---- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Zone chips */}
          {zones.map((z) => (
            <span
              key={z}
              className="inline-flex items-center gap-1 rounded-full bg-magenta-50 px-3 py-1 text-sm font-medium text-magenta"
            >
              {z}
              <button
                type="button"
                onClick={() => removeZone(z)}
                aria-label={`Quitar ${z}`}
                className="ml-0.5 rounded-full p-0.5 hover:bg-magenta-100 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Zone search input */}
          <div ref={zoneInputRef} className="relative">
            <div className="flex items-center gap-1.5 rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm focus-within:border-magenta focus-within:ring-1 focus-within:ring-magenta">
              <Search className="h-4 w-4 text-navy-300" />
              <input
                type="text"
                placeholder="Donde queres mudarte?"
                value={zoneQuery}
                onChange={(e) => {
                  setZoneQuery(e.target.value);
                  setZoneDropdownOpen(true);
                }}
                onFocus={() => setZoneDropdownOpen(true)}
                className="w-44 bg-transparent outline-none placeholder:text-navy-200 text-navy"
                aria-label="Buscar zona"
              />
            </div>

            {zoneDropdownOpen && zoneSuggestions.length > 0 && (
              <ul
                role="listbox"
                className="absolute left-0 top-full z-40 mt-1 max-h-60 w-max min-w-full overflow-auto rounded-lg border border-navy-100 bg-white py-1 shadow-lg"
              >
                {zoneSuggestions.map((loc) => (
                  <li
                    key={loc}
                    role="option"
                    aria-selected={false}
                    className="cursor-pointer px-3 py-2 text-sm text-navy transition-colors hover:bg-navy-50"
                    onClick={() => addZone(loc)}
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tipo dropdown */}
          <Dropdown
            label="Tipo"
            value={propertyType}
            options={PROPERTY_TYPES.map((pt) => ({
              label: pt.label,
              value: pt.value,
            }))}
            onChange={setPropertyType}
            onClear={() => setPropertyType("")}
          />

          {/* Operacion dropdown */}
          <Dropdown
            label={
              operationType === "venta"
                ? "Comprar"
                : operationType === "alquiler"
                ? "Alquilar"
                : "Operacion"
            }
            value={operation}
            options={[
              { label: "Comprar", value: "venta" },
              { label: "Alquilar", value: "alquiler" },
            ]}
            onChange={(val) => {
              if (val === "alquiler" && operationType !== "alquiler") {
                router.push("/alquileres");
              } else if (val === "venta" && operationType !== "venta") {
                router.push("/ventas");
              } else {
                setOperation(val);
              }
            }}
            onClear={() => setOperation("")}
          />

          {/* Precio dropdown */}
          <Dropdown
            label="Precio"
            value={priceRange}
            options={PRICE_RANGES.map((r, i) => ({
              label: r.label,
              value: String(i),
            }))}
            onChange={setPriceRange}
            onClear={() => setPriceRange("")}
          />

          {/* Expand filters button */}
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
              expanded || expandedFilterCount > 0
                ? "border-magenta bg-magenta-50 text-magenta"
                : "border-navy-100 text-navy hover:border-navy-200"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>
              Filtros{expandedFilterCount > 0 ? ` (${expandedFilterCount})` : ""}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ---- Expanded filters ---- */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 border-t border-navy-100">
            {/* Ambientes */}
            <ToggleGroup
              label="Ambientes"
              options={[
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5+", value: "5" },
              ]}
              value={ambientes}
              onChange={setAmbientes}
            />

            {/* Banos */}
            <ToggleGroup
              label="Banos"
              options={[
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3+", value: "3" },
              ]}
              value={banos}
              onChange={setBanos}
            />

            {/* Superficie */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-navy-300">
                Superficie (m2)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={superficieMin}
                  onChange={(e) => setSuperficieMin(e.target.value)}
                  aria-label="Superficie minima en metros cuadrados"
                  className="w-20 rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy outline-none focus:border-magenta focus:ring-1 focus:ring-magenta"
                />
                <span className="text-navy-200">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={superficieMax}
                  onChange={(e) => setSuperficieMax(e.target.value)}
                  aria-label="Superficie maxima en metros cuadrados"
                  className="w-20 rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy outline-none focus:border-magenta focus:ring-1 focus:ring-magenta"
                />
              </div>
            </div>

            {/* Cochera */}
            <ToggleGroup
              label="Cochera"
              options={[
                { label: "Si", value: "si" },
                { label: "No", value: "no" },
              ]}
              value={cochera}
              onChange={setCochera}
            />

            {/* Antiguedad */}
            <ToggleGroup
              label="Antiguedad"
              options={AGE_RANGES.map((r, i) => ({
                label: r.label,
                value: String(i),
              }))}
              value={antiguedad}
              onChange={setAntiguedad}
            />
          </div>
        </div>
      </div>

      {/* ---- Results counter + sort ---- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 border-t border-navy-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-navy">
            <span className="font-semibold">
              {properties.length > 0
                ? `${properties.length} propiedades`
                : "0 propiedades"}
            </span>
            {zones.length > 0 && (
              <span className="text-navy-300"> en {zoneLabel}</span>
            )}
          </p>

          <Dropdown
            label="Ordenar por"
            value={sortBy}
            options={SORT_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            onChange={setSortBy}
          />
        </div>
      </div>
    </div>
  );
}
