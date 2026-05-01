/**
 * Puntos de interés de zona oeste con coordenadas conocidas.
 * Cuando el usuario menciona "estación de Ramos", "plaza San Justo",
 * etc, miramos primero acá. Si no hay match, hacemos fallback a
 * Google Geocoding (lib/geocoder.ts).
 *
 * Las claves se normalizan (lowercase + sin acentos) en `findPOI`.
 * Los aliases ayudan a matchear variantes naturales.
 */

export interface POI {
  lat: number;
  lng: number;
  label: string;
  aliases?: string[];
}

export const POIS: Record<string, POI> = {
  // ── Estaciones · Línea Sarmiento ──────────────────────────────────────
  estacion_liniers: {
    lat: -34.6406,
    lng: -58.5176,
    label: "Estación Liniers",
    aliases: ["liniers", "estacion liniers", "tren liniers"],
  },
  estacion_ciudadela: {
    lat: -34.6394,
    lng: -58.5312,
    label: "Estación Ciudadela",
    aliases: ["ciudadela", "estacion ciudadela"],
  },
  estacion_ramos_mejia: {
    lat: -34.6437,
    lng: -58.5664,
    label: "Estación Ramos Mejía",
    aliases: [
      "ramos mejia",
      "estacion ramos",
      "estacion ramos mejia",
      "tren ramos",
      "tren ramos mejia",
    ],
  },
  estacion_haedo: {
    lat: -34.6448,
    lng: -58.5919,
    label: "Estación Haedo",
    aliases: ["haedo", "estacion haedo", "tren haedo"],
  },
  estacion_el_palomar: {
    lat: -34.6066,
    lng: -58.5985,
    label: "Estación El Palomar",
    aliases: ["el palomar", "palomar", "estacion palomar"],
  },
  estacion_moron: {
    lat: -34.6512,
    lng: -58.6178,
    label: "Estación Morón",
    aliases: ["moron", "estacion moron", "tren moron"],
  },
  estacion_castelar: {
    lat: -34.6483,
    lng: -58.6463,
    label: "Estación Castelar",
    aliases: ["castelar", "estacion castelar"],
  },
  estacion_ituzaingo: {
    lat: -34.6536,
    lng: -58.6735,
    label: "Estación Ituzaingó",
    aliases: ["ituzaingo", "estacion ituzaingo"],
  },

  // ── Estaciones · Línea Belgrano Sur ───────────────────────────────────
  estacion_san_justo: {
    lat: -34.6790,
    lng: -58.5616,
    label: "Estación San Justo (Belgrano Sur)",
    aliases: ["san justo tren", "estacion san justo"],
  },

  // ── Hospitales ────────────────────────────────────────────────────────
  hospital_paroissien: {
    lat: -34.6915,
    lng: -58.5481,
    label: "Hospital Paroissien (Isidro Casanova)",
    aliases: ["paroissien", "hospital paroissien"],
  },
  hospital_posadas: {
    lat: -34.6105,
    lng: -58.5970,
    label: "Hospital Posadas (El Palomar)",
    aliases: ["posadas", "hospital posadas"],
  },

  // ── Plazas y centros ──────────────────────────────────────────────────
  plaza_san_justo: {
    lat: -34.6770,
    lng: -58.5594,
    label: "Plaza San Justo",
    aliases: ["plaza san justo", "centro san justo"],
  },
  plaza_belgrano_ramos: {
    lat: -34.6428,
    lng: -58.5670,
    label: "Plaza Belgrano (Ramos Mejía)",
    aliases: ["plaza ramos", "plaza belgrano ramos", "centro ramos"],
  },
  plaza_moron: {
    lat: -34.6512,
    lng: -58.6190,
    label: "Plaza Morón",
    aliases: ["plaza moron", "plaza 25 de mayo moron", "centro moron"],
  },

  // ── Universidades ─────────────────────────────────────────────────────
  unlam: {
    lat: -34.6712,
    lng: -58.5644,
    label: "Universidad Nacional de La Matanza (UNLaM)",
    aliases: [
      "unlam",
      "universidad la matanza",
      "universidad nacional la matanza",
      "uni la matanza",
    ],
  },
  utn_san_justo: {
    lat: -34.6775,
    lng: -58.5635,
    label: "UTN Buenos Aires (San Justo)",
    aliases: ["utn", "utn san justo", "utn buenos aires"],
  },

  // ── Aeropuertos / accesos importantes ─────────────────────────────────
  aeropuerto_ezeiza: {
    lat: -34.8222,
    lng: -58.5358,
    label: "Aeropuerto Ezeiza (EZE)",
    aliases: ["ezeiza", "aeropuerto", "eze", "ministro pistarini"],
  },
  rotonda_san_justo: {
    lat: -34.6857,
    lng: -58.5610,
    label: "Rotonda San Justo",
    aliases: ["rotonda san justo", "rotonda"],
  },
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Busca un POI por nombre/alias. Devuelve el primero que matchee.
 * Match: substring sobre el alias normalizado, en cualquiera de sus
 * variantes. Funciona para "estacion de ramos", "ramos mejía tren",
 * "cerca de la estación de Ramos", etc.
 */
export function findPOI(query: string): POI | null {
  const q = normalize(query);
  if (!q) return null;
  for (const poi of Object.values(POIS)) {
    const candidates = [poi.label, ...(poi.aliases ?? [])].map(normalize);
    if (candidates.some((c) => q.includes(c) || c.includes(q))) {
      return poi;
    }
  }
  return null;
}

/**
 * Lista todos los POIs disponibles · útil para que la IA sepa qué
 * puede mencionar. Devolvemos sólo el label + clave para no inflar
 * el system prompt.
 */
export function listPOILabels(): string[] {
  return Object.values(POIS).map((p) => p.label);
}
