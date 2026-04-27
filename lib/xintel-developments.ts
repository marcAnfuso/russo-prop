import type { Development, DevelopmentStatus } from "@/data/types";
import { listPicks } from "./picks";

const BASE = "https://xintelapi.com.ar/";
const INM = "RUS";
const API_KEY =
  process.env.XINTEL_API_KEY_LIST ?? "0P4PRKFZZKHJHSN0BMJSK5EAN";
const REVALIDATE = 1800; // 30min

// ── Tipos de la respuesta de Xintel ─────────────────────────────────────
interface XintelEmpFicha {
  ed_idl: string;
  ed_nom: string;
  ed_cue?: string;
  ed_des?: string;
  ed_est?: string;
  ed_loc?: string;
  ed_bar?: string;
  ed_pro?: string;
  ed_cal?: string;
  ed_nro?: string;
  ed_coo?: string;
  ed_amb?: string;
  ed_am2?: string;
  ed_am3?: string;
  ed_am4?: string;
  ed_cat?: string;
  ed_asc?: string | number;
  ed_pos?: string;
  ed_po1?: string;
  ed_vid?: string;
  ed_ord?: string | number;
  tipo?: string;
  valor_desde?: number | string;
  valor_hasta?: number | string;
  img_princ?: string;
}

interface XintelEmpResponse {
  resultado: {
    emprendimiento: XintelEmpFicha[];
    img?: string[][];
    datos?: { cantidad?: number };
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────
function num(v: string | number | undefined | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseCoords(s?: string): { lat: number; lng: number } {
  if (!s) return { lat: -34.674, lng: -58.561 };
  const [latStr, lngStr] = s.split(",").map((x) => x.trim());
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: -34.674, lng: -58.561 };
  }
  return { lat, lng };
}

const STATUS_MAP: Record<string, DevelopmentStatus> = {
  terminado: "terminado",
  "en construccion": "en-construccion",
  "en construcción": "en-construccion",
  "en-construccion": "en-construccion",
  pozo: "pozo",
  "pre-venta": "pre-venta",
  preventa: "pre-venta",
  "pre venta": "pre-venta",
};

function mapStatus(s?: string): DevelopmentStatus {
  if (!s) return "en-construccion";
  return STATUS_MAP[s.toLowerCase().trim()] ?? "en-construccion";
}

/**
 * Xintel guarda hasta 4 tipologías en ed_amb..ed_am4 con formato "1A",
 * "2A". Inferimos un rango "1-4" mirando los números.
 */
function deriveRoomsRange(f: XintelEmpFicha): string {
  const tags = [f.ed_amb, f.ed_am2, f.ed_am3, f.ed_am4]
    .filter((x): x is string => Boolean(x))
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n));
  if (tags.length === 0) return "";
  const min = Math.min(...tags);
  const max = Math.max(...tags);
  return min === max ? String(min) : `${min}-${max}`;
}

/**
 * ed_pos/ed_po1 viene como "31/12/1969" o vacío. Si es <= hoy, asumimos
 * "Entregado" mostrando solo el año. Si es válido futuro, formato YYYY-MM.
 */
function formatDelivery(f: XintelEmpFicha): string {
  const raw = f.ed_pos || f.ed_po1 || "";
  if (!raw) return "";
  const m = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return raw;
  const [, , mm, yyyy] = m;
  return `${yyyy}-${mm}`;
}

function buildAddress(f: XintelEmpFicha): string {
  return `${f.ed_cal ?? ""} ${f.ed_nro ?? ""}`.trim();
}

function imagesFor(idx: number, imgs?: string[][]): string[] {
  if (!imgs || idx >= imgs.length) return [];
  return imgs[idx]?.filter(Boolean) ?? [];
}

function fichaToDevelopment(
  f: XintelEmpFicha,
  imageList: string[]
): Development {
  const idl = f.ed_idl;
  const images = imageList.length > 0
    ? imageList
    : f.img_princ
    ? [f.img_princ]
    : [];

  return {
    id: `rus${idl}`,
    code: `RUS${idl}`,
    name: f.ed_nom?.trim() ?? "",
    address: buildAddress(f),
    locality: f.ed_bar?.trim() ?? "",
    district: f.ed_loc?.trim() ?? "",
    description: f.ed_cue?.trim() ?? "",
    status: mapStatus(f.ed_est),
    deliveryDate: formatDelivery(f),
    category: f.ed_cat ?? "",
    priceFrom: num(f.valor_desde),
    priceTo: num(f.valor_hasta),
    totalUnits: 0,        // Xintel no expone este campo
    availableUnits: 0,    // Xintel no expone este campo
    roomsRange: deriveRoomsRange(f),
    areaRange: "",
    coveredAreaRange: "",
    bathrooms: 0,
    amenities: [],
    images,
    videoUrl: f.ed_vid || undefined,
    location: parseCoords(f.ed_coo),
    elevators: num(f.ed_asc) || undefined,
    featured: num(f.ed_ord) > 0 && num(f.ed_ord) <= 3, // top 3 por orden manual
  };
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Lista todos los emprendimientos cargados en Xintel.
 * Cacheado vía Next.js fetch (revalidate 30min).
 */
export async function fetchDevelopments(): Promise<Development[]> {
  const url = new URL(BASE);
  url.searchParams.set("json", "resultados.emprendimientos");
  url.searchParams.set("inm", INM);
  url.searchParams.set("apiK", API_KEY);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as XintelEmpResponse;
    const fichas = data?.resultado?.emprendimiento ?? [];
    const imgs = data?.resultado?.img;
    return fichas
      .map((f, i) => fichaToDevelopment(f, imagesFor(i, imgs)))
      // Orden por ed_ord asc (los con orden válido primero)
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  } catch {
    return [];
  }
}

export async function fetchDevelopment(id: string): Promise<Development | null> {
  const all = await fetchDevelopments();
  return all.find((d) => d.id === id) ?? null;
}

export async function fetchDevelopmentIds(): Promise<string[]> {
  const all = await fetchPublicDevelopments();
  return all.map((d) => d.id);
}

/**
 * Lista de emprendimientos para mostrar al público — filtra los que
 * el equipo escondió desde el admin (manual_picks list_key
 * "development_hidden"). El admin ve todos sin filtrar para poder
 * tocar los toggles.
 */
export async function fetchPublicDevelopments(): Promise<Development[]> {
  const [all, hidden] = await Promise.all([
    fetchDevelopments(),
    listPicks("development_hidden").catch(() => []),
  ]);
  const hiddenSet = new Set(hidden);
  return all.filter((d) => !hiddenSet.has(d.id));
}
