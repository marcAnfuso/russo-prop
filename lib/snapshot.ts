import { sql } from "./db";
import { fetchProperties } from "./xintel";

/**
 * Ensures the `price_snapshots` table exists. Safe to call on every run —
 * it's a no-op after the first time.
 */
export async function ensureSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      property_id TEXT NOT NULL,
      snapshot_date DATE NOT NULL,
      operation TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      currency TEXT NOT NULL,
      type TEXT NOT NULL,
      locality TEXT NOT NULL,
      rooms SMALLINT,
      surface NUMERIC(8, 2),
      captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (property_id, snapshot_date)
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_snapshots_loc_date
      ON price_snapshots (locality, snapshot_date)
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_snapshots_date
      ON price_snapshots (snapshot_date)
  `;
}

export interface SnapshotResult {
  date: string; // YYYY-MM-DD
  inserted: number;
  updated: number;
  skipped: number;
  pagesScanned: number;
  durationMs: number;
}

/**
 * Capture one day's snapshot of the full Russo inventory from Xintel
 * into Postgres. Idempotent for a given calendar date — re-running the
 * same day updates prices (useful if a listing's price changed).
 */
export async function captureSnapshot(): Promise<SnapshotResult> {
  const started = Date.now();
  await ensureSchema();
  const db = sql();

  // Use Buenos Aires calendar date for the snapshot_date so cron runs
  // near midnight ART still attribute the snapshot to the "right" day.
  const now = new Date();
  const buenosAires = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // en-CA returns YYYY-MM-DD already

  let pages = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let page = 1; page <= 30; page++) {
    const { properties, hasMore } = await fetchProperties({ page });
    pages++;
    if (!properties.length) break;

    for (const p of properties) {
      // Skip obvious placeholder/test data
      if (!p.price || p.price <= 0 || p.price >= 9_000_000) {
        skipped++;
        continue;
      }
      if (!p.id || !p.locality) {
        skipped++;
        continue;
      }

      const rooms = p.features.rooms && p.features.rooms > 0 ? p.features.rooms : null;
      const surface =
        p.features.coveredArea && p.features.coveredArea > 0
          ? p.features.coveredArea
          : p.features.totalArea && p.features.totalArea > 0
          ? p.features.totalArea
          : null;

      const res = await db`
        INSERT INTO price_snapshots
          (property_id, snapshot_date, operation, price, currency, type, locality, rooms, surface)
        VALUES
          (${p.id}, ${buenosAires}, ${p.operation}, ${p.price}, ${p.currency},
           ${p.type}, ${p.locality}, ${rooms}, ${surface})
        ON CONFLICT (property_id, snapshot_date) DO UPDATE SET
          price = EXCLUDED.price,
          currency = EXCLUDED.currency,
          type = EXCLUDED.type,
          locality = EXCLUDED.locality,
          rooms = EXCLUDED.rooms,
          surface = EXCLUDED.surface,
          captured_at = now()
        RETURNING (xmax = 0) AS inserted
      `;
      const rows = res as unknown as { inserted: boolean }[];
      if (rows[0]?.inserted) inserted++;
      else updated++;
    }

    if (!hasMore) break;
  }

  return {
    date: buenosAires,
    inserted,
    updated,
    skipped,
    pagesScanned: pages,
    durationMs: Date.now() - started,
  };
}

export interface SnapshotStatus {
  totalRows: number;
  distinctDays: number;
  firstDate: string | null;
  lastDate: string | null;
  lastSnapshotCount: number | null;
  latestByDay: { date: string; count: number }[];
}

/** Inspect the state of snapshot capture — useful for a /status endpoint. */
export async function snapshotStatus(): Promise<SnapshotStatus> {
  await ensureSchema();
  const db = sql();

  const totals = (await db`
    SELECT
      COUNT(*)::int AS total_rows,
      COUNT(DISTINCT snapshot_date)::int AS distinct_days,
      MIN(snapshot_date)::text AS first_date,
      MAX(snapshot_date)::text AS last_date
    FROM price_snapshots
  `) as {
    total_rows: number;
    distinct_days: number;
    first_date: string | null;
    last_date: string | null;
  }[];

  const latestByDay = (await db`
    SELECT
      snapshot_date::text AS date,
      COUNT(*)::int AS count
    FROM price_snapshots
    GROUP BY snapshot_date
    ORDER BY snapshot_date DESC
    LIMIT 14
  `) as { date: string; count: number }[];

  return {
    totalRows: totals[0].total_rows,
    distinctDays: totals[0].distinct_days,
    firstDate: totals[0].first_date,
    lastDate: totals[0].last_date,
    lastSnapshotCount: latestByDay[0]?.count ?? null,
    latestByDay,
  };
}
