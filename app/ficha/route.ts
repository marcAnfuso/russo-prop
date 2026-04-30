import { NextRequest, NextResponse } from "next/server";

/**
 * Compatibilidad con el panel de Xintel · cuando un agente clickea
 * "Ver en mi sitio" desde el back-office, Xintel arma la URL como:
 *   https://www.russopropiedades.com.ar/ficha?ficha=RUS10939
 * Nuestra estructura usa /propiedad/[id] (sin el prefijo "RUS"), así
 * que normalizamos el ficha y redirigimos con 308 para que el browser
 * (y los buscadores) memoricen la URL canónica.
 *
 * Variantes que aceptamos:
 *   ?ficha=RUS10939   → /propiedad/10939
 *   ?ficha=10939      → /propiedad/10939
 *   ?ficha=rus10939   → /propiedad/10939
 * Si falta o es inválido, mandamos a /ventas (catálogo general).
 */
export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ficha") ?? "";
  const id = raw.trim().replace(/\D+/g, "");
  if (!id) {
    return NextResponse.redirect(new URL("/ventas", req.url), 308);
  }
  return NextResponse.redirect(new URL(`/propiedad/${id}`, req.url), 308);
}
