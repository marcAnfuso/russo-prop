import type { Property, OperationType, PropertyType } from "@/data/types";

// ─── Config ────────────────────────────────────────────────────────────────

const BASE = "https://xintelapi.com.ar/";
const INM = "RUS";
// Listing key (exposed on client by Xintel's own portal — used server-side here)
const API_KEY_LIST =
  process.env.XINTEL_API_KEY_LIST ?? "0P4PRKFZZKHJHSN0BMJSK5EAN";
// Detail key (used by Xintel's property detail page)
const API_KEY_DETAIL =
  process.env.XINTEL_API_KEY_DETAIL ?? "4m17zq256jvsm24wOnqbev43y";
const GLOBAL_DETAIL =
  process.env.XINTEL_GLOBAL_DETAIL ?? "LU3AIKPR4F6ZSUY8GQODKWRO8";

// ISR revalidation: 30 minutes
export const REVALIDATE = 1800;

// ─── Raw API types ─────────────────────────────────────────────────────────

interface XintelListFicha {
  in_num: string;
  in_fic: string;
  titulo?: string;
  operacion?: string; // "Venta" | "Alquiler"
  tipo?: string;      // display string: "Casa", "Departamento", etc.
  in_tip?: string;    // single-letter code: "C", "D", etc.
  in_tpr?: string;    // internal type: "CASA", "PH", "DEPARTAMENTO", etc.
  venta_precio?: number | string | null;
  alquiler_precio?: number | string | null;
  alquiler_moneda?: string;
  venta_moneda?: string;
  precio?: string; // pre-formatted e.g. "U$S 58.500" — fallback when venta/alquiler_precio is null
  in_val?: string | number; // raw numeric value
  direccion_completa?: string;
  in_cal?: string;
  in_nro?: string;
  in_bar?: string; // barrio → locality
  in_loc?: string; // partido → district
  in_obs?: string;
  in_sup?: string;
  in_cub?: string;
  in_amb?: string | number;
  in_bau?: string | number;
  in_coc?: string | number;
  garage?: string | number;
  in_coo?: string;
  amigable?: string;
  img_princ?: string;
  in_des?: string | boolean;
  video?: string;
  cantidad_dormitorios?: string | number;
  // Detail-only fields (fichas.propiedades)
  in_pis?: string | number;   // piso
  in_dto?: string;            // depto letra/número
  in_esa?: string;            // estado (Muy Bueno, A estrenar, etc)
  in_eco?: string;            // categoría (Muy Buena, Standard, etc)
  in_ant?: string | number;   // antigüedad en años
  in_asc?: string | number;   // ascensores
  in_exp?: string | number;   // expensas (ARS)
  in_imp?: string | number;   // impuesto (ARS)
  in_agu?: string;            // agua corriente (SI/NO)
  in_ale?: string;            // agua caliente (SI/NO)
  ubicacion?: string;         // frente/contrafrente/interno
}

interface XintelDetailFicha extends XintelListFicha {
  // same fields, arrived via fichas.propiedades
}

interface XintelListResponse {
  resultado: {
    fichas: XintelListFicha[];
    img: (string | string[])[];
    total?: number;
    cantidadFichas?: number;
    paginas?: number;
    caracteristicas?: Record<string, string[]>;
    datos?: {
      cantidadFichas?: number;
      paginas?: number;
      fichasPorPagina?: number;
    };
  };
}

interface XintelDetailResponse {
  resultado: {
    ficha?: XintelDetailFicha[];
    img?: string[];
    superficie?: { title: string[]; dato: string[]; cantidad: number };
    videos?: { video_url: string }[];
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  "&ordm;": "°", "&ordf;": "ª", "&deg;": "°",
  "&aacute;": "á", "&eacute;": "é", "&iacute;": "í", "&oacute;": "ó", "&uacute;": "ú",
  "&Aacute;": "Á", "&Eacute;": "É", "&Iacute;": "Í", "&Oacute;": "Ó", "&Uacute;": "Ú",
  "&ntilde;": "ñ", "&Ntilde;": "Ñ", "&uuml;": "ü", "&Uuml;": "Ü",
  "&nbsp;": " ",
};

function decodeHtml(s?: string): string {
  if (!s) return "";
  return s.replace(/&[a-zA-Z0-9#]+;/g, (e) => HTML_ENTITIES[e] ?? e);
}

/** Normalize locality casing: "MORÓN" → "Morón", "de" / "del" stay lowercase. */
function normalizeLocality(s?: string): string {
  if (!s) return "";
  const decoded = decodeHtml(s).trim();
  if (!decoded) return "";
  const lower = decoded.toLowerCase();
  return lower
    .split(/\s+/)
    .map((word, i) => {
      if (i > 0 && (word === "de" || word === "del" || word === "la" || word === "las" || word === "los")) {
        return word;
      }
      return word.charAt(0).toLocaleUpperCase("es") + word.slice(1);
    })
    .join(" ");
}

function num(v: string | number | null | undefined): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  // Extract the first numeric token so values like "85.00m2" don't end up as 85.002
  const match = String(v).match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  const n = parseFloat(match[0].replace(",", "."));
  return isNaN(n) ? 0 : n;
}

/** Parse price from the pre-formatted "precio" string e.g. "U$S 58.500" → 58500 */
function parsePrecio(precio?: string): number {
  if (!precio) return 0;
  // Remove currency prefix, dots used as thousand separators, keep only last decimal
  const cleaned = precio.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseCoords(coo?: string): { lat: number; lng: number } {
  if (!coo) return { lat: -34.68, lng: -58.56 };
  const [lat, lng] = coo.split(",").map(parseFloat);
  return { lat: lat || -34.68, lng: lng || -58.56 };
}

function mapOperation(op?: string): OperationType {
  return op?.toLowerCase().includes("alquiler") ? "alquiler" : "venta";
}

function mapCurrency(moneda?: string): "USD" | "ARS" {
  if (!moneda) return "USD";
  const m = moneda.toLowerCase();
  if (m.includes("u$s") || m.includes("usd") || m.includes("dolar") || m.includes("dólar")) return "USD";
  return "ARS";
}

const TYPE_MAP: Record<string, PropertyType> = {
  // Xintel single-letter codes
  c: "casa",
  d: "departamento",
  e: "edificio",
  g: "local",    // Galpon
  h: "cochera",
  l: "local",
  n: "local",    // Negocio
  o: "oficina",
  p: "terreno",  // Campo
  q: "terreno",  // Quinta
  t: "terreno",  // Lote
  // full names (fallback)
  casa: "casa",
  departamento: "departamento",
  depto: "departamento",
  ph: "ph",
  "p.h.": "ph",
  terreno: "terreno",
  lote: "terreno",
  campo: "terreno",
  quinta: "terreno",
  cochera: "cochera",
  local: "local",
  negocio: "local",
  oficina: "oficina",
  galpon: "local",
  edificio: "edificio",
};

// Reverse mapping: PropertyType display value → Xintel single-letter code
const TYPE_TO_XINTEL_CODE: Record<PropertyType, string> = {
  casa: "C",
  departamento: "D",
  edificio: "E",
  cochera: "H",
  local: "L",
  oficina: "O",
  ph: "PH",
  terreno: "T",
};

function mapType(t?: string): PropertyType {
  const key = t?.toLowerCase().trim() ?? "";
  return TYPE_MAP[key] ?? "casa";
}

/** Extracts the first image URL from the img[] entry (can be string or array) */
function firstImg(entry: string | string[]): string {
  if (Array.isArray(entry)) return entry[0] ?? "";
  return entry ?? "";
}

function mapListFicha(ficha: XintelListFicha, imgs: string | string[], amenities?: string[]): Property {
  const op = mapOperation(ficha.operacion);
  const rawPrice =
    op === "alquiler"
      ? num(ficha.alquiler_precio)
      : num(ficha.venta_precio);
  // fichas.destacadas returns venta_precio/alquiler_precio as null — fallback to parsed precio
  const price = rawPrice || num(ficha.in_val) || parsePrecio(ficha.precio);
  const currency = mapCurrency(op === "alquiler" ? ficha.alquiler_moneda : ficha.venta_moneda);

  const imageList = Array.isArray(imgs) ? imgs.filter(Boolean) : [imgs].filter(Boolean);
  const mainImg = ficha.img_princ ?? firstImg(imgs);
  const images = imageList.length > 0 ? imageList : mainImg ? [mainImg] : [];

  return {
    id: String(ficha.in_num),
    code: `RUS${ficha.in_num}`,
    title: decodeHtml(ficha.titulo) || `Propiedad ${ficha.in_num}`,
    operation: op,
    type: mapType(ficha.in_tpr || ficha.tipo || ficha.in_tip),
    price,
    currency,
    address: decodeHtml(ficha.direccion_completa) || `${ficha.in_cal ?? ""} ${ficha.in_nro ?? ""}`.trim(),
    locality: normalizeLocality(ficha.in_bar),
    district: decodeHtml(ficha.in_loc),
    description: decodeHtml(ficha.in_obs?.trim()),
    features: {
      totalArea: num(ficha.in_sup),
      coveredArea: num(ficha.in_cub),
      rooms: num(ficha.in_amb),
      bathrooms: num(ficha.in_bau),
      bedrooms: num(ficha.cantidad_dormitorios),
      garage: num(ficha.in_coc) || num(ficha.garage),
    },
    amenities: amenities ?? [],
    images,
    videoUrl: ficha.video ?? undefined,
    location: parseCoords(ficha.in_coo),
    featured: String(ficha.in_des) === "True" || ficha.in_des === true,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

interface FetchPropertiesParams {
  operation?: "venta" | "alquiler";
  page?: number;
}

const PER_PAGE = 20;

function buildListUrl(params: FetchPropertiesParams, page: number): string {
  const url = new URL(BASE);
  url.searchParams.set("json", "resultados.fichas");
  url.searchParams.set("inm", INM);
  url.searchParams.set("apiK", API_KEY_LIST);
  url.searchParams.set("page", String(page));
  url.searchParams.set("rppagina", String(PER_PAGE));
  if (params.operation) {
    url.searchParams.set("ope", params.operation === "venta" ? "V" : "A");
  }
  // Note: Xintel API does not support type filtering via 'tip' parameter
  // Property type filtering is handled client-side by FilterBar component
  return url.toString();
}

async function fetchPage(
  urlStr: string
): Promise<{ fichas: XintelListFicha[]; imgs: (string | string[])[]; total: number | null; caracteristicas: Record<string, string[]> }> {
  const res = await fetch(urlStr, { next: { revalidate: REVALIDATE } });
  if (!res.ok) return { fichas: [], imgs: [], total: null, caracteristicas: {} };
  const data: XintelListResponse = await res.json();
  const total =
    data?.resultado?.datos?.cantidadFichas ??
    data?.resultado?.cantidadFichas ??
    data?.resultado?.total ??
    null;
  return {
    fichas: data?.resultado?.fichas ?? [],
    imgs: data?.resultado?.img ?? [],
    caracteristicas: data?.resultado?.caracteristicas ?? {},
    total,
  };
}

export interface FetchPropertiesResult {
  properties: Property[];
  hasMore: boolean;
  total: number | null; // null = API didn't return a total count
}

/** Fetch a single page of properties from Xintel */
export async function fetchProperties(
  params: FetchPropertiesParams = {}
): Promise<FetchPropertiesResult> {
  try {
    const page = params.page ?? 1;
    const { fichas, imgs, total, caracteristicas } = await fetchPage(buildListUrl(params, page));
    return {
      properties: fichas.map((f, i) => mapListFicha(f, imgs[i] ?? [], caracteristicas[f.in_num])),
      hasMore: fichas.length === PER_PAGE,
      total,
    };
  } catch {
    return { properties: [], hasMore: false, total: null };
  }
}

/**
 * Look up the amenities array for a property by scanning list pages
 * (Xintel only exposes `caracteristicas` keyed by id via the list endpoint —
 * the `fichas.propiedades` detail doesn't include them). Each page fetch is
 * cached for REVALIDATE seconds so repeat lookups are cheap.
 */
async function fetchAmenitiesForId(id: string, maxPages = 4): Promise<string[]> {
  for (let page = 1; page <= maxPages; page++) {
    try {
      const { caracteristicas, fichas } = await fetchPage(
        buildListUrl({}, page)
      );
      if (caracteristicas[id]) return caracteristicas[id];
      // Stop early if we've reached the last page
      if (fichas.length < PER_PAGE) break;
    } catch {
      break;
    }
  }
  return [];
}

/** Fetch single property detail (full images, superficie, video) */
export async function fetchProperty(id: string): Promise<Property | null> {
  const url = new URL(BASE);
  url.searchParams.set("json", "fichas.propiedades");
  url.searchParams.set("inm", INM);
  url.searchParams.set("suc", INM);
  url.searchParams.set("global", GLOBAL_DETAIL);
  url.searchParams.set("apiK", API_KEY_DETAIL);
  url.searchParams.set("id", id);
  url.searchParams.set("emprendimiento", "True");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const data: XintelDetailResponse = await res.json();
    const r = data?.resultado;
    if (!r) return null;

    const ficha = r.ficha?.[0];
    if (!ficha) return null;

    const imgs: string[] = Array.isArray(r.img) ? r.img.filter(Boolean) : [];
    const amenities = await fetchAmenitiesForId(String(ficha.in_num));

    // Build the `areas` list from superficie (title+dato pairs, skipping 0.00 values)
    const areas: { label: string; value: string }[] = (() => {
      const sup = r.superficie;
      if (!sup?.title || !sup?.dato) return [];
      return sup.title
        .map((label, i) => ({ label, value: sup.dato![i] }))
        .filter((a) => a.value && !/^0(?:[.,]0+)?\s*m?2?$/i.test(a.value));
    })();

    // Helpers to read optional string/numeric fields safely
    const str = (v: string | number | undefined | null): string | undefined => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && s !== "0" && s !== "-" ? s : undefined;
    };
    const n = (v: string | number | undefined | null): number | undefined => {
      const parsed = num(v);
      return parsed > 0 ? parsed : undefined;
    };
    const bool = (v: string | undefined): boolean | undefined => {
      if (!v) return undefined;
      const up = v.toUpperCase().trim();
      if (up === "SI" || up === "TRUE" || up === "S") return true;
      if (up === "NO" || up === "FALSE" || up === "N") return false;
      return undefined;
    };

    const details = {
      floor: str(ficha.in_pis),
      aptNumber: str(ficha.in_dto),
      condition: str(ficha.in_esa),
      category: str(ficha.in_eco),
      orientation: decodeHtml(str(ficha.ubicacion)) || undefined,
      elevators: n(ficha.in_asc),
      expenses: n(ficha.in_exp),
      tax: n(ficha.in_imp),
      apartmentType: decodeHtml(str(ficha.in_tpr) || str(ficha.tipo)),
      hasHotWater: bool(ficha.in_ale),
    };

    // Get covered area from superficie if available
    const coveredArea = (() => {
      const sup = r.superficie;
      if (!sup?.dato) return num(ficha.in_cub);
      const idx = sup.title?.indexOf("Cubierta") ?? -1;
      if (idx >= 0) return num(sup.dato[idx]);
      return num(ficha.in_cub);
    })();

    const op = mapOperation(ficha.operacion);
    const rawPrice =
      op === "alquiler"
        ? num(ficha.alquiler_precio)
        : num(ficha.venta_precio);
    const price = rawPrice || num(ficha.in_val) || parsePrecio(ficha.precio);
    const currency = mapCurrency(op === "alquiler" ? ficha.alquiler_moneda : ficha.venta_moneda);

    return {
      id: String(ficha.in_num),
      code: `RUS${ficha.in_num}`,
      title: decodeHtml(ficha.titulo) || `Propiedad ${ficha.in_num}`,
      operation: op,
      type: mapType(ficha.tipo),
      price,
      currency,
      address: decodeHtml(ficha.direccion_completa) || `${ficha.in_cal ?? ""} ${ficha.in_nro ?? ""}`.trim(),
      locality: normalizeLocality(ficha.in_bar),
      district: decodeHtml(ficha.in_loc),
      description: decodeHtml(ficha.in_obs?.trim()),
      features: {
        totalArea: num(ficha.in_sup),
        coveredArea,
        rooms: num(ficha.in_amb),
        bathrooms: num(ficha.in_bau),
        bedrooms: num(ficha.cantidad_dormitorios),
        garage: num(ficha.in_coc) || num(ficha.garage),
      },
      amenities,
      areas: areas.length > 0 ? areas : undefined,
      details,
      images: imgs,
      videoUrl: r.videos?.[0]?.video_url ?? ficha.video ?? undefined,
      location: parseCoords(ficha.in_coo),
      featured: String(ficha.in_des) === "True" || ficha.in_des === true,
    };
  } catch {
    return null;
  }
}

/** Fetch all property IDs for static params generation */
export async function fetchPropertyIds(): Promise<string[]> {
  const { properties } = await fetchProperties();
  return properties.map((p) => p.id);
}

/** Fetch featured properties for home page */
export async function fetchFeaturedProperties(): Promise<Property[]> {
  const url = new URL(BASE);
  url.searchParams.set("json", "fichas.destacadas");
  url.searchParams.set("inm", INM);
  url.searchParams.set("apiK", API_KEY_LIST);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      const { properties } = await fetchProperties();
      return properties.filter((p) => p.featured).slice(0, 6);
    }
    const data: XintelListResponse = await res.json();
    const fichas = data?.resultado?.fichas ?? [];
    const imgs = data?.resultado?.img ?? [];
    return fichas.slice(0, 6).map((f, i) => mapListFicha(f, imgs[i] ?? []));
  } catch {
    const { properties } = await fetchProperties();
    return properties.filter((p) => p.featured).slice(0, 6);
  }
}

/** Fetch latest properties (newest first) for home page */
export async function fetchLatestProperties(): Promise<Property[]> {
  const { properties } = await fetchProperties({ page: 1 });
  return properties.slice(0, 6);
}

/**
 * Fetch the list of localities (barrios) that Russo actually has listings in.
 * Walks up to 12 pages and aggregates unique normalized `in_bar` values.
 * Pages are cached by Next's fetch layer (REVALIDATE = 30 min).
 */
export async function fetchAvailableLocalities(maxPages = 12): Promise<string[]> {
  const seen = new Set<string>();
  for (let page = 1; page <= maxPages; page++) {
    try {
      const { fichas } = await fetchPage(buildListUrl({}, page));
      for (const f of fichas) {
        const loc = normalizeLocality(f.in_bar);
        if (loc) seen.add(loc);
      }
      if (fichas.length < PER_PAGE) break;
    } catch {
      break;
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b, "es"));
}
