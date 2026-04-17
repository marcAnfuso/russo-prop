import type { Property } from "@/data/types";
import {
  fetchAllProperties,
  fetchFeaturedProperties,
  fetchLatestProperties,
} from "./xintel";
import { listPicks, rotateDaily } from "./picks";

/**
 * Featured properties shown on the home.
 *
 * Priority:
 *   1. Manual picks from /admin (rotated daily so the 4 shown today
 *      are different from the 4 shown tomorrow).
 *   2. Fallback to Xintel's fichas.destacadas feed, filtered to Russo's
 *      `featured` flag.
 */
export async function getHomeFeatured(count = 4): Promise<Property[]> {
  try {
    const picks = await listPicks("featured");
    if (picks.length > 0) {
      const [ventas, alquileres] = await Promise.all([
        fetchAllProperties("venta"),
        fetchAllProperties("alquiler"),
      ]);
      const byId = new Map([...ventas, ...alquileres].map((p) => [p.id, p]));
      const pool = picks
        .map((id) => byId.get(id))
        .filter((p): p is Property => !!p);
      if (pool.length > 0) {
        return rotateDaily(pool, count);
      }
    }
  } catch {
    // DB down or unreachable — fall through to Xintel defaults.
  }
  const fallback = await fetchFeaturedProperties();
  return fallback.slice(0, count);
}

/**
 * "Nuevos ingresos" section.
 *
 * Priority:
 *   1. Manual picks from /admin (the ones Russo marked as new, which
 *      auto-expire after 30 days).
 *   2. Fallback to Xintel's most-recent listings.
 */
export async function getHomeNewListings(count = 6): Promise<Property[]> {
  try {
    const picks = await listPicks("new");
    if (picks.length > 0) {
      const [ventas, alquileres] = await Promise.all([
        fetchAllProperties("venta"),
        fetchAllProperties("alquiler"),
      ]);
      const byId = new Map([...ventas, ...alquileres].map((p) => [p.id, p]));
      const pool = picks
        .map((id) => byId.get(id))
        .filter((p): p is Property => !!p);
      if (pool.length > 0) {
        return pool.slice(0, count);
      }
    }
  } catch {
    // DB down or unreachable — fall through.
  }
  const fallback = await fetchLatestProperties();
  return fallback.slice(0, count);
}
