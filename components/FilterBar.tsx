"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, ChevronDown, SlidersHorizontal, Check, Star, Video } from "lucide-react";
import type { Property } from "@/data/types";
import { useLocalities, rankLocalityMatches } from "@/lib/useLocalities";

const PROPERTY_TYPES: { label: string; value: Property["type"] }[] = [
  { label: "Departamento", value: "departamento" },
  { label: "Casa", value: "casa" },
  { label: "PH", value: "ph" },
  { label: "Terreno", value: "terreno" },
  { label: "Cochera", value: "cochera" },
  { label: "Local", value: "local" },
  { label: "Oficina", value: "oficina" },
];

const SORT_OPTIONS = [
  { label: "Más recientes", value: "recent" },
  { label: "Menor precio", value: "price-asc" },
  { label: "Mayor precio", value: "price-desc" },
] as const;

const AGE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Hasta 5 años", min: 0, max: 5 },
  { label: "5 - 20", min: 5, max: 20 },
  { label: "20 - 50", min: 20, max: 50 },
  { label: "Más de 50", min: 50, max: Infinity },
];

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface FilterBarProps {
  properties: Property[];
  onFilterChange: (filtered: Property[]) => void;
  onFilterStateChange?: (filters: { propertyType?: string; zones: string[] }) => void;
  operationType?: "venta" | "alquiler";
  initialPropertyType?: string;
  initialZones?: string[];
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
  children,
}: {
  label: string;
  value: string;
  options?: { label: string; value: string }[];
  onChange?: (v: string) => void;
  onClear?: () => void;
  /** Optional custom body rendered instead of the options list. */
  children?: (close: () => void) => React.ReactNode;
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
    ? value.includes(",")
      ? `${value.split(",").filter(Boolean).length} tipos`
      : options?.find((o) => o.value === value)?.label ?? label
    : label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all duration-150 active:scale-[0.98] ${
          value
            ? "border-magenta bg-magenta-50 text-magenta shadow-sm"
            : "border-navy-100 bg-white text-navy hover:border-navy-300 hover:bg-gray-50"
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

      {open && (children ? (
        <div className="absolute left-0 top-full z-40 mt-1 w-max min-w-full rounded-lg border border-navy-100 bg-white shadow-lg">
          {children(() => setOpen(false))}
        </div>
      ) : options ? (
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
                onChange?.(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null)}
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
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(selected ? null : opt.value)}
              aria-pressed={selected}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
                selected
                  ? "border-magenta bg-magenta text-white shadow-sm"
                  : "border-navy-100 bg-white text-navy hover:border-navy-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Segmented helper (used for currency)                              */
/* ------------------------------------------------------------------ */

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-navy-100 bg-white p-0.5 text-sm">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(selected ? "" : opt.value)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selected ? "bg-magenta text-white shadow-sm" : "text-navy hover:text-magenta"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export default function FilterBar({
  properties,
  onFilterChange,
  onFilterStateChange,
  initialPropertyType = "",
  initialZones = [],
}: FilterBarProps) {
  const localities = useLocalities();
  /* ---- filter state ---- */
  const [zones, setZones] = useState<string[]>(initialZones);
  const [zoneQuery, setZoneQuery] = useState("");
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [currency, setCurrency] = useState<"" | "USD" | "ARS">("");
  const [expanded, setExpanded] = useState(false);

  /* expanded filters */
  const [ambientes, setAmbientes] = useState<string | null>(null);
  const [dormitorios, setDormitorios] = useState<string | null>(null);
  const [banos, setBanos] = useState<string | null>(null);
  const [superficieMin, setSuperficieMin] = useState("");
  const [superficieMax, setSuperficieMax] = useState("");
  const [cochera, setCochera] = useState<string | null>(null);
  const [antiguedad, setAntiguedad] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
    () => new Set()
  );
  const [destacadas, setDestacadas] = useState(false);
  const [conVideo, setConVideo] = useState(false);

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

  /* ---- top 15 most common amenities across the inventory ---- */
  const amenityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of properties) {
      for (const a of p.amenities) {
        const clean = a.trim();
        if (!clean) continue;
        counts.set(clean, (counts.get(clean) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));
  }, [properties]);

  /* ---- count active expanded filters ---- */
  const expandedFilterCount = useMemo(() => {
    let n = 0;
    if (ambientes) n++;
    if (dormitorios) n++;
    if (banos) n++;
    if (superficieMin || superficieMax) n++;
    if (cochera) n++;
    if (antiguedad) n++;
    if (selectedAmenities.size > 0) n++;
    if (destacadas) n++;
    if (conVideo) n++;
    return n;
  }, [ambientes, dormitorios, banos, superficieMin, superficieMax, cochera, antiguedad, selectedAmenities, destacadas, conVideo]);

  /* ---- filter + sort logic ---- */
  const applyFilters = useCallback(() => {
    let result = [...properties];

    // zones
    if (zones.length > 0) {
      const lower = zones.map((z) => z.toLowerCase());
      result = result.filter((p) => lower.includes(p.locality.toLowerCase()));
    }

    // property type (supports comma-separated from SearchBar)
    if (propertyType) {
      const allowed = propertyType.split(",").map((t) => t.trim()).filter(Boolean);
      if (allowed.length === 1) {
        result = result.filter((p) => p.type === allowed[0]);
      } else if (allowed.length > 1) {
        const set = new Set(allowed);
        result = result.filter((p) => set.has(p.type));
      }
    }

    // price min/max
    const minP = priceMin ? Number(priceMin) : 0;
    const maxP = priceMax ? Number(priceMax) : Infinity;
    if (minP > 0 || maxP < Infinity) {
      result = result.filter((p) => p.price >= minP && p.price <= maxP);
    }

    // currency
    if (currency) {
      result = result.filter((p) => p.currency === currency);
    }

    // ambientes
    if (ambientes) {
      const num = Number(ambientes);
      if (ambientes === "5") {
        result = result.filter((p) => (p.features.rooms ?? 0) >= 5);
      } else {
        result = result.filter((p) => p.features.rooms === num);
      }
    }

    // dormitorios
    if (dormitorios) {
      const num = Number(dormitorios);
      if (dormitorios === "4") {
        result = result.filter((p) => (p.features.bedrooms ?? 0) >= 4);
      } else {
        result = result.filter((p) => p.features.bedrooms === num);
      }
    }

    // baños
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
        const area = p.features.coveredArea || p.features.totalArea || 0;
        return area >= minArea && area <= maxArea;
      });
    }

    // cochera
    if (cochera === "si") {
      result = result.filter((p) => (p.features.garage ?? 0) > 0);
    } else if (cochera === "no") {
      result = result.filter((p) => (p.features.garage ?? 0) === 0);
    }

    // antigüedad
    if (antiguedad) {
      const ageRange = AGE_RANGES[Number(antiguedad)];
      if (ageRange) {
        result = result.filter((p) => {
          const age = p.features.age ?? 0;
          return age >= ageRange.min && age <= ageRange.max;
        });
      }
    }

    // amenities (AND filter — property must have all selected)
    if (selectedAmenities.size > 0) {
      result = result.filter((p) => {
        const set = new Set(p.amenities);
        for (const req of selectedAmenities) {
          if (!set.has(req)) return false;
        }
        return true;
      });
    }

    // destacadas
    if (destacadas) {
      result = result.filter((p) => p.featured);
    }

    // con video
    if (conVideo) {
      result = result.filter((p) => !!p.videoUrl);
    }

    // sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    onFilterChange(result);
  }, [
    properties,
    zones,
    propertyType,
    priceMin,
    priceMax,
    currency,
    ambientes,
    dormitorios,
    banos,
    superficieMin,
    superficieMax,
    cochera,
    antiguedad,
    selectedAmenities,
    destacadas,
    conVideo,
    sortBy,
    onFilterChange,
  ]);

  useEffect(() => {
    applyFilters();
    onFilterStateChange?.({ propertyType, zones });
  }, [applyFilters, propertyType, zones, onFilterStateChange]);

  /* ---- zone suggestions ---- */
  const zoneSuggestions = useMemo(
    () => rankLocalityMatches(localities, zoneQuery, zones),
    [zoneQuery, zones, localities]
  );

  const addZone = (z: string) => {
    if (!zones.includes(z)) setZones((prev) => [...prev, z]);
    setZoneQuery("");
    setZoneDropdownOpen(false);
  };

  const removeZone = (z: string) => {
    setZones((prev) => prev.filter((zone) => zone !== z));
  };

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearAllFilters = () => {
    setZones([]);
    setZoneQuery("");
    setPropertyType("");
    setPriceMin("");
    setPriceMax("");
    setCurrency("");
    setExpanded(false);
    setAmbientes(null);
    setDormitorios(null);
    setBanos(null);
    setSuperficieMin("");
    setSuperficieMax("");
    setCochera(null);
    setAntiguedad(null);
    setSelectedAmenities(new Set());
    setDestacadas(false);
    setConVideo(false);
  };

  const hasAnyFilter =
    zones.length > 0 ||
    propertyType ||
    priceMin ||
    priceMax ||
    currency ||
    ambientes ||
    dormitorios ||
    banos ||
    superficieMin ||
    superficieMax ||
    cochera ||
    antiguedad ||
    selectedAmenities.size > 0 ||
    destacadas ||
    conVideo;

  const zoneLabel = zones.length > 0 ? zones.join(", ") : "Todas las zonas";
  const priceLabel =
    priceMin && priceMax
      ? `${priceMin}–${priceMax}`
      : priceMin
      ? `Desde ${priceMin}`
      : priceMax
      ? `Hasta ${priceMax}`
      : "";

  return (
    <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-[0_1px_0_rgba(26,34,81,0.04),0_8px_24px_-12px_rgba(26,34,81,0.08)]">
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
                placeholder="¿Dónde querés mudarte?"
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
                    key={loc.name}
                    role="option"
                    aria-selected={false}
                    className="flex items-center justify-between gap-3 cursor-pointer px-3 py-2 text-sm text-navy transition-colors hover:bg-navy-50"
                    onClick={() => addZone(loc.name)}
                  >
                    <span className="truncate">{loc.name}</span>
                    {loc.count > 0 && (
                      <span className="font-mono-price text-[11px] tabular-nums text-gray-400 flex-shrink-0">
                        {loc.count}
                      </span>
                    )}
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

          {/* Precio dropdown (min/max free inputs) */}
          <Dropdown
            label={priceLabel || "Precio"}
            value={priceLabel}
            onClear={
              priceMin || priceMax
                ? () => {
                    setPriceMin("");
                    setPriceMax("");
                  }
                : undefined
            }
          >
            {() => (
              <div className="p-3 w-64 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Mínimo"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
                  />
                  <span className="text-navy-200">—</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Máximo"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
                  />
                </div>
                <p className="text-[11px] text-navy-300">
                  Ingresá valores sin puntos ni comas
                </p>
              </div>
            )}
          </Dropdown>

          {/* Moneda */}
          <Segmented
            options={[
              { label: "USD", value: "USD" },
              { label: "ARS", value: "ARS" },
            ]}
            value={currency}
            onChange={(v) => setCurrency(v as "" | "USD" | "ARS")}
          />

          {/* Expand filters button */}
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all duration-150 active:scale-[0.98] ${
              expanded || expandedFilterCount > 0
                ? "border-magenta bg-magenta-50 text-magenta shadow-sm"
                : "border-navy-100 text-navy hover:border-navy-300 hover:bg-gray-50"
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

          {/* Quick chips — right-aligned */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDestacadas((v) => !v)}
              aria-pressed={destacadas}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                destacadas
                  ? "border-magenta bg-magenta text-white shadow-sm"
                  : "border-navy-100 text-navy hover:border-magenta hover:text-magenta"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${destacadas ? "fill-white" : ""}`} />
              Destacadas
            </button>
            <button
              type="button"
              onClick={() => setConVideo((v) => !v)}
              aria-pressed={conVideo}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                conVideo
                  ? "border-magenta bg-magenta text-white shadow-sm"
                  : "border-navy-100 text-navy hover:border-magenta hover:text-magenta"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              Con video
            </button>
          </div>
        </div>
      </div>

      {/* ---- Expanded filters ---- */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[720px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-3 border-t border-navy-100">
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
            <ToggleGroup
              label="Dormitorios"
              options={[
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4+", value: "4" },
              ]}
              value={dormitorios}
              onChange={setDormitorios}
            />
            <ToggleGroup
              label="Baños"
              options={[
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3+", value: "3" },
              ]}
              value={banos}
              onChange={setBanos}
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-navy-300">
                Superficie (m²)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={superficieMin}
                  onChange={(e) => setSuperficieMin(e.target.value)}
                  aria-label="Superficie mínima en metros cuadrados"
                  className="w-20 rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
                />
                <span className="text-navy-200">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={superficieMax}
                  onChange={(e) => setSuperficieMax(e.target.value)}
                  aria-label="Superficie máxima en metros cuadrados"
                  className="w-20 rounded-lg border border-navy-100 px-2 py-1.5 text-sm text-navy outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
                />
              </div>
            </div>

            <ToggleGroup
              label="Cochera"
              options={[
                { label: "Sí", value: "si" },
                { label: "No", value: "no" },
              ]}
              value={cochera}
              onChange={setCochera}
            />

            <ToggleGroup
              label="Antigüedad"
              options={AGE_RANGES.map((r, i) => ({
                label: r.label,
                value: String(i),
              }))}
              value={antiguedad}
              onChange={setAntiguedad}
            />
          </div>

          {/* Amenities multi-select */}
          {amenityOptions.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-navy-300 mb-2">
                Amenities{" "}
                {selectedAmenities.size > 0 && (
                  <span className="text-magenta">· {selectedAmenities.size} seleccionados</span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {amenityOptions.map((a) => {
                  const selected = selectedAmenities.has(a.name);
                  return (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => toggleAmenity(a.name)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
                        selected
                          ? "border-magenta bg-magenta text-white shadow-sm"
                          : "border-navy-100 bg-white text-navy hover:border-magenta hover:text-magenta"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {a.name}
                      <span
                        className={`font-mono-price text-[10px] tabular-nums ${
                          selected ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {a.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Sort + clear ---- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 border-t border-navy-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {zones.length > 0 && (
              <p className="text-sm text-navy-300">en {zoneLabel}</p>
            )}
            {hasAnyFilter && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-magenta hover:text-magenta/80 transition-colors"
              >
                Limpiar filtros ×
              </button>
            )}
          </div>

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
