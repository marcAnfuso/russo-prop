import type { Property } from "@/data/types";
import { fetchAllProperties, toListProperty } from "@/lib/xintel";

export interface SearchFilters {
  operation?: "venta" | "alquiler";
  /** Localidades / barrios. Match flexible: matchea contra `locality` o
   * `district` (case-insensitive, sin acentos). */
  zones?: string[];
  /** Tipos de propiedad: casa, departamento, ph, terreno, etc. */
  types?: string[];
  priceMax?: number;
  priceMin?: number;
  priceCurrency?: "USD" | "ARS";
  /** Ambientes mínimos. */
  roomsMin?: number;
  /** Dormitorios mínimos. */
  bedroomsMin?: number;
  bathroomsMin?: number;
  hasGarage?: boolean;
  hasVideo?: boolean;
  /** Amenities deseados (matchea cualquiera por substring case-insensitive). */
  amenities?: string[];
  /** Texto libre para matchear contra dirección/locality/code (calle/barrio/RUS). */
  text?: string;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

function matchesText(p: Property, q: string): boolean {
  const haystack = norm(
    [p.address, p.locality, p.district, p.code, p.title].filter(Boolean).join(" ")
  );
  return haystack.includes(norm(q));
}

function matchesZones(p: Property, zones: string[]): boolean {
  const targets = zones.map(norm);
  const hayLoc = norm(p.locality);
  const hayDis = norm(p.district || "");
  return targets.some((z) => hayLoc.includes(z) || hayDis.includes(z));
}

function matchesAmenities(p: Property, wanted: string[]): boolean {
  const have = p.amenities.map(norm);
  return wanted.every((w) => {
    const wn = norm(w);
    return have.some((h) => h.includes(wn));
  });
}

export interface SearchResult {
  matches: Property[];
  total: number;
  /** Si el query traía operation=venta pero no encontramos nada y existe
   * algo en alquiler, lo flagueamos para que la IA pueda sugerir. */
  hint?: string;
}

/**
 * Busca propiedades que cumplan TODOS los filtros. Devuelve top N por
 * prioridad (ya viene ordenado de fetchAllProperties). Si no hay match
 * con los filtros estrictos, sugerimos relax via `hint`.
 */
export async function searchProperties(
  filters: SearchFilters,
  limit = 5
): Promise<SearchResult> {
  const all = await fetchAllProperties(filters.operation);

  const filtered = all.filter((p) => {
    if (filters.zones?.length && !matchesZones(p, filters.zones)) return false;
    if (filters.types?.length && !filters.types.includes(p.type)) return false;
    if (filters.priceCurrency && p.currency !== filters.priceCurrency) return false;
    if (filters.priceMax && p.price > filters.priceMax) return false;
    if (filters.priceMin && p.price < filters.priceMin) return false;
    if (filters.roomsMin && (p.features.rooms ?? 0) < filters.roomsMin) return false;
    if (filters.bedroomsMin && (p.features.bedrooms ?? 0) < filters.bedroomsMin) return false;
    if (filters.bathroomsMin && (p.features.bathrooms ?? 0) < filters.bathroomsMin) return false;
    if (filters.hasGarage && (p.features.garage ?? 0) === 0) return false;
    if (filters.hasVideo && !p.videoUrl) return false;
    if (filters.amenities?.length && !matchesAmenities(p, filters.amenities)) return false;
    if (filters.text && !matchesText(p, filters.text)) return false;
    return true;
  });

  // Si no hubo match y el user fijó priceMax + priceCurrency, sugerimos
  // ampliación de presupuesto.
  let hint: string | undefined;
  if (filtered.length === 0 && filters.priceMax) {
    hint = "no_matches_price";
  } else if (filtered.length === 0 && filters.zones?.length) {
    hint = "no_matches_zone";
  } else if (filtered.length === 0) {
    hint = "no_matches_general";
  }

  return {
    matches: filtered.slice(0, limit).map(toListProperty),
    total: filtered.length,
    hint,
  };
}
