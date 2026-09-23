import { fetchAllProperties } from "@/lib/xintel";
import { fetchDevelopmentIds } from "@/lib/xintel-developments";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

/**
 * Hasta 2026-09 esto usaba `fetchPropertyIds()`, que por debajo llama a
 * `fetchProperties()` — UNA página de 20. El sitemap publicado tenía 38 URLs
 * en total para un catálogo de ~750 fichas. Ahora camina el listado completo.
 *
 * `fetchAllProperties` está cacheado (REVALIDATE = 30 min) y las listas ya lo
 * llaman en cada render, así que el sitemap no agrega carga extra a Xintel.
 */
export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ventas, alquileres, devIds] = await Promise.all([
    fetchAllProperties("venta").catch(() => []),
    fetchAllProperties("alquiler").catch(() => []),
    fetchDevelopmentIds().catch(() => []),
  ]);

  const now = new Date();

  const properties = [...ventas, ...alquileres].map((p) => ({
    url: `${SITE_URL}/propiedad/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const devPages = devIds.map((id) => ({
    url: `${SITE_URL}/emprendimiento/${id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = (
    [
      { path: "", freq: "daily", priority: 1 },
      { path: "/ventas", freq: "daily", priority: 0.9 },
      { path: "/alquileres", freq: "daily", priority: 0.9 },
      { path: "/emprendimientos", freq: "weekly", priority: 0.8 },
      { path: "/barrios", freq: "weekly", priority: 0.7 },
      { path: "/tasaciones", freq: "monthly", priority: 0.7 },
      { path: "/nosotros", freq: "monthly", priority: 0.6 },
      { path: "/historias", freq: "weekly", priority: 0.6 },
      { path: "/creditos", freq: "monthly", priority: 0.5 },
      { path: "/contacto", freq: "monthly", priority: 0.5 },
    ] as const
  ).map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  // /favoritos queda afuera a propósito: vive en el localStorage del
  // visitante, para Google es siempre una lista vacía.
  return [...staticPages, ...properties, ...devPages];
}
