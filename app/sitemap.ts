import { fetchPropertyIds } from "@/lib/xintel";
import { developments } from "@/data/developments";
import type { MetadataRoute } from "next";

const BASE = "https://russopropiedades.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await fetchPropertyIds();

  const properties = ids.map((id) => ({
    url: `${BASE}/propiedad/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
  }));

  const devPages = developments.map((d) => ({
    url: `${BASE}/emprendimiento/${d.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily" as const },
    { url: `${BASE}/ventas`, lastModified: new Date(), changeFrequency: "daily" as const },
    { url: `${BASE}/alquileres`, lastModified: new Date(), changeFrequency: "daily" as const },
    { url: `${BASE}/emprendimientos`, lastModified: new Date(), changeFrequency: "weekly" as const },
    { url: `${BASE}/tasaciones`, lastModified: new Date(), changeFrequency: "monthly" as const },
    { url: `${BASE}/contacto`, lastModified: new Date(), changeFrequency: "monthly" as const },
    { url: `${BASE}/favoritos`, lastModified: new Date(), changeFrequency: "monthly" as const },
    ...properties,
    ...devPages,
  ];
}
