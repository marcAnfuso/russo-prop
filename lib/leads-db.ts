import { sql } from "./db";

export type LeadType = "contacto" | "tasacion" | "consulta";

export interface LeadRow {
  id: number;
  type: LeadType;
  name: string;
  email: string | null;
  phone: string;
  message: string;
  property_code: string | null;
  source_path: string | null;
  user_agent: string | null;
  notes: string | null;
  status: "nuevo" | "contactado" | "cerrado";
  created_at: string;
}

export async function ensureLeadsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      property_code TEXT,
      source_path TEXT,
      user_agent TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'nuevo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status)`;
  await db`CREATE INDEX IF NOT EXISTS idx_leads_property ON leads (property_code) WHERE property_code IS NOT NULL`;
}

export async function createLead(params: {
  type: LeadType;
  name: string;
  email?: string;
  phone: string;
  message: string;
  propertyCode?: string;
  sourcePath?: string;
  userAgent?: string;
}): Promise<LeadRow> {
  await ensureLeadsSchema();
  const db = sql();
  const rows = (await db`
    INSERT INTO leads (
      type, name, email, phone, message, property_code, source_path, user_agent
    )
    VALUES (
      ${params.type},
      ${params.name.trim()},
      ${params.email?.trim().toLowerCase() || null},
      ${params.phone.trim()},
      ${params.message.trim()},
      ${params.propertyCode?.trim().toUpperCase() || null},
      ${params.sourcePath || null},
      ${params.userAgent || null}
    )
    RETURNING id, type, name, email, phone, message, property_code,
      source_path, user_agent, notes, status,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
  `) as LeadRow[];
  return rows[0];
}

export async function listLeads(params: {
  status?: "nuevo" | "contactado" | "cerrado" | "todos";
  type?: LeadType;
  limit?: number;
  offset?: number;
}): Promise<{ rows: LeadRow[]; total: number; counts: { nuevo: number; contactado: number; cerrado: number } }> {
  await ensureLeadsSchema();
  const db = sql();
  const limit = Math.max(1, Math.min(200, params.limit ?? 50));
  const offset = Math.max(0, params.offset ?? 0);
  const status = params.status ?? "todos";
  const type = params.type;

  const wantStatus = status !== "todos";
  const wantType = !!type;

  let rowsRaw: LeadRow[];
  if (wantStatus && wantType) {
    rowsRaw = (await db`
      SELECT id, type, name, email, phone, message, property_code,
        source_path, user_agent, notes, status,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM leads
      WHERE status = ${status} AND type = ${type as string}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as LeadRow[];
  } else if (wantStatus) {
    rowsRaw = (await db`
      SELECT id, type, name, email, phone, message, property_code,
        source_path, user_agent, notes, status,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM leads
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as LeadRow[];
  } else if (wantType) {
    rowsRaw = (await db`
      SELECT id, type, name, email, phone, message, property_code,
        source_path, user_agent, notes, status,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM leads
      WHERE type = ${type as string}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as LeadRow[];
  } else {
    rowsRaw = (await db`
      SELECT id, type, name, email, phone, message, property_code,
        source_path, user_agent, notes, status,
        to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as LeadRow[];
  }

  const totalRows = (await db`SELECT COUNT(*)::int AS n FROM leads`) as Array<{ n: number }>;
  const countRows = (await db`
    SELECT status, COUNT(*)::int AS n
    FROM leads
    GROUP BY status
  `) as Array<{ status: string; n: number }>;
  const counts = { nuevo: 0, contactado: 0, cerrado: 0 };
  for (const r of countRows) {
    if (r.status === "nuevo" || r.status === "contactado" || r.status === "cerrado") {
      counts[r.status] = r.n;
    }
  }

  return { rows: rowsRaw, total: totalRows[0]?.n ?? 0, counts };
}

export async function updateLeadStatus(
  id: number,
  status: "nuevo" | "contactado" | "cerrado"
): Promise<void> {
  await ensureLeadsSchema();
  const db = sql();
  await db`UPDATE leads SET status = ${status} WHERE id = ${id}`;
}

export async function updateLeadNotes(id: number, notes: string): Promise<void> {
  await ensureLeadsSchema();
  const db = sql();
  await db`UPDATE leads SET notes = ${notes} WHERE id = ${id}`;
}

export async function deleteLead(id: number): Promise<void> {
  await ensureLeadsSchema();
  const db = sql();
  await db`DELETE FROM leads WHERE id = ${id}`;
}
