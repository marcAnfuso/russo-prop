import { NextRequest, NextResponse } from "next/server";

/**
 * Compatibilidad con el sitio anterior · Google todavía tiene indexadas
 * URLs del tipo:
 *   /propiedades?p=2&b=All&ope=V&tipo=All&loc=All&b=All&a1=All
 * y hasta ahora todas daban 404, tirando a la basura la autoridad que
 * esas páginas juntaron durante años.
 *
 * Traducimos lo que se puede al catálogo nuevo y mandamos 301 (permanente,
 * a diferencia del 308 de /ficha) para que el buscador transfiera el peso
 * a la URL nueva y termine sacando la vieja del índice.
 *
 * `p` (la página del sitio viejo) se descarta a propósito: el orden del
 * catálogo cambió, así que la página 5 de antes no es la página 5 de ahora
 * y mandaríamos a la gente a cualquier lado.
 */

/** Códigos de tipo del Xintel viejo → slug que entiende el FilterBar. */
const LEGACY_TYPE: Record<string, string> = {
  C: "casa",
  D: "departamento",
  E: "edificio",
  G: "galpon",
  H: "cochera",
  L: "local",
  N: "negocio",
  O: "oficina",
  P: "campo",
  Q: "quinta",
  T: "terreno",
  PH: "ph",
};

export function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams;

  const ope = (qs.get("ope") ?? "").trim().toUpperCase();
  const basePath = ope === "A" ? "/alquileres" : "/ventas";

  const params = new URLSearchParams();

  const tipo = (qs.get("tipo") ?? "").trim().toUpperCase();
  const slug = LEGACY_TYPE[tipo];
  if (slug) params.set("type", slug);

  // El sitio viejo mandaba "All" como sentinel de "sin filtro".
  const loc = (qs.get("loc") ?? "").trim();
  if (loc && loc.toLowerCase() !== "all") params.set("zones", loc);

  const target = params.toString() ? `${basePath}?${params}` : basePath;
  return NextResponse.redirect(new URL(target, req.url), 301);
}
