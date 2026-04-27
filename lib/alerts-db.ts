import { randomBytes } from "crypto";
import { sql } from "./db";

// ── Tipos ───────────────────────────────────────────────────────────────

export type OperationFilter = "venta" | "alquiler";

/**
 * Criterio de la alerta · cualquier subset puede estar presente. Se
 * compara contra una propiedad cuando llega una nueva al inventario.
 * Las propiedades sin price match (porque la alerta no tiene priceMax)
 * pasan el filtro.
 */
export interface AlertCriterion {
  operation?: OperationFilter;
  zones?: string[];        // localidades (San Justo, Ramos, etc)
  types?: string[];        // tipos (casa, departamento, etc)
  rooms?: number[];        // ambientes específicos (ej: [2, 3])
  priceMax?: number;       // tope en moneda original de la propiedad
  priceCurrency?: "USD" | "ARS"; // de qué moneda es priceMax
}

export interface Alert {
  id: number;
  email: string;
  name: string | null;
  criterion: AlertCriterion;
  unsubscribe_token: string;
  active: boolean;
  created_at: string;
  last_notified_at: string | null;
  notified_ids?: string[];
}

// ── Schema ──────────────────────────────────────────────────────────────

export async function ensureAlertsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      criterion JSONB NOT NULL,
      unsubscribe_token TEXT NOT NULL UNIQUE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_notified_at TIMESTAMPTZ,
      notified_ids TEXT[] NOT NULL DEFAULT '{}'
    )
  `;
  // Migración idempotente: si la tabla ya existía sin la columna, agregarla.
  await db`
    ALTER TABLE alerts ADD COLUMN IF NOT EXISTS notified_ids TEXT[] NOT NULL DEFAULT '{}'
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_alerts_email ON alerts (email)`;
  await db`CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts (active) WHERE active = TRUE`;
}

// ── CRUD ────────────────────────────────────────────────────────────────

export async function createAlert(params: {
  email: string;
  name?: string;
  criterion: AlertCriterion;
}): Promise<Alert> {
  await ensureAlertsSchema();
  const db = sql();
  const token = randomBytes(24).toString("base64url");
  const rows = (await db`
    INSERT INTO alerts (email, name, criterion, unsubscribe_token)
    VALUES (
      ${params.email.toLowerCase().trim()},
      ${params.name?.trim() || null},
      ${JSON.stringify(params.criterion)}::jsonb,
      ${token}
    )
    RETURNING id, email, name, criterion, unsubscribe_token, active,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
      to_char(last_notified_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_notified_at,
      notified_ids
  `) as unknown as Alert[];
  return rows[0];
}

export async function deactivateByToken(token: string): Promise<boolean> {
  await ensureAlertsSchema();
  const db = sql();
  const rows = (await db`
    UPDATE alerts SET active = FALSE
    WHERE unsubscribe_token = ${token} AND active = TRUE
    RETURNING id
  `) as unknown as { id: number }[];
  return rows.length > 0;
}

export async function listActiveAlerts(): Promise<Alert[]> {
  await ensureAlertsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      id, email, name, criterion, unsubscribe_token, active,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
      to_char(last_notified_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_notified_at,
      notified_ids
    FROM alerts
    WHERE active = TRUE
    ORDER BY created_at DESC
  `) as unknown as Alert[];
  return rows;
}

export async function listAllAlerts(): Promise<Alert[]> {
  await ensureAlertsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      id, email, name, criterion, unsubscribe_token, active,
      to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
      to_char(last_notified_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_notified_at,
      notified_ids
    FROM alerts
    ORDER BY created_at DESC
  `) as unknown as Alert[];
  return rows;
}

export async function deleteAlertById(id: number): Promise<void> {
  await ensureAlertsSchema();
  const db = sql();
  await db`DELETE FROM alerts WHERE id = ${id}`;
}

export async function setLastNotified(id: number): Promise<void> {
  await ensureAlertsSchema();
  const db = sql();
  await db`UPDATE alerts SET last_notified_at = now() WHERE id = ${id}`;
}

/** Suma `ids` al campo notified_ids (sin duplicados) y stampea last_notified_at. */
export async function recordNotification(
  id: number,
  ids: string[]
): Promise<void> {
  await ensureAlertsSchema();
  if (ids.length === 0) return;
  const db = sql();
  await db`
    UPDATE alerts
    SET last_notified_at = now(),
        notified_ids = ARRAY(
          SELECT DISTINCT unnest(notified_ids || ${ids}::text[])
        )
    WHERE id = ${id}
  `;
}

// ── Helpers para humanizar el criterio en emails / UI ──────────────────

export function describeCriterion(c: AlertCriterion): string {
  const parts: string[] = [];
  if (c.operation) parts.push(c.operation === "venta" ? "Venta" : "Alquiler");
  if (c.types && c.types.length) {
    parts.push(c.types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(" / "));
  }
  if (c.zones && c.zones.length) parts.push(`en ${c.zones.join(", ")}`);
  if (c.rooms && c.rooms.length) parts.push(`${c.rooms.join("/")} amb`);
  if (c.priceMax) {
    const cur = c.priceCurrency === "ARS" ? "$" : "USD";
    parts.push(`hasta ${cur} ${c.priceMax.toLocaleString("es-AR")}`);
  }
  return parts.join(" · ") || "Sin filtros (todo nuevo)";
}
