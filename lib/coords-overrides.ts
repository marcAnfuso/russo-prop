import { sql } from "./db";

export interface CoordsOverrideRow {
  xintel_id: string;
  lat: number;
  lng: number;
  source: "geocoded-google" | "manual";
  notes: string | null;
  geocoded_at: string;
}

export async function ensureCoordsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS property_coords_override (
      xintel_id TEXT PRIMARY KEY,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      source TEXT NOT NULL DEFAULT 'geocoded-google',
      notes TEXT,
      geocoded_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

/**
 * Devuelve un Map<xintel_id, {lat, lng}> con todos los overrides.
 * Lo usa el feed para reemplazar coords mal cargadas en Xintel.
 */
export async function getCoordsOverrideMap(): Promise<
  Map<string, { lat: number; lng: number }>
> {
  await ensureCoordsSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, lat, lng FROM property_coords_override
  `) as Array<{ xintel_id: string; lat: number; lng: number }>;
  const map = new Map<string, { lat: number; lng: number }>();
  for (const r of rows) map.set(r.xintel_id, { lat: r.lat, lng: r.lng });
  return map;
}

export async function setCoordsOverride(params: {
  xintelId: string;
  lat: number;
  lng: number;
  source?: "geocoded-google" | "manual";
  notes?: string | null;
}): Promise<void> {
  await ensureCoordsSchema();
  const db = sql();
  await db`
    INSERT INTO property_coords_override (xintel_id, lat, lng, source, notes, geocoded_at)
    VALUES (
      ${params.xintelId},
      ${params.lat},
      ${params.lng},
      ${params.source ?? "geocoded-google"},
      ${params.notes ?? null},
      now()
    )
    ON CONFLICT (xintel_id) DO UPDATE SET
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      source = EXCLUDED.source,
      notes = EXCLUDED.notes,
      geocoded_at = now()
  `;
}

export async function listCoordsOverrides(): Promise<CoordsOverrideRow[]> {
  await ensureCoordsSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, lat, lng, source, notes,
      to_char(geocoded_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS geocoded_at
    FROM property_coords_override
    ORDER BY geocoded_at DESC
  `) as CoordsOverrideRow[];
  return rows;
}

export async function deleteCoordsOverride(xintelId: string): Promise<void> {
  await ensureCoordsSchema();
  const db = sql();
  await db`DELETE FROM property_coords_override WHERE xintel_id = ${xintelId}`;
}

// ─── Detección de coords sospechosas ────────────────────────────────────

/** Centroides aprox de barrios de zona oeste GBA. */
const CENTROIDES: Record<string, { lat: number; lng: number }> = {
  "san justo": { lat: -34.6735, lng: -58.5565 },
  "ramos mejia": { lat: -34.6515, lng: -58.564 },
  haedo: { lat: -34.6385, lng: -58.5945 },
  moron: { lat: -34.6515, lng: -58.6195 },
  "lomas del mirador": { lat: -34.684, lng: -58.517 },
  "la tablada": { lat: -34.662, lng: -58.531 },
  tablada: { lat: -34.662, lng: -58.531 },
  "villa luzuriaga": { lat: -34.67, lng: -58.581 },
  castelar: { lat: -34.647, lng: -58.644 },
  ituzaingo: { lat: -34.653, lng: -58.67 },
  ciudadela: { lat: -34.639, lng: -58.5305 },
  "isidro casanova": { lat: -34.7035, lng: -58.5635 },
  "aldo bonzi": { lat: -34.7, lng: -58.504 },
  "gonzalez catan": { lat: -34.772, lng: -58.647 },
  "rafael castillo": { lat: -34.725, lng: -58.599 },
  "el palomar": { lat: -34.616, lng: -58.6075 },
  "villa madero": { lat: -34.6755, lng: -58.497 },
  "villa sarmiento": { lat: -34.6435, lng: -58.578 },
  "william morris": { lat: -34.623, lng: -58.684 },
  hurlingham: { lat: -34.5905, lng: -58.639 },
  tapiales: { lat: -34.671, lng: -58.5025 },
  "gregorio de laferrere": { lat: -34.746, lng: -58.587 },
  laferrere: { lat: -34.746, lng: -58.587 },
  "parque san martin": { lat: -34.6395, lng: -58.621 },
  "villa tesei": { lat: -34.5985, lng: -58.666 },
  "9 de abril": { lat: -34.83, lng: -58.51 },
  "ciudad evita": { lat: -34.7, lng: -58.535 },
  "villa celina": { lat: -34.6815, lng: -58.484 },
  "villa lugano": { lat: -34.679, lng: -58.467 },
  mataderos: { lat: -34.661, lng: -58.503 },
  "lagos de canning 1": { lat: -34.948, lng: -58.508 },
  "lagos de canning": { lat: -34.948, lng: -58.508 },
  canning: { lat: -34.946, lng: -58.495 },
};

const BBOX = {
  latMin: -34.85,
  latMax: -34.55,
  lngMin: -58.8,
  lngMax: -58.43,
};
const SUSPECT_THRESHOLD_KM = 2.5;

function normalize(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const lat1 = toRad(a.lat),
    lat2 = toRad(b.lat);
  const dLat = lat2 - lat1;
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export interface SuspectCheck {
  isSuspect: boolean;
  reason?: "fuera_bbox" | "lejos_barrio" | "barrio_desconocido";
  distanceKm?: number;
}

/**
 * Determina si una coordenada es sospechosa (probablemente mal cargada
 * en Xintel). Usa:
 *   1. Bounding box de zona oeste GBA · si está afuera, sospechosa
 *   2. Distancia al centroide del barrio declarado · si > 2.5 km, sospechosa
 *   3. Si el barrio no es conocido, NO juzgamos (devuelve isSuspect=false
 *      pero con reason="barrio_desconocido" para que el caller decida)
 */
export function checkCoordsSuspect(
  lat: number,
  lng: number,
  barrio: string
): SuspectCheck {
  if (
    lat < BBOX.latMin ||
    lat > BBOX.latMax ||
    lng < BBOX.lngMin ||
    lng > BBOX.lngMax
  ) {
    return { isSuspect: true, reason: "fuera_bbox" };
  }
  const centroide = CENTROIDES[normalize(barrio)];
  if (!centroide) {
    return { isSuspect: false, reason: "barrio_desconocido" };
  }
  const distanceKm = haversineKm({ lat, lng }, centroide);
  if (distanceKm > SUSPECT_THRESHOLD_KM) {
    return { isSuspect: true, reason: "lejos_barrio", distanceKm };
  }
  return { isSuspect: false, distanceKm };
}
