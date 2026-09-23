/**
 * Dominio canónico del sitio · única fuente de verdad.
 *
 * Hasta 2026-09 esto estaba hardcodeado como "https://russo-prop.vercel.app"
 * en layout.tsx y en 5 metadata sueltos, así que TODAS las páginas emitían
 * `<link rel="canonical" href="https://russo-prop.vercel.app">`: le decían a
 * Google que el sitio real era el preview de Vercel y, de paso, que cada
 * página era un duplicado de la home. El preview responde 200, así que era
 * un clon indexable compitiendo con el dominio de verdad.
 *
 * Va con www porque es lo que sirve Vercel: el apex hace 307 a www.
 */
export const SITE_URL = "https://www.russopropiedades.com.ar";

/** URL absoluta a partir de un path relativo ("/ventas" → "https://…/ventas"). */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
