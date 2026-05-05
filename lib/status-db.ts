import { sql } from "./db";

export type PropertyStatus = "active" | "reserved" | "sold";

export interface StatusRow {
  xintel_id: string;
  status: PropertyStatus;
  note: string | null;
  updated_by: string | null;
  updated_at: string;
}

export async function ensureStatusSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS property_status (
      xintel_id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('active', 'reserved', 'sold')),
      note TEXT,
      updated_by TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_property_status_status ON property_status (status)`;
}

/**
 * Devuelve un Map<xintel_id, status> con TODOS los overrides en DB,
 * incluyendo 'active' (que se usa para "limpiar" un override viejo).
 * Lo usa el feed al servir propiedades para hacer el merge.
 */
export async function getStatusMap(): Promise<Map<string, PropertyStatus>> {
  await ensureStatusSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, status FROM property_status
  `) as Array<{ xintel_id: string; status: PropertyStatus }>;
  const map = new Map<string, PropertyStatus>();
  for (const r of rows) map.set(r.xintel_id, r.status);
  return map;
}

/** Lista paginada con filtro por status y búsqueda libre. */
export async function listStatuses(params: {
  q?: string;
  status?: PropertyStatus;
  limit?: number;
  offset?: number;
}): Promise<{ rows: StatusRow[]; total: number }> {
  await ensureStatusSchema();
  const db = sql();
  const limit = Math.max(1, Math.min(200, params.limit ?? 50));
  const offset = Math.max(0, params.offset ?? 0);
  const q = params.q?.trim().toUpperCase() ?? "";
  const pattern = q ? `%${q}%` : "%";
  const status = params.status;

  const rowsRaw = status
    ? ((await db`
        SELECT xintel_id, status, note, updated_by,
          to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
        FROM property_status
        WHERE xintel_id ILIKE ${pattern} AND status = ${status}
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as StatusRow[])
    : ((await db`
        SELECT xintel_id, status, note, updated_by,
          to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
        FROM property_status
        WHERE xintel_id ILIKE ${pattern}
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as StatusRow[]);

  const totalRows = status
    ? ((await db`
        SELECT COUNT(*)::int AS total FROM property_status
        WHERE xintel_id ILIKE ${pattern} AND status = ${status}
      `) as Array<{ total: number }>)
    : ((await db`
        SELECT COUNT(*)::int AS total FROM property_status
        WHERE xintel_id ILIKE ${pattern}
      `) as Array<{ total: number }>);

  return { rows: rowsRaw, total: totalRows[0]?.total ?? 0 };
}

export async function getStatus(xintelId: string): Promise<StatusRow | null> {
  await ensureStatusSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id, status, note, updated_by,
      to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
    FROM property_status
    WHERE xintel_id = ${xintelId}
  `) as StatusRow[];
  return rows[0] ?? null;
}

export async function setStatus(params: {
  xintelId: string;
  status: PropertyStatus;
  note?: string | null;
  updatedBy?: string;
}): Promise<StatusRow> {
  await ensureStatusSchema();
  const db = sql();
  const rows = (await db`
    INSERT INTO property_status (xintel_id, status, note, updated_by, updated_at)
    VALUES (
      ${params.xintelId},
      ${params.status},
      ${params.note ?? null},
      ${params.updatedBy ?? null},
      now()
    )
    ON CONFLICT (xintel_id) DO UPDATE SET
      status = EXCLUDED.status,
      note = EXCLUDED.note,
      updated_by = EXCLUDED.updated_by,
      updated_at = now()
    RETURNING xintel_id, status, note, updated_by,
      to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS updated_at
  `) as StatusRow[];
  return rows[0];
}

/** Borra el override · vuelve a "lo que diga Xintel" */
export async function clearStatus(xintelId: string): Promise<void> {
  await ensureStatusSchema();
  const db = sql();
  await db`DELETE FROM property_status WHERE xintel_id = ${xintelId}`;
}

/**
 * Inserta un override sólo si no hay uno previo (no pisa).
 * Devuelve cuántas filas insertó. Usado por el endpoint de migración
 * inicial para arrancar la tabla con las reservadas/vendidas actuales.
 */
export async function seedStatuses(
  entries: Array<{ xintelId: string; status: PropertyStatus }>,
  updatedBy?: string
): Promise<number> {
  if (entries.length === 0) return 0;
  await ensureStatusSchema();
  const db = sql();
  let inserted = 0;
  for (const e of entries) {
    const r = (await db`
      INSERT INTO property_status (xintel_id, status, updated_by)
      VALUES (${e.xintelId}, ${e.status}, ${updatedBy ?? "migration-seed"})
      ON CONFLICT (xintel_id) DO NOTHING
      RETURNING xintel_id
    `) as Array<{ xintel_id: string }>;
    if (r.length > 0) inserted++;
  }
  return inserted;
}

export async function countStatuses(): Promise<{
  total: number;
  reserved: number;
  sold: number;
}> {
  await ensureStatusSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'reserved')::int AS reserved,
      COUNT(*) FILTER (WHERE status = 'sold')::int AS sold
    FROM property_status
  `) as Array<{ total: number; reserved: number; sold: number }>;
  return rows[0] ?? { total: 0, reserved: 0, sold: 0 };
}

/** IDs por status · usado por el feed para mergear sin pisar todo. */
export async function getStatusIds(status: PropertyStatus): Promise<string[]> {
  await ensureStatusSchema();
  const db = sql();
  const rows = (await db`
    SELECT xintel_id FROM property_status WHERE status = ${status}
  `) as Array<{ xintel_id: string }>;
  return rows.map((r) => r.xintel_id);
}
