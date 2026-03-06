"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";

interface SearchBarProps {
  variant?: "hero" | "compact";
  defaultOperation?: "comprar" | "alquilar";
}

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
];

const PROPERTY_TYPES = [
  "Departamento",
  "Casa",
  "PH",
  "Terrenos y lotes",
  "Cochera",
  "Local",
  "Oficina",
];

type Operation = "comprar" | "alquilar";

export default function SearchBar({
  variant = "hero",
  defaultOperation = "comprar",
}: SearchBarProps) {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation>(defaultOperation);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [propertyType, setPropertyType] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);

  const isHero = variant === "hero";

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter localities
  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const lower = debouncedQuery.toLowerCase();
    return LOCALITIES.filter(
      (loc) =>
        loc.toLowerCase().includes(lower) && !selectedZones.includes(loc)
    );
  }, [debouncedQuery, selectedZones]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPropertyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show autocomplete when there are suggestions
  useEffect(() => {
    setShowAutocomplete(suggestions.length > 0 && query.trim().length > 0);
    setActiveIndex(-1);
  }, [suggestions, query]);

  const selectZone = useCallback(
    (zone: string) => {
      if (!selectedZones.includes(zone)) {
        setSelectedZones((prev) => [...prev, zone]);
      }
      setQuery("");
      setShowAutocomplete(false);
      inputRef.current?.focus();
    },
    [selectedZones]
  );

  const removeZone = useCallback((zone: string) => {
    setSelectedZones((prev) => prev.filter((z) => z !== zone));
  }, []);

  const handleSearch = useCallback(() => {
    const basePath = operation === "comprar" ? "/ventas" : "/alquileres";
    const params = new URLSearchParams();
    if (selectedZones.length > 0) {
      params.set("zona", selectedZones.join(","));
    }
    if (propertyType) {
      params.set("tipo", propertyType);
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }, [operation, selectedZones, propertyType, router]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowAutocomplete(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        selectZone(suggestions[activeIndex]);
      } else if (suggestions.length === 0 && query.trim() === "") {
        handleSearch();
      }
      return;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && autocompleteRef.current) {
      const items = autocompleteRef.current.querySelectorAll('[role="option"]');
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const pillBase = `rounded-full px-4 py-2 font-medium transition-colors cursor-pointer whitespace-nowrap ${
    isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"
  }`;
  const pillSelected = "bg-magenta text-white";
  const pillUnselected = "bg-white/90 text-navy border border-white/50 hover:bg-white";

  return (
    <div className={`w-full ${isHero ? "max-w-3xl" : "max-w-2xl"}`}>
      {/* Operation pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          className={`${pillBase} ${operation === "comprar" ? pillSelected : pillUnselected}`}
          onClick={() => setOperation("comprar")}
        >
          Quiero comprar
        </button>
        <button
          type="button"
          className={`${pillBase} ${operation === "alquilar" ? pillSelected : pillUnselected}`}
          onClick={() => setOperation("alquilar")}
        >
          Quiero alquilar
        </button>
        <button
          type="button"
          className={`${pillBase} ${pillUnselected}`}
          onClick={() => router.push("/tasaciones")}
        >
          Quiero vender
        </button>
        <button
          type="button"
          className={`${pillBase} ${pillUnselected}`}
          onClick={() => router.push("/emprendimientos")}
        >
          Emprendimientos
        </button>
      </div>

      {/* Search bar row */}
      <div
        className={`flex items-stretch rounded-lg overflow-visible shadow-lg ${
          isHero ? "bg-white/95 backdrop-blur-sm" : "bg-white border border-navy-100"
        }`}
      >
        {/* Zone input with autocomplete */}
        <div ref={containerRef} className="relative flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showAutocomplete}
            aria-controls="zone-listbox"
            aria-activedescendant={
              activeIndex >= 0 ? `zone-option-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            placeholder="Donde queres mudarte?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowAutocomplete(true);
            }}
            className={`w-full bg-transparent outline-none text-navy placeholder-navy-300 ${
              isHero
                ? "px-4 py-3 text-base sm:text-lg"
                : "px-3 py-2.5 text-sm"
            }`}
          />

          {/* Autocomplete dropdown */}
          {showAutocomplete && (
            <ul
              ref={autocompleteRef}
              id="zone-listbox"
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-navy-100 z-50 max-h-48 overflow-y-auto"
            >
              {suggestions.map((loc, index) => (
                <li
                  key={loc}
                  id={`zone-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    index === activeIndex
                      ? "bg-magenta-50 text-magenta"
                      : "text-navy hover:bg-navy-50"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectZone(loc);
                  }}
                >
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div
          className={`w-px self-stretch ${
            isHero ? "bg-navy-100/60 my-2" : "bg-navy-100 my-2"
          }`}
        />

        {/* Property type dropdown */}
        <div ref={propertyDropdownRef} className="relative">
          <button
            type="button"
            className={`flex items-center gap-1.5 h-full whitespace-nowrap text-navy transition-colors hover:text-magenta ${
              isHero ? "px-4 text-base sm:text-lg" : "px-3 text-sm"
            }`}
            onClick={() => setShowPropertyDropdown((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={showPropertyDropdown}
          >
            <span className={propertyType ? "text-navy" : "text-navy-300"}>
              {propertyType || "Tipo de propiedad"}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showPropertyDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showPropertyDropdown && (
            <ul
              role="listbox"
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-navy-100 z-50 min-w-[200px] overflow-hidden"
            >
              {PROPERTY_TYPES.map((type) => (
                <li
                  key={type}
                  role="option"
                  aria-selected={propertyType === type}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    propertyType === type
                      ? "bg-magenta-50 text-magenta font-medium"
                      : "text-navy hover:bg-navy-50"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setPropertyType(type === propertyType ? "" : type);
                    setShowPropertyDropdown(false);
                  }}
                >
                  {type}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          aria-label="Buscar propiedades"
          className={`bg-magenta text-white flex items-center justify-center transition-colors hover:bg-magenta-600 ${
            isHero
              ? "px-5 py-3"
              : "px-4 py-2.5"
          }`}
        >
          <Search className={isHero ? "h-5 w-5" : "h-4 w-4"} />
        </button>
      </div>

      {/* Zone chips */}
      {selectedZones.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedZones.map((zone) => (
            <span
              key={zone}
              className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
                isHero
                  ? "bg-white/90 text-navy px-3 py-1.5 text-sm"
                  : "bg-navy-50 text-navy px-2.5 py-1 text-xs"
              }`}
            >
              {zone}
              <button
                type="button"
                onClick={() => removeZone(zone)}
                aria-label={`Quitar ${zone}`}
                className="hover:text-magenta transition-colors"
              >
                <X className={isHero ? "h-4 w-4" : "h-3.5 w-3.5"} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
