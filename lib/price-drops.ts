import { sql } from "./db";
import { fetchAllProperties } from "./xintel";
import type { Property, PriceHistoryEntry } from "@/data/types";

export interface PriceDrop {
  propertyId: string;
  firstPrice: number;
  currentPrice: number;
  diff: number;
  pct: number;
  firstDate: string;
  lastDate: string;
  currency: "USD" | "ARS";
  operation: "venta" | "alquiler";
}

/**
 * Query the snapshot table for properties whose price dropped between the
 * earliest snapshot we have and today. Window is bounded to the last
 * `days` days so we don't pick up ancient changes once the snapshot
 * history grows long.
 */
export async function fetchPriceDrops(opts?: {
  days?: number;
  minPctDrop?: number;
  minUsdDrop?: number;
  minArsDrop?: number;
  limit?: number;
}): Promise<PriceDrop[]> {
  const days = opts?.days ?? 30;
  const minPct = opts?.minPctDrop ?? 2;
  const minUsd = opts?.minUsdDrop ?? 3000;
  const minArs = opts?.minArsDrop ?? 30000;
  const limit = opts?.limit ?? 20;

  const db = sql();
  try {
    const rows = (await db`
      WITH windowed AS (
        SELECT *
        FROM price_snapshots
        WHERE snapshot_date >= CURRENT_DATE - (${days}::int || ' days')::interval
          AND price > 1000
          AND price < 5000000
      ),
      first_last AS (
        SELECT
          property_id,
          operation,
          currency,
          FIRST_VALUE(price) OVER (PARTITION BY property_id ORDER BY snapshot_date ASC) AS first_price,
          FIRST_VALUE(price) OVER (PARTITION BY property_id ORDER BY snapshot_date DESC) AS last_price,
          FIRST_VALUE(snapshot_date) OVER (PARTITION BY property_id ORDER BY snapshot_date ASC) AS first_date,
          FIRST_VALUE(snapshot_date) OVER (PARTITION BY property_id ORDER BY snapshot_date DESC) AS last_date,
          ROW_NUMBER() OVER (PARTITION BY property_id ORDER BY snapshot_date DESC) AS rn
        FROM windowed
      )
      SELECT property_id, operation, currency, first_price, last_price, first_date, last_date
      FROM first_last
      WHERE rn = 1 AND last_price < first_price
    `) as unknown as {
      property_id: string;
      operation: "venta" | "alquiler";
      currency: "USD" | "ARS";
      first_price: string | number;
      last_price: string | number;
      first_date: string;
      last_date: string;
    }[];

    const drops = rows
      .map((r): PriceDrop => {
        const firstPrice = Number(r.first_price);
        const currentPrice = Number(r.last_price);
        const diff = firstPrice - currentPrice;
        const pct = (diff / firstPrice) * 100;
        return {
          propertyId: r.property_id,
          firstPrice,
          currentPrice,
          diff,
          pct: Math.round(pct * 10) / 10,
          firstDate: r.first_date,
          lastDate: r.last_date,
          currency: r.currency,
          operation: r.operation,
        };
      })
      .filter((d) => {
        if (d.pct < minPct) return false;
        const minAbs = d.currency === "USD" ? minUsd : minArs;
        return d.diff >= minAbs;
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, limit);

    return drops;
  } catch (e) {
    console.error("[price-drops] query failed", e);
    return [];
  }
}

/**
 * Enrich price drops with the full property record + a synthetic
 * priceHistory so the existing OpportunityCard renders "now vs. before"
 * without code changes downstream.
 */
export async function fetchOpportunityPropertiesReal(): Promise<Property[]> {
  const drops = await fetchPriceDrops({ limit: 6 });
  if (drops.length === 0) return [];

  // Load the full inventory once so we can hydrate each drop into a Property.
  const [ventas, alquileres] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
  ]);
  const byId = new Map([...ventas, ...alquileres].map((p) => [p.id, p]));

  const out: Property[] = [];
  for (const d of drops) {
    const p = byId.get(d.propertyId);
    if (!p) continue;
    const history: PriceHistoryEntry[] = [
      { price: d.firstPrice, currency: d.currency, date: d.firstDate },
      { price: d.currentPrice, currency: d.currency, date: d.lastDate },
    ];
    out.push({ ...p, priceHistory: history });
  }
  return out;
}
