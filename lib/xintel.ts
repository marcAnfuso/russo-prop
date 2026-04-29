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
  /** Prioridad de visibilidad — número que carga Russo en Xintel para
   * destacar propiedades. Mayor = sale primero. Xintel ya devuelve las
   * fichas pre-ordenadas por este campo desc. */
  in_ord2?: string | number;
  video?: string;
  tour360?: string;
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
    lista_planos?: string[] | null;
    plano?: string | null;
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

/**
 * Xintel concatena ambientes al título vía plantilla, incluso cuando la
 * ficha no tiene ese campo (locales, galpones, terrenos). Resultado:
 * "Local en alquiler San Justo 0 ambientes". Limpiamos el " 0 ambientes"
 * — nunca tiene sentido semántico.
 */
function sanitizeTitle(raw: string): string {
  return raw
    .replace(/\s+0\s+ambientes?/gi, "")
    .replace(/\s+0\s+amb\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Turn Xintel's uppercase `in_tpr` codes into user-facing subtype labels.
 * Returns undefined when the value matches the parent type (e.g. "DEPARTAMENTO"
 * for a Departamento is redundant) or when it's not a recognized residential
 * subtype.
 */
function mapSubtype(in_tpr: string | undefined, tipo: string | undefined): string | undefined {
  const key = in_tpr?.toLowerCase().trim();
  if (!key) return undefined;
  const tipoKey = tipo?.toLowerCase().trim();
  // Skip when subtype is just the parent type echoed back.
  if (key === tipoKey) return undefined;
  if (key === "casa" || key === "departamento" || key === "depto") return undefined;
  const labels: Record<string, string> = {
    duplex: "Dúplex",
    dúplex: "Dúplex",
    semipiso: "Semipiso",
    piso: "Piso",
    monoambiente: "Monoambiente",
    ph: "PH",
    loft: "Loft",
    triplex: "Tríplex",
  };
  return labels[key];
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

/**
 * Inferir moneda del string "precio" preformateado de Xintel
 * (ej: "U$S 7.000" → "USD", "$ 250.000" → "ARS"). Devuelve null si no
 * se puede inferir, para que el caller use otro fallback.
 */
function inferCurrencyFromPrecio(precio?: string): "USD" | "ARS" | null {
  if (!precio) return null;
  const m = precio.toLowerCase();
  if (m.includes("u$s") || m.includes("usd") || m.includes("dolar") || m.includes("dólar")) return "USD";
  if (m.includes("$") || m.includes("ars") || m.includes("peso")) return "ARS";
  return null;
}

function parseCoords(coo?: string): { lat: number; lng: number } {
  const fallback = { lat: -34.68, lng: -58.56 }; // San Justo, Russo HQ
  if (!coo) return fallback;
  const [lat, lng] = coo.split(",").map(parseFloat);
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return fallback;
  // Russo operates in Greater Buenos Aires — zona oeste. Anything outside
  // this box is bad data (we've seen Madrid coords and stray Córdoba/
  // Corrientes coords leak in), and a single outlier spreads the map bounds
  // across half of Argentina.
  if (lat < -36 || lat > -34 || lng < -60 || lng > -57) return fallback;
  return { lat, lng };
}

function mapOperation(op?: string): OperationType {
  return op?.toLowerCase().includes("alquiler") ? "alquiler" : "venta";
}

function mapCurrency(moneda: string | undefined, op: OperationType): "USD" | "ARS" {
  // Xintel sends "$" for ARS and "U$S" for USD. When the field is empty we
  // fall back by operation: alquileres in zona oeste are almost always ARS,
  // ventas are almost always USD. This matches the legacy russo site.
  if (!moneda || !moneda.trim()) return op === "alquiler" ? "ARS" : "USD";
  const m = moneda.toLowerCase();
  if (m.includes("u$s") || m.includes("usd") || m.includes("dolar") || m.includes("dólar")) return "USD";
  return "ARS";
}

const TYPE_MAP: Record<string, PropertyType> = {
  // Xintel single-letter codes (in_tip)
  c: "casa",
  d: "departamento",
  e: "edificio",
  g: "galpon",
  h: "cochera",
  l: "local",
  n: "negocio",
  o: "oficina",
  p: "campo",
  q: "quinta",
  t: "terreno",
  // tipo display names
  casa: "casa",
  departamento: "departamento",
  depto: "departamento",
  ph: "ph",
  "p.h.": "ph",
  terreno: "terreno",
  lote: "terreno",
  campo: "campo",
  quinta: "quinta",
  cochera: "cochera",
  local: "local",
  negocio: "negocio",
  oficina: "oficina",
  galpon: "galpon",
  galpón: "galpon",
  edificio: "edificio",
  // in_tpr subtypes (Xintel internal codes)
  duplex: "departamento",
  dúplex: "departamento",
  semipiso: "departamento",
  piso: "departamento",
  monoambiente: "departamento",
  tinglado: "galpon",
  fondo: "terreno",
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
  galpon: "G",
  negocio: "N",
  campo: "P",
  quinta: "Q",
};

function mapType(...candidates: (string | undefined)[]): PropertyType {
  // Try each candidate in order — first match wins. Fall back to the single-
  // letter code (in_tip) which Xintel always populates; we only default to
  // "casa" if nothing resolves.
  for (const raw of candidates) {
    const key = raw?.toLowerCase().trim();
    if (key && TYPE_MAP[key]) return TYPE_MAP[key];
  }
  return "casa";
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
  const monedaField = op === "alquiler" ? ficha.alquiler_moneda : ficha.venta_moneda;
  // Si caímos al string preformateado (ej: "U$S 7.000"), inferimos moneda
  // del propio string · sino el default por op (alquiler→ARS) confunde un
  // alquiler de galpón cargado en USD como pesos.
  const currency =
    !rawPrice && !num(ficha.in_val) && ficha.precio && !monedaField
      ? inferCurrencyFromPrecio(ficha.precio) ?? mapCurrency(monedaField, op)
      : mapCurrency(monedaField, op);

  const imageList = Array.isArray(imgs) ? imgs.filter(Boolean) : [imgs].filter(Boolean);
  const mainImg = ficha.img_princ ?? firstImg(imgs);
  const images = imageList.length > 0 ? imageList : mainImg ? [mainImg] : [];

  return {
    id: String(ficha.in_num),
    code: `RUS${ficha.in_num}`,
    title: sanitizeTitle(decodeHtml(ficha.titulo)) || `Propiedad ${ficha.in_num}`,
    operation: op,
    type: mapType(ficha.tipo, ficha.in_tpr, ficha.in_tip),
    subtype: mapSubtype(ficha.in_tpr, ficha.tipo),
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
    tour360Url: ficha.tour360 || undefined,
    location: parseCoords(ficha.in_coo),
    featured: String(ficha.in_des) === "True" || ficha.in_des === true,
    priority: num(ficha.in_ord2) || 0,
  };
}

/**
 * Reduce una Property a sólo los campos que las vistas de lista/mapa
 * necesitan. Al serializar 600+ propiedades al cliente, los campos
 * pesados (description HTML, amenities, details, areas, plans) hinchan
 * el HTML a casi 2 MB y Chrome mata el renderer en devices flojos.
 * El detail page re-fetchea la ficha completa igualmente.
 */
export function toListProperty(p: Property): Property {
  return {
    ...p,
    description: "",
    amenities: [],
    areas: undefined,
    plans: undefined,
    details: undefined,
    videoUrl: undefined,
    tour360Url: undefined,
    // Mantener sólo la primera imagen: cards usan images[0]; QuickView
    // y detalle ya vuelven a cargar todas desde el endpoint del detalle.
    images: p.images.length > 0 ? [p.images[0]] : [],
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
 * Fetch EVERY property for an operation in one shot. Xintel paginates at
 * 20/page; this walks until hasMore goes false. Each page fetch is cached
 * by Next for REVALIDATE seconds, so after the first hit the walk is free.
 * The list endpoint doesn't support server-side locality/rooms filtering,
 * so filter-by-barrio has to happen client-side over the full set.
 */
export async function fetchAllProperties(
  operation?: OperationType,
  maxPages = 60
): Promise<Property[]> {
  // First page gives us the total so we can parallelize the rest.
  const firstUrl = buildListUrl({ operation }, 1);
  const first = await fetchPage(firstUrl);
  const firstProps = first.fichas.map((f, i) =>
    mapListFicha(f, first.imgs[i] ?? [], first.caracteristicas[f.in_num])
  );

  const pagesToFetch: number[] = [];
  if (first.total && first.total > PER_PAGE) {
    const last = Math.min(Math.ceil(first.total / PER_PAGE), maxPages);
    for (let p = 2; p <= last; p++) pagesToFetch.push(p);
  } else if (first.fichas.length === PER_PAGE) {
    // No total reported — fall back to sequential until a short page.
    for (let p = 2; p <= maxPages; p++) pagesToFetch.push(p);
  }

  const restProps = pagesToFetch.length
    ? await Promise.all(
        pagesToFetch.map(async (page) => {
          try {
            const r = await fetchPage(buildListUrl({ operation }, page));
            return r.fichas.map((f, i) =>
              mapListFicha(f, r.imgs[i] ?? [], r.caracteristicas[f.in_num])
            );
          } catch {
            return [];
          }
        })
      )
    : [];

  const regular = firstProps.concat(...restProps);

  // Mergear con fichas.destacadas — Xintel a veces oculta del listado
  // regular propiedades que tienen `activa: 0` aunque estén marcadas como
  // destacadas e igual sean accesibles públicamente. Si Russo las marcó
  // como destacadas, claramente quiere que aparezcan en la web. Las
  // sumamos deduplicando por id.
  const destacadas = await fetchFeaturedProperties().catch(() => [] as Property[]);
  const byId = new Map<string, Property>(regular.map((p) => [p.id, p]));
  for (const p of destacadas) {
    if (operation && p.operation !== operation) continue;
    if (!byId.has(p.id)) byId.set(p.id, p);
  }
  // Filtrar propiedades con price=0 · Russo carga en Xintel propiedades
  // que están "por liberarse" sin precio aún. No queremos exponerlas al
  // público hasta que tengan precio real. El sentinel 9999999 (Reservado)
  // sí se mantiene — esa es una propiedad real con precio oculto.
  const all = Array.from(byId.values()).filter((p) => p.price > 0);

  // Aplicar overrides de prioridad del admin · si hay un valor en la
  // tabla property_priority, gana sobre el in_ord2 de Xintel. Si la
  // DB no está configurada o falla, seguimos con la prioridad de Xintel.
  try {
    const { getPriorityMap } = await import("./priorities-db");
    const overrides = await getPriorityMap();
    if (overrides.size > 0) {
      for (const p of all) {
        const ov = overrides.get(p.id);
        if (typeof ov === "number") p.priority = ov;
      }
    }
  } catch {
    // sin DB → respetamos in_ord2 que ya viene en p.priority
  }

  // Sort por prioridad desc · desempate por id desc (más nuevo primero,
  // ya que los códigos RUS son incrementales).
  all.sort((a, b) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pb !== pa) return pb - pa;
    return Number(b.id) - Number(a.id);
  });

  return all;
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

  // El endpoint de detalle NO devuelve tour360, así que paralelamente
  // traemos la versión list (filtrada por in_num=id) sólo para extraer
  // ese campo. Como ambos responses se cachean con revalidate, el costo
  // real es una sola request por deploy y propiedad.
  const tourUrl = new URL(BASE);
  tourUrl.searchParams.set("json", "resultados.fichas");
  tourUrl.searchParams.set("inm", INM);
  tourUrl.searchParams.set("apiK", API_KEY_LIST);
  tourUrl.searchParams.set("in_num", id);

  try {
    const [res, tourRes] = await Promise.all([
      fetch(url.toString(), { next: { revalidate: REVALIDATE } }),
      fetch(tourUrl.toString(), { next: { revalidate: REVALIDATE } }).catch(
        () => null
      ),
    ]);
    if (!res.ok) return null;
    const data: XintelDetailResponse = await res.json();
    const r = data?.resultado;
    if (!r) return null;

    const ficha = r.ficha?.[0];
    if (!ficha) return null;

    // Rescatar tour360 de la list (si está disponible).
    let tour360Url: string | undefined;
    if (tourRes && tourRes.ok) {
      try {
        const tourData = (await tourRes.json()) as XintelListResponse;
        const tourFicha = tourData?.resultado?.fichas?.[0];
        tour360Url = tourFicha?.tour360 || undefined;
      } catch {
        tour360Url = undefined;
      }
    }

    const imgs: string[] = Array.isArray(r.img) ? r.img.filter(Boolean) : [];
    const plans: string[] = Array.isArray(r.lista_planos)
      ? r.lista_planos.filter(Boolean)
      : r.plano
      ? [r.plano]
      : [];
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
    const monedaField = op === "alquiler" ? ficha.alquiler_moneda : ficha.venta_moneda;
    const currency =
      !rawPrice && !num(ficha.in_val) && ficha.precio && !monedaField
        ? inferCurrencyFromPrecio(ficha.precio) ?? mapCurrency(monedaField, op)
        : mapCurrency(monedaField, op);

    // Si la propiedad no tiene precio cargado todavía, no la exponemos.
    // Russo carga drafts de propiedades por liberar sin precio. Sentinel
    // 9999999 (Reservado) sí se mantiene — esa es una propiedad real.
    if (!price || price <= 0) return null;

    return {
      id: String(ficha.in_num),
      code: `RUS${ficha.in_num}`,
      title: sanitizeTitle(decodeHtml(ficha.titulo)) || `Propiedad ${ficha.in_num}`,
      operation: op,
      type: mapType(ficha.tipo, ficha.in_tpr, ficha.in_tip),
      subtype: mapSubtype(ficha.in_tpr, ficha.tipo),
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
      plans: plans.length > 0 ? plans : undefined,
      details,
      images: imgs,
      videoUrl: r.videos?.[0]?.video_url ?? ficha.video ?? undefined,
      tour360Url: tour360Url ?? ficha.tour360 ?? undefined,
      location: parseCoords(ficha.in_coo),
      featured: String(ficha.in_des) === "True" || ficha.in_des === true,
      priority: num(ficha.in_ord2) || 0,
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
      return properties.filter((p) => p.featured && p.price > 0).slice(0, 6);
    }
    const data: XintelListResponse = await res.json();
    const fichas = data?.resultado?.fichas ?? [];
    const imgs = data?.resultado?.img ?? [];
    // Devolvemos TODAS las destacadas — el caller (getHomeFeatured)
    // hace .slice(0, count) si necesita limitar. Esto le permite a
    // fetchAllProperties usarnos para mergear y rescatar propiedades
    // que están sólo en este endpoint (activa=0 en Xintel).
    // Filtramos price=0 (drafts que Russo carga sin precio aún).
    return fichas
      .map((f, i) => mapListFicha(f, imgs[i] ?? []))
      .filter((p) => p.price > 0);
  } catch {
    const { properties } = await fetchProperties();
    return properties.filter((p) => p.featured && p.price > 0).slice(0, 6);
  }
}

/** Fetch latest properties (newest first) for home page */
export async function fetchLatestProperties(): Promise<Property[]> {
  const { properties } = await fetchProperties({ page: 1 });
  return properties.slice(0, 6);
}

export interface LocalityCount {
  name: string;
  count: number;
}

export interface MarketBucket {
  count: number;
  priceFrom: number;   // USD
  priceTo: number;     // USD
  pricePerSqM: number; // USD — median
}

/** locality -> propertyType -> roomsBucket("1"|"2"|"3"|"4") -> MarketBucket */
export type MarketAggregate = Record<
  string,
  Record<string, Record<string, MarketBucket>>
>;

/**
 * Fetch the list of localities (barrios) that Russo actually has listings in,
 * with a count of how many active listings each one has.
 * Walks up to 12 pages and aggregates normalized `in_bar` values.
 * Pages are cached by Next's fetch layer (REVALIDATE = 30 min).
 */
export async function fetchAvailableLocalities(
  maxPages = 12
): Promise<LocalityCount[]> {
  const counts = new Map<string, number>();
  for (let page = 1; page <= maxPages; page++) {
    try {
      const { fichas } = await fetchPage(buildListUrl({}, page));
      for (const f of fichas) {
        const loc = normalizeLocality(f.in_bar);
        if (loc) counts.set(loc, (counts.get(loc) ?? 0) + 1);
      }
      if (fichas.length < PER_PAGE) break;
    } catch {
      break;
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Aggregate venta (USD) listings into barrio × tipo × ambientes buckets.
 * Only buckets with at least MIN_SAMPLES listings are returned; anything
 * thinner is noise and we'd rather show "sin datos suficientes" than fake it.
 */
export async function fetchMarketAggregate(
  maxPages = 20
): Promise<MarketAggregate> {
  const MIN_SAMPLES = 2;
  const buckets = new Map<string, { prices: number[]; sqms: number[] }>();

  for (let page = 1; page <= maxPages; page++) {
    try {
      const { properties, hasMore } = await fetchProperties({
        operation: "venta",
        page,
      });
      for (const p of properties) {
        if (p.currency !== "USD") continue;
        // Ambientes only make sense for residential units.
        if (p.type !== "casa" && p.type !== "departamento" && p.type !== "ph") {
          continue;
        }
        // Sanity bounds: Xintel uses 9999999 as a "Consultar" sentinel, and some
        // tests have 1/100 USD placeholders. Residential zona oeste stays well
        // under 3M.
        if (p.price < 5000 || p.price > 3_000_000) continue;
        if (!p.locality) continue;
        const rooms = p.features.rooms ?? 0;
        if (rooms <= 0) continue;
        const roomsBucket = rooms >= 4 ? "4" : String(rooms);
        const area = p.features.coveredArea ?? p.features.totalArea ?? 0;
        const k = `${p.locality}|${p.type}|${roomsBucket}`;
        const entry = buckets.get(k) ?? { prices: [], sqms: [] };
        entry.prices.push(p.price);
        // Drop absurd m² values — typos in Xintel occasionally produce 1m² lots.
        if (area >= 20 && area <= 2000) {
          const sqm = p.price / area;
          if (sqm >= 200 && sqm <= 10_000) entry.sqms.push(sqm);
        }
        buckets.set(k, entry);
      }
      if (!hasMore) break;
    } catch {
      break;
    }
  }

  const percentile = (arr: number[], p: number): number => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    if (sorted.length === 1) return sorted[0];
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  const agg: MarketAggregate = {};
  buckets.forEach((v, k) => {
    if (v.prices.length < MIN_SAMPLES) return;
    const [loc, type, rooms] = k.split("|");
    agg[loc] = agg[loc] ?? {};
    agg[loc][type] = agg[loc][type] ?? {};
    agg[loc][type][rooms] = {
      count: v.prices.length,
      // P10-P90 trims outliers (Xintel data has a long tail of test/placeholder
      // listings). Range stays honest: most listings sit inside this band.
      priceFrom: Math.round(percentile(v.prices, 10)),
      priceTo: Math.round(percentile(v.prices, 90)),
      pricePerSqM: v.sqms.length
        ? Math.round(percentile(v.sqms, 50))
        : 0,
    };
  });

  return agg;
}
