import { sql } from "./db";

export type PickList = "featured" | "new" | "sold" | "development_hidden";

export interface Pick {
  property_id: string;
  list_key: PickList;
  added_at: string;
  expires_at: string | null;
}

export async function ensurePicksSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS manual_picks (
      property_id TEXT NOT NULL,
      list_key TEXT NOT NULL,
      added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ,
      PRIMARY KEY (property_id, list_key)
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_picks_list ON manual_picks (list_key)
  `;
}

export async function listPicks(listKey: PickList): Promise<string[]> {
  await ensurePicksSchema();
  const db = sql();
  const rows = (await db`
    SELECT property_id
    FROM manual_picks
    WHERE list_key = ${listKey}
      AND (expires_at IS NULL OR expires_at > now())
    ORDER BY added_at DESC
  `) as unknown as { property_id: string }[];
  return rows.map((r) => r.property_id);
}

export async function addPick(
  propertyId: string,
  listKey: PickList,
  expiresAt: string | null = null
): Promise<void> {
  await ensurePicksSchema();
  const db = sql();
  await db`
    INSERT INTO manual_picks (property_id, list_key, expires_at)
    VALUES (${propertyId}, ${listKey}, ${expiresAt})
    ON CONFLICT (property_id, list_key) DO UPDATE SET
      added_at = now(),
      expires_at = EXCLUDED.expires_at
  `;
}

export async function removePick(
  propertyId: string,
  listKey: PickList
): Promise<void> {
  const db = sql();
  await db`
    DELETE FROM manual_picks
    WHERE property_id = ${propertyId} AND list_key = ${listKey}
  `;
}

/**
 * Deterministic daily rotation: picks `count` items from `pool` using the
 * current Buenos Aires date as a seed. Every visitor today sees the same
 * subset; tomorrow the subset rotates. When the pool is smaller than
 * `count`, returns the whole pool.
 */
export function rotateDaily<T>(pool: T[], count: number): T[] {
  if (pool.length <= count) return pool.slice();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
  // Simple string hash → number
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) >>> 0;
  }
  const arr = pool.slice();
  // Fisher-Yates with LCG
  let state = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
