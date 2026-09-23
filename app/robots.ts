import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

/**
 * No existía · /robots.txt daba 404. Sin esto no declaramos el sitemap y
 * dejamos que los crawlers se coman el admin, los prototipos de /lab y las
 * rutas de API, que no aportan nada al índice y queman presupuesto de crawl.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/lab", "/lab/", "/demo/", "/favoritos", "/alertas/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
