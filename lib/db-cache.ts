import { revalidateTag } from "next/cache";

/**
 * Caché de las lecturas de la base para el sitio público.
 *
 * Neon cobra por horas despierta y se duerme a los 5 minutos sin uso. Con
 * las lecturas cacheadas 2 minutos (como estaban hasta octubre de 2026),
 * cualquier visita — o Google rastreando de madrugada — la volvía a
 * despertar, y nunca dormía. Eso agotó el plan gratuito el 20/10/2026.
 *
 * Ahora las lecturas públicas no vencen solas: quedan cacheadas hasta que
 * alguien escribe (cada función que escribe llama a invalidarLecturasDB) o
 * hasta el refresco diario de las 08:00 que hace el cron de analítica.
 * Así un "marcar vendida" en el admin se ve al instante y la base no se
 * despierta por lecturas.
 *
 * Llevan también el tag "xintel" para que el botón "Actualizar Xintel"
 * del admin refresque todo junto.
 */
export const TAG_DB = "db";
export const TAGS_LECTURAS_DB = [TAG_DB, "xintel"];

/** Sin vencimiento por tiempo: la invalidación es explícita. */
export const LECTURA_DB = { revalidate: false as const, tags: TAGS_LECTURAS_DB };

/**
 * Tira la caché de todas las lecturas de la base. La siguiente visita
 * vuelve a leer (la base ya está despierta por la escritura que la llamó).
 *
 * `expire: 0` vence en el acto: con el perfil por defecto la primera
 * visita después de editar todavía vería el dato viejo.
 */
export function invalidarLecturasDB(): void {
  try {
    revalidateTag(TAG_DB, { expire: 0 });
  } catch {
    // Fuera de un request de Next (scripts, seeds por CLI) no hay caché
    // que invalidar.
  }
}
