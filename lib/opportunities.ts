import type { Property } from "@/data/types";
import { fetchOpportunityPropertiesReal } from "./price-drops";

/**
 * Real price-drop opportunities built on top of the daily snapshots.
 * If we don't have enough history yet (or the query fails), returns [].
 * The home section hides itself gracefully when empty, so no mock
 * fallback — vendemos humo is exactly what we said we wouldn't do.
 */
export async function fetchOpportunityProperties(): Promise<Property[]> {
  return fetchOpportunityPropertiesReal();
}
