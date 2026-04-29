import { sql } from "./db";

export interface PriorityRow {
  xintel_id: string;
  priority: number;
  note: string | null;
  updated_by: string | null;
  updated_at: string;
}

export async function ensurePrioritiesSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS property_priority (
      xintel_id TEXT PRIMARY KEY,
      priority INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      updated_by TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_property_priority_priority ON property_priority (priority DESC)`;
}

/**
 * Devuelve un Map<xintel_id, priority> con todos los overrides activos.
 * Lo usamos al servir listings: priority desc + fallback a in_ord2.
 */
export async function getPriorityMap(): Promise<Map<string, number>> {
  await ensurePrioritiesSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, priority FROM property_priority
  `) as Array<{ xintel_id: string; priority: number }>;
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.xintel_id, r.priority);
  return map;
}

/** Lista paginada para la vista admin. */
export async function listPriorities(params: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: PriorityRow[]; total: number }> {
  await ensurePrioritiesSchema();
  const db = sql();
  const limit = Math.max(1, Math.min(200, params.limit ?? 50));
  const offset = Math.max(0, params.offset ?? 0);
  const q = params.q?.trim().toUpperCase() ?? "";

  // Usamos ILIKE sobre xintel_id. Si el usuario tipea "10755" o "RUS10755",
  // ambos matchean.
  const pattern = q ? `%${q}%` : "%";

  const rowsRaw = (await db`
    SELECT xintel_id, priority, note, updated_by,
      to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
    FROM property_priority
    WHERE xintel_id ILIKE ${pattern}
    ORDER BY priority DESC, updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as PriorityRow[];

  const totalRows = (await db`
    SELECT COUNT(*)::int AS total FROM property_priority
    WHERE xintel_id ILIKE ${pattern}
  `) as Array<{ total: number }>;

  return { rows: rowsRaw, total: totalRows[0]?.total ?? 0 };
}

export async function getPriority(xintelId: string): Promise<PriorityRow | null> {
  await ensurePrioritiesSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, priority, note, updated_by,
      to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
    FROM property_priority
    WHERE xintel_id = ${xintelId}
  `) as PriorityRow[];
  return rows[0] ?? null;
}

export async function upsertPriority(params: {
  xintelId: string;
  priority: number;
  note?: string | null;
  updatedBy?: string;
}): Promise<PriorityRow> {
  await ensurePrioritiesSchema();
  const db = sql();
  const rows = (await db`
    INSERT INTO property_priority (xintel_id, priority, note, updated_by, updated_at)
    VALUES (
      ${params.xintelId},
      ${params.priority},
      ${params.note ?? null},
      ${params.updatedBy ?? null},
      now()
    )
    ON CONFLICT (xintel_id) DO UPDATE SET
      priority = EXCLUDED.priority,
      note = EXCLUDED.note,
      updated_by = EXCLUDED.updated_by,
      updated_at = now()
    RETURNING xintel_id, priority, note, updated_by,
      to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
  `) as PriorityRow[];
  return rows[0];
}

export async function deletePriority(xintelId: string): Promise<boolean> {
  await ensurePrioritiesSchema();
  const db = sql();
  const result = (await db`
    DELETE FROM property_priority WHERE xintel_id = ${xintelId}
  `) as unknown as { count?: number } | unknown[];
  // neon-serverless devuelve un array vacío en DELETE; usamos rowcount via consulta extra.
  // En lugar de eso, devolvemos true siempre — DELETE es idempotente.
  void result;
  return true;
}

/**
 * Importa prioridades de Xintel respetando los overrides ya existentes.
 * Sólo inserta si no existe registro previo (ON CONFLICT DO NOTHING).
 * Devuelve cuántas filas insertó.
 */
export async function seedPriorities(
  entries: Array<{ xintelId: string; priority: number }>,
  updatedBy?: string
): Promise<number> {
  if (entries.length === 0) return 0;
  await ensurePrioritiesSchema();
  const db = sql();
  let inserted = 0;
  for (const e of entries) {
    if (e.priority <= 0) continue;
    const r = (await db`
      INSERT INTO property_priority (xintel_id, priority, updated_by)
      VALUES (${e.xintelId}, ${e.priority}, ${updatedBy ?? "xintel-seed"})
      ON CONFLICT (xintel_id) DO NOTHING
      RETURNING xintel_id
    `) as Array<{ xintel_id: string }>;
    if (r.length > 0) inserted++;
  }
  return inserted;
}

export async function countPriorities(): Promise<number> {
  await ensurePrioritiesSchema();
  const db = sql();
  const rows = (await db`SELECT COUNT(*)::int AS total FROM property_priority`) as Array<{ total: number }>;
  return rows[0]?.total ?? 0;
}
