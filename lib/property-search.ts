import type { Property } from "@/data/types";
import { fetchAllProperties, toListProperty } from "@/lib/xintel";
import { findPOI } from "@/lib/pois";
import { geocodeAddress } from "@/lib/geocoder";

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

  /** Ambientes EXACTOS. Si el user dice "3 ambientes" → solo 3.
   *  Tiene prioridad sobre roomsMin/Max. */
  roomsExact?: number;
  /** Ambientes mínimos (≥). "Al menos 3", "3 o más". */
  roomsMin?: number;
  /** Ambientes máximos (≤). "Hasta 3 ambientes". */
  roomsMax?: number;

  bedroomsExact?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;

  bathroomsExact?: number;
  bathroomsMin?: number;

  /** Cocheras MÍNIMAS (≥). "Cochera doble" → 2. "Con cochera" → 1. */
  garageMin?: number;
  hasGarage?: boolean;

  /** Antigüedad máxima en años. "A estrenar" → 0. "Hasta 10 años" → 10. */
  ageMax?: number;
  /** Superficie cubierta mínima (m²). */
  areaMin?: number;
  areaMax?: number;
  /** Expensas máximas (en pesos ARS). "Sin expensas altas". */
  expensesMaxARS?: number;

  hasVideo?: boolean;
  /** Apto crédito hipotecario. */
  aptoCredito?: boolean;
  /** Apto financiación (cuotas con Russo). */
  aptoFinanciacion?: boolean;
  /** Apto permuta (acepta otra propiedad). */
  aptoPermuta?: boolean;
  /** Amenities deseados (matchea cualquiera por substring case-insensitive). */
  amenities?: string[];
  /** Texto libre para matchear contra dirección/locality/code (calle/barrio/RUS). */
  text?: string;
  /** Orden de los resultados.
   *  - "price_asc": más baratos primero ("los más baratos", "menor precio")
   *  - "price_desc": más caros primero ("los más caros", "mayor precio")
   *  - "newest": los más nuevos por id desc (RUS más alto)
   *  - "area_desc": más grandes primero ("los más grandes")
   *  - "area_asc": más chicos primero
   *  - default (omitir): por prioridad del equipo Russo + id desc */
  sortBy?: "price_asc" | "price_desc" | "newest" | "area_desc" | "area_asc";
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

/** Sentinel de Xintel para "Reservado / Consultar precio". No es un
 * precio real · al ordenar por precio lo tratamos como "sin precio". */
const RESERVED_PRICE = 9999999;

/** Ordena el array in-place según el sortBy del filtro. Si no hay
 * sortBy, deja el orden default de fetchAllProperties (priority desc). */
function applySort(arr: Property[], sortBy?: SearchFilters["sortBy"]): void {
  if (!sortBy) return;
  const areaOf = (p: Property) =>
    p.features.coveredArea || p.features.totalArea || 0;
  // Para sort por precio · las "Reservado" (sentinel) van al final
  // independientemente de la dirección · no tienen precio real visible.
  const priceForSort = (p: Property): number =>
    p.price === RESERVED_PRICE ? Number.MAX_SAFE_INTEGER : p.price;
  switch (sortBy) {
    case "price_asc":
      arr.sort((a, b) => priceForSort(a) - priceForSort(b));
      break;
    case "price_desc":
      arr.sort((a, b) => {
        const aReserved = a.price === RESERVED_PRICE;
        const bReserved = b.price === RESERVED_PRICE;
        if (aReserved && !bReserved) return 1; // a al final
        if (!aReserved && bReserved) return -1; // b al final
        return b.price - a.price;
      });
      break;
    case "newest":
      arr.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    case "area_desc":
      arr.sort((a, b) => areaOf(b) - areaOf(a));
      break;
    case "area_asc":
      arr.sort((a, b) => areaOf(a) - areaOf(b));
      break;
  }
}

/** Aplica todos los filtros estructurados. exactos > rangos · si el
 * user dijo "3 ambientes" (exact) gana sobre cualquier min/max. */
function matchesAllFilters(p: Property, f: SearchFilters): boolean {
  if (f.zones?.length && !matchesZones(p, f.zones)) return false;
  if (f.types?.length && !f.types.includes(p.type)) return false;
  if (f.priceCurrency && p.currency !== f.priceCurrency) return false;
  if (typeof f.priceMax === "number" && p.price > f.priceMax) return false;
  if (typeof f.priceMin === "number" && p.price < f.priceMin) return false;

  // Ambientes · exact gana sobre min/max
  const rooms = p.features.rooms ?? 0;
  if (typeof f.roomsExact === "number") {
    if (rooms !== f.roomsExact) return false;
  } else {
    if (typeof f.roomsMin === "number" && rooms < f.roomsMin) return false;
    if (typeof f.roomsMax === "number" && rooms > f.roomsMax) return false;
  }

  // Dormitorios
  const beds = p.features.bedrooms ?? 0;
  if (typeof f.bedroomsExact === "number") {
    if (beds !== f.bedroomsExact) return false;
  } else {
    if (typeof f.bedroomsMin === "number" && beds < f.bedroomsMin) return false;
    if (typeof f.bedroomsMax === "number" && beds > f.bedroomsMax) return false;
  }

  // Baños
  const baths = p.features.bathrooms ?? 0;
  if (typeof f.bathroomsExact === "number") {
    if (baths !== f.bathroomsExact) return false;
  } else if (typeof f.bathroomsMin === "number" && baths < f.bathroomsMin) {
    return false;
  }

  // Cocheras
  const garages = p.features.garage ?? 0;
  if (typeof f.garageMin === "number" && garages < f.garageMin) return false;
  if (f.hasGarage && garages === 0) return false;

  // Antigüedad
  if (typeof f.ageMax === "number") {
    const age = p.features.age;
    if (typeof age !== "number" || age > f.ageMax) return false;
  }

  // Superficie
  const area = p.features.coveredArea ?? p.features.totalArea ?? 0;
  if (typeof f.areaMin === "number" && area < f.areaMin) return false;
  if (typeof f.areaMax === "number" && area > f.areaMax) return false;

  // Otros
  if (f.hasVideo && !p.videoUrl) return false;
  if (f.aptoCredito && !p.aptoCredito) return false;
  if (f.aptoFinanciacion && !p.aptoFinanciacion) return false;
  if (f.aptoPermuta && !p.aptoPermuta) return false;
  if (f.amenities?.length && !matchesAmenities(p, f.amenities)) return false;
  if (f.text && !matchesText(p, f.text)) return false;

  return true;
}

export interface SearchResult {
  matches: Property[];
  total: number;
  /** Si el query traía operation=venta pero no encontramos nada y existe
   * algo en alquiler, lo flagueamos para que la IA pueda sugerir. */
  hint?: string;
  /** Distancias por id (en metros) cuando es búsqueda geo-espacial. */
  distancesById?: Record<string, number>;
  /** Punto de referencia resuelto, para que la IA lo confirme en su respuesta. */
  referencePoint?: {
    label: string;
    lat: number;
    lng: number;
    source: "poi" | "geocoding";
  };
}

/**
 * Distancia entre dos puntos en metros, fórmula de Haversine.
 * Suficiente para distancias urbanas (<50km).
 */
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
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

  const filtered = all.filter((p) => matchesAllFilters(p, filters));
  applySort(filtered, filters.sortBy);

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

export interface NearSearchInput extends SearchFilters {
  /** Punto de referencia textual ("estación de Ramos", "plaza San Justo",
   * "Av. Perón 3500"). Lo resolvemos contra POIs primero, fallback a
   * Google Geocoding. */
  referencePoint: string;
  /** Radio en metros. Default 1500 (~12 cuadras). Min 200, max 5000. */
  radiusMeters?: number;
}

/**
 * Búsqueda geo-espacial: propiedades a X metros de un punto. El punto
 * se resuelve primero contra la tabla local de POIs (zona oeste,
 * gratis, instantáneo) y si no hay match, hace fallback a Google
 * Geocoding (paga, pero cubre cualquier dirección).
 *
 * Combinable con todos los filtros normales (precio, ambientes, etc).
 */
export async function searchPropertiesNear(
  input: NearSearchInput,
  limit = 5
): Promise<SearchResult> {
  // 1) Resolver el punto de referencia
  const poi = findPOI(input.referencePoint);
  let refPoint:
    | { lat: number; lng: number; label: string; source: "poi" | "geocoding" }
    | null = null;
  if (poi) {
    refPoint = { lat: poi.lat, lng: poi.lng, label: poi.label, source: "poi" };
  } else {
    const geocoded = await geocodeAddress(input.referencePoint);
    if (geocoded) {
      refPoint = {
        lat: geocoded.lat,
        lng: geocoded.lng,
        label: geocoded.formattedAddress,
        source: "geocoding",
      };
    }
  }

  if (!refPoint) {
    return {
      matches: [],
      total: 0,
      hint: "reference_point_not_found",
    };
  }

  // 2) Filtros normales primero (sin geo) · partimos del listado completo
  const all = await fetchAllProperties(input.operation);
  const filtered = all.filter((p) => matchesAllFilters(p, input));

  // 3) Calcular distancias y filtrar por radio · default sort por
  //    distancia ASC; si el usuario pidió otro sort (price_asc, etc.),
  //    ese tiene prioridad sobre la distancia.
  const radius = Math.max(200, Math.min(5000, input.radiusMeters ?? 1500));
  const withDistance = filtered
    .map((p) => ({ p, d: haversineMeters(p.location, refPoint!) }))
    .filter(({ d }) => d <= radius);
  if (input.sortBy) {
    const sorted = withDistance.map((x) => x.p);
    applySort(sorted, input.sortBy);
    // Reordenar withDistance siguiendo el orden de `sorted`
    withDistance.sort(
      (a, b) => sorted.indexOf(a.p) - sorted.indexOf(b.p)
    );
  } else {
    withDistance.sort((a, b) => a.d - b.d);
  }

  let hint: string | undefined;
  if (withDistance.length === 0) {
    hint = "no_matches_in_radius";
  }

  const matchesArr = withDistance.slice(0, limit).map(({ p }) => toListProperty(p));
  const distancesById: Record<string, number> = {};
  for (const { p, d } of withDistance.slice(0, limit)) {
    distancesById[p.id] = Math.round(d);
  }

  return {
    matches: matchesArr,
    total: withDistance.length,
    hint,
    distancesById,
    referencePoint: refPoint,
  };
}
