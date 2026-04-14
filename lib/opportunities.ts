import { fetchProperties } from "./xintel";
import { mockOpportunities } from "@/data/mock-opportunities";
import type { Property } from "@/data/types";

export async function fetchOpportunityProperties(): Promise<Property[]> {
  const { properties } = await fetchProperties({ page: 1 });
  if (properties.length === 0) return [];

  const mockById = new Map(
    mockOpportunities.map((m) => [m.propertyId, m.priceHistory])
  );

  const matched = properties
    .filter((p) => mockById.has(p.id))
    .map((p) => ({ ...p, priceHistory: mockById.get(p.id) }));

  if (matched.length >= 4) return matched.slice(0, 4);

  // Fallback: take first N real properties and attach mock histories round-robin
  const histories = mockOpportunities.map((m) => m.priceHistory);
  return properties.slice(0, 4).map((p, i) => ({
    ...p,
    priceHistory: histories[i % histories.length],
  }));
}
