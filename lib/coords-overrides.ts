import { sql } from "./db";

export type CoordsStatus = "pending" | "applied" | "ignored";

export interface CoordsOverrideRow {
  xintel_id: string;
  lat: number;
  lng: number;
  /** Coords originales de Xintel · guardamos para mostrar comparación */
  original_lat: number | null;
  original_lng: number | null;
  source: "geocoded-google" | "manual";
  status: CoordsStatus;
  notes: string | null;
  geocoded_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
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
  // Migración aditiva · agregar columnas para flujo de revisión
  await db`ALTER TABLE property_coords_override ADD COLUMN IF NOT EXISTS original_lat DOUBLE PRECISION`;
  await db`ALTER TABLE property_coords_override ADD COLUMN IF NOT EXISTS original_lng DOUBLE PRECISION`;
  await db`ALTER TABLE property_coords_override ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'applied'`;
  await db`ALTER TABLE property_coords_override ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;
  await db`ALTER TABLE property_coords_override ADD COLUMN IF NOT EXISTS reviewed_by TEXT`;
  await db`CREATE INDEX IF NOT EXISTS idx_coords_status ON property_coords_override (status)`;
}

/**
 * Devuelve un Map<xintel_id, {lat, lng}> SOLO con los overrides en
 * estado 'applied'. Los 'pending' (a la espera de aprobación de Ramita)
 * y los 'ignored' (descartados) NO afectan al feed público.
 */
export async function getCoordsOverrideMap(): Promise<
  Map<string, { lat: number; lng: number }>
> {
  await ensureCoordsSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, lat, lng FROM property_coords_override
    WHERE status = 'applied'
  `) as Array<{ xintel_id: string; lat: number; lng: number }>;
  const map = new Map<string, { lat: number; lng: number }>();
  for (const r of rows) map.set(r.xintel_id, { lat: r.lat, lng: r.lng });
  return map;
}

export async function setCoordsOverride(params: {
  xintelId: string;
  lat: number;
  lng: number;
  originalLat?: number | null;
  originalLng?: number | null;
  source?: "geocoded-google" | "manual";
  status?: CoordsStatus;
  notes?: string | null;
}): Promise<void> {
  await ensureCoordsSchema();
  const db = sql();
  await db`
    INSERT INTO property_coords_override (
      xintel_id, lat, lng, original_lat, original_lng, source, status, notes, geocoded_at
    )
    VALUES (
      ${params.xintelId},
      ${params.lat},
      ${params.lng},
      ${params.originalLat ?? null},
      ${params.originalLng ?? null},
      ${params.source ?? "geocoded-google"},
      ${params.status ?? "pending"},
      ${params.notes ?? null},
      now()
    )
    ON CONFLICT (xintel_id) DO UPDATE SET
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      original_lat = COALESCE(EXCLUDED.original_lat, property_coords_override.original_lat),
      original_lng = COALESCE(EXCLUDED.original_lng, property_coords_override.original_lng),
      source = EXCLUDED.source,
      notes = EXCLUDED.notes,
      geocoded_at = now()
  `;
}

/** Marca un override como aprobado (Ramita acepta la coord propuesta). */
export async function approveCoordsOverride(
  xintelId: string,
  reviewedBy: string
): Promise<void> {
  await ensureCoordsSchema();
  const db = sql();
  await db`
    UPDATE property_coords_override
    SET status = 'applied', reviewed_at = now(), reviewed_by = ${reviewedBy}
    WHERE xintel_id = ${xintelId}
  `;
}

/** Marca un override como ignorado · se queda con las coords de Xintel. */
export async function ignoreCoordsOverride(
  xintelId: string,
  reviewedBy: string
): Promise<void> {
  await ensureCoordsSchema();
  const db = sql();
  await db`
    UPDATE property_coords_override
    SET status = 'ignored', reviewed_at = now(), reviewed_by = ${reviewedBy}
    WHERE xintel_id = ${xintelId}
  `;
}

export async function listCoordsOverrides(
  filter?: CoordsStatus
): Promise<CoordsOverrideRow[]> {
  await ensureCoordsSchema();
  const db = sql();
  const rows = filter
    ? ((await db`
        SELECT xintel_id, lat, lng, original_lat, original_lng, source, status, notes,
          to_char(geocoded_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS geocoded_at,
          to_char(reviewed_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS reviewed_at,
          reviewed_by
        FROM property_coords_override
        WHERE status = ${filter}
        ORDER BY geocoded_at DESC
      `) as CoordsOverrideRow[])
    : ((await db`
        SELECT xintel_id, lat, lng, original_lat, original_lng, source, status, notes,
          to_char(geocoded_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS geocoded_at,
          to_char(reviewed_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS reviewed_at,
          reviewed_by
        FROM property_coords_override
        ORDER BY geocoded_at DESC
      `) as CoordsOverrideRow[]);
  return rows;
}

export async function deleteCoordsOverride(xintelId: string): Promise<void> {
  await ensureCoordsSchema();
  const db = sql();
  await db`DELETE FROM property_coords_override WHERE xintel_id = ${xintelId}`;
}

/** IDs de overrides "ignored" · para excluirlos del detector de sospechosas. */
export async function getIgnoredIds(): Promise<Set<string>> {
  await ensureCoordsSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id FROM property_coords_override WHERE status = 'ignored'
  `) as Array<{ xintel_id: string }>;
  return new Set(rows.map((r) => r.xintel_id));
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

/**
 * Limpia una dirección de Xintel para mandar a Google Geocoding.
 * Xintel usa formato local ("CALLE al ALTURA", "APELLIDO, NOMBRE",
 * "1º A" para piso/depto, abreviaturas tipo "AV." "DR." "CNEL.")
 * que confunden al geocoder · al sanitizar pasamos de 8% a 90%
 * de aciertos a nivel calle.
 */
export function cleanXintelAddress(raw: string): string {
  if (!raw) return "";
  let s = raw.toString().toUpperCase();

  // Sacar piso/depto al final de la dirección · "1º A", "3º D",
  // "PB 1", "5° 12". Estos siempre vienen DESPUÉS de la altura.
  // Borramos el número-letra-º-letra completo, no preservamos nada.
  s = s.replace(/\s+\d+\s*[ºoO°]\s*\w+\s*$/i, "");
  s = s.replace(/\s+\d+\s*[ºoO°]\s*\d*\s*$/i, "");
  s = s.replace(/\s+PB\s*\w*\s*$/i, "");

  // Patrón "CALLE al NUMERO" · sacar "al"
  s = s.replace(/\s+al\s+/gi, " ");

  // Expandir abreviaturas y QUITAR el punto
  const ABREV: Record<string, string> = {
    AV: "AVENIDA",
    CNEL: "CORONEL",
    GRAL: "GENERAL",
    DR: "DOCTOR",
    DRA: "DOCTORA",
    LDOR: "LIBERTADOR",
    PTE: "PRESIDENTE",
    PRES: "PRESIDENTE",
    STA: "SANTA",
    STO: "SANTO",
  };
  for (const [k, v] of Object.entries(ABREV)) {
    // Reemplazo del patrón "CNEL." y "CNEL " (con o sin punto, pero como palabra completa)
    s = s.replace(new RegExp(`\\b${k}\\.`, "g"), v);
    s = s.replace(new RegExp(`\\b${k}\\b(?=\\s)`, "g"), v);
  }

  // Formato "APELLIDO, NOMBRE" → "NOMBRE APELLIDO" (Xintel lo carga
  // al revés a veces). Solo si después hay número (= dirección).
  s = s.replace(
    /^([A-ZÁÉÍÓÚÑ ]+?),\s+([A-ZÁÉÍÓÚÑ ]+?)(\s+\d+)/,
    "$2 $1$3"
  );

  // Limpiar espacios y comas sobrantes
  s = s.replace(/\s*,\s*$/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
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
  /** Flag · se setea cuando el barrio o tipo está en lista de "complicados"
   * (Canning, Ciudad Evita, 9 de Abril, campos, quintas). El detector
   * sigue marcando como sospechosa, pero el cliente lo muestra con un
   * badge "posible caso especial" para que Ramita revise con cuidado. */
  specialCase?: boolean;
  specialReason?: string;
}

/**
 * Barrios donde Russo suele cargar coords manualmente porque la
 * dirección es ambigua (loteos, barrios cerrados sin altura clara).
 * NO los excluimos del detector · solo los marcamos para que Ramita
 * los revise con más cuidado.
 */
const BARRIOS_COMPLICADOS: Record<string, string> = {
  canning: "Canning",
  "lagos de canning": "Lagos de Canning",
  "lagos de canning 1": "Lagos de Canning",
  "ciudad evita": "Ciudad Evita",
  "9 de abril": "9 de Abril",
};

const TIPOS_COMPLICADOS: Record<string, string> = {
  campo: "tipo Campo",
  quinta: "tipo Quinta",
};

/**
 * Determina si una coordenada es sospechosa. SIEMPRE evalúa bbox y
 * distancia al centroide. Si además matchea con un barrio o tipo
 * "complicado", marca specialCase para que el UI muestre advertencia.
 */
export function checkCoordsSuspect(
  lat: number,
  lng: number,
  barrio: string,
  tipo?: string
): SuspectCheck {
  const barNorm = normalize(barrio);
  let specialCase: string | undefined;
  if (barNorm in BARRIOS_COMPLICADOS) {
    specialCase = BARRIOS_COMPLICADOS[barNorm];
  } else if (tipo && tipo.toLowerCase() in TIPOS_COMPLICADOS) {
    specialCase = TIPOS_COMPLICADOS[tipo.toLowerCase()];
  }

  const baseSpecial = specialCase
    ? { specialCase: true, specialReason: specialCase }
    : {};

  if (
    lat < BBOX.latMin ||
    lat > BBOX.latMax ||
    lng < BBOX.lngMin ||
    lng > BBOX.lngMax
  ) {
    return { isSuspect: true, reason: "fuera_bbox", ...baseSpecial };
  }
  const centroide = CENTROIDES[barNorm];
  if (!centroide) {
    return { isSuspect: false, reason: "barrio_desconocido", ...baseSpecial };
  }
  const distanceKm = haversineKm({ lat, lng }, centroide);
  if (distanceKm > SUSPECT_THRESHOLD_KM) {
    return { isSuspect: true, reason: "lejos_barrio", distanceKm, ...baseSpecial };
  }
  return { isSuspect: false, distanceKm, ...baseSpecial };
}
