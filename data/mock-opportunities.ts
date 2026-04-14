import type { PriceHistoryEntry } from "./types";

export interface MockOpportunity {
  propertyId: string;
  priceHistory: PriceHistoryEntry[];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockOpportunities: MockOpportunity[] = [
  {
    propertyId: "1",
    priceHistory: [
      { price: 120000, currency: "USD", date: daysAgo(18) },
      { price: 115000, currency: "USD", date: daysAgo(10) },
      { price: 112000, currency: "USD", date: daysAgo(3) },
    ],
  },
  {
    propertyId: "2",
    priceHistory: [
      { price: 95000, currency: "USD", date: daysAgo(22) },
      { price: 88000, currency: "USD", date: daysAgo(5) },
    ],
  },
  {
    propertyId: "3",
    priceHistory: [
      { price: 180000, currency: "USD", date: daysAgo(30) },
      { price: 170000, currency: "USD", date: daysAgo(14) },
      { price: 165000, currency: "USD", date: daysAgo(1) },
    ],
  },
  {
    propertyId: "4",
    priceHistory: [
      { price: 75000, currency: "USD", date: daysAgo(12) },
      { price: 69500, currency: "USD", date: daysAgo(2) },
    ],
  },
];
