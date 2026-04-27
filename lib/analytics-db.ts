import { sql } from "./db";

// ── Tipos ───────────────────────────────────────────────────────────────
export type EventType =
  | "pageview"
  | "scroll_depth"
  | "time_on_page"
  | "property_view"
  | "image_navigate"
  | "quickview_open"
  | "contact_click"
  | "form_submit"
  | "search"
  | "filter_change"
  | "russia_chat_open"
  | "favorite_toggle";

export interface AnalyticsEvent {
  type: EventType;
  path?: string;
  property_id?: string;
  metadata?: Record<string, unknown>;
  ts?: string; // ISO; si falta, ahora
}

export interface SessionInfo {
  session_id: string;
  visitor_id: string;
  device?: string; // mobile | desktop | tablet
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  user_agent?: string;
  is_bot?: boolean;
}

// ── Schema ──────────────────────────────────────────────────────────────
export async function ensureAnalyticsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS analytics_sessions (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      device TEXT,
      browser TEXT,
      os TEXT,
      country TEXT,
      city TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      user_agent TEXT,
      is_bot BOOLEAN NOT NULL DEFAULT FALSE,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      type TEXT NOT NULL,
      path TEXT,
      property_id TEXT,
      metadata JSONB,
      ts TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_events_ts ON analytics_events (ts DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events (visitor_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events (type)`;
  await db`
    CREATE INDEX IF NOT EXISTS idx_events_property
    ON analytics_events (property_id)
    WHERE property_id IS NOT NULL
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON analytics_sessions (visitor_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_sessions_lastseen ON analytics_sessions (last_seen DESC)`;
}

// ── Ingest ──────────────────────────────────────────────────────────────

/**
 * Upsert de la sesión. Si ya existe, sólo actualiza last_seen y campos
 * que no estaban antes (ej. referrer del primer pageview gana).
 */
export async function upsertSession(s: SessionInfo): Promise<void> {
  await ensureAnalyticsSchema();
  const db = sql();
  await db`
    INSERT INTO analytics_sessions (
      id, visitor_id, device, browser, os, country, city, referrer,
      utm_source, utm_medium, utm_campaign, user_agent, is_bot
    ) VALUES (
      ${s.session_id}, ${s.visitor_id}, ${s.device ?? null},
      ${s.browser ?? null}, ${s.os ?? null}, ${s.country ?? null},
      ${s.city ?? null}, ${s.referrer ?? null}, ${s.utm_source ?? null},
      ${s.utm_medium ?? null}, ${s.utm_campaign ?? null},
      ${s.user_agent ?? null}, ${s.is_bot ?? false}
    )
    ON CONFLICT (id) DO UPDATE SET
      last_seen = now(),
      device   = COALESCE(analytics_sessions.device,   EXCLUDED.device),
      browser  = COALESCE(analytics_sessions.browser,  EXCLUDED.browser),
      os       = COALESCE(analytics_sessions.os,       EXCLUDED.os),
      country  = COALESCE(analytics_sessions.country,  EXCLUDED.country),
      city     = COALESCE(analytics_sessions.city,     EXCLUDED.city),
      referrer = COALESCE(analytics_sessions.referrer, EXCLUDED.referrer)
  `;
}

export async function insertEvents(
  visitorId: string,
  sessionId: string,
  events: AnalyticsEvent[]
): Promise<void> {
  if (events.length === 0) return;
  await ensureAnalyticsSchema();
  const db = sql();
  // Insert en batch — neon http no soporta `unnest()` con templates,
  // así que iteramos. Para volumen alto eventualmente hacemos COPY.
  for (const e of events) {
    await db`
      INSERT INTO analytics_events (
        session_id, visitor_id, type, path, property_id, metadata, ts
      ) VALUES (
        ${sessionId}, ${visitorId}, ${e.type}, ${e.path ?? null},
        ${e.property_id ?? null},
        ${e.metadata ? JSON.stringify(e.metadata) : null},
        ${e.ts ?? new Date().toISOString()}
      )
    `;
  }
}

// ── Queries del dashboard ───────────────────────────────────────────────

export interface OverviewStats {
  visitors: number;       // distinct visitor_id en el rango
  sessions: number;       // distinct session_id
  pageviews: number;      // count de events type=pageview
  avgSessionMinutes: number;
}

export async function getOverview(daysBack: number): Promise<OverviewStats> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    WITH range AS (SELECT now() - (${daysBack}::int * INTERVAL '1 day') AS since)
    SELECT
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(DISTINCT session_id)::int AS sessions,
      COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageviews
    FROM analytics_events, range
    WHERE ts >= range.since
      AND visitor_id NOT IN (
        SELECT visitor_id FROM analytics_sessions WHERE is_bot = TRUE
      )
  `) as unknown as { visitors: number; sessions: number; pageviews: number }[];

  const durRows = (await db`
    WITH range AS (SELECT now() - (${daysBack}::int * INTERVAL '1 day') AS since),
    dur AS (
      SELECT session_id,
             EXTRACT(EPOCH FROM (MAX(ts) - MIN(ts))) AS seconds
      FROM analytics_events, range
      WHERE ts >= range.since
      GROUP BY session_id
      HAVING COUNT(*) > 1
    )
    SELECT COALESCE(AVG(seconds), 0)::float AS avg_seconds FROM dur
  `) as unknown as { avg_seconds: number }[];

  return {
    ...rows[0],
    avgSessionMinutes: Number(((durRows[0]?.avg_seconds ?? 0) / 60).toFixed(1)),
  };
}

export interface DailyPoint {
  day: string; // YYYY-MM-DD
  pageviews: number;
  visitors: number;
}

export async function getDailyTimeline(daysBack: number): Promise<DailyPoint[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    WITH range AS (
      SELECT generate_series(
        date_trunc('day', now() - (${daysBack}::int * INTERVAL '1 day')),
        date_trunc('day', now()),
        '1 day'::interval
      ) AS day
    )
    SELECT
      to_char(range.day, 'YYYY-MM-DD') AS day,
      COUNT(e.id) FILTER (WHERE e.type = 'pageview')::int AS pageviews,
      COUNT(DISTINCT e.visitor_id)::int AS visitors
    FROM range
    LEFT JOIN analytics_events e
      ON date_trunc('day', e.ts) = range.day
    GROUP BY range.day
    ORDER BY range.day ASC
  `) as unknown as DailyPoint[];
  return rows;
}

export interface TopItem {
  key: string;
  count: number;
}

export async function getTopPaths(daysBack: number, limit = 10): Promise<TopItem[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT path AS key, COUNT(*)::int AS count
    FROM analytics_events
    WHERE type = 'pageview'
      AND ts >= now() - (${daysBack}::int * INTERVAL '1 day')
      AND path IS NOT NULL
    GROUP BY path
    ORDER BY count DESC
    LIMIT ${limit}
  `) as unknown as TopItem[];
  return rows;
}

export async function getTopReferrers(daysBack: number, limit = 8): Promise<TopItem[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT COALESCE(NULLIF(referrer, ''), 'directo') AS key,
           COUNT(*)::int AS count
    FROM analytics_sessions
    WHERE first_seen >= now() - (${daysBack}::int * INTERVAL '1 day')
      AND is_bot = FALSE
    GROUP BY 1
    ORDER BY count DESC
    LIMIT ${limit}
  `) as unknown as TopItem[];
  return rows;
}

export interface PropertyViewStat {
  property_id: string;
  views: number;
  contacts: number;
}

export async function getTopProperties(daysBack: number, limit = 10): Promise<PropertyViewStat[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    WITH range AS (SELECT now() - (${daysBack}::int * INTERVAL '1 day') AS since)
    SELECT
      property_id,
      COUNT(*) FILTER (WHERE type = 'property_view')::int AS views,
      COUNT(*) FILTER (WHERE type = 'contact_click')::int AS contacts
    FROM analytics_events, range
    WHERE ts >= range.since AND property_id IS NOT NULL
    GROUP BY property_id
    ORDER BY views DESC
    LIMIT ${limit}
  `) as unknown as PropertyViewStat[];
  return rows;
}

export async function getDeviceBreakdown(daysBack: number): Promise<TopItem[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT COALESCE(device, 'desconocido') AS key,
           COUNT(DISTINCT visitor_id)::int AS count
    FROM analytics_sessions
    WHERE first_seen >= now() - (${daysBack}::int * INTERVAL '1 day')
      AND is_bot = FALSE
    GROUP BY 1
    ORDER BY count DESC
  `) as unknown as TopItem[];
  return rows;
}

export async function getCountryBreakdown(daysBack: number, limit = 10): Promise<TopItem[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT COALESCE(country, '?') AS key,
           COUNT(DISTINCT visitor_id)::int AS count
    FROM analytics_sessions
    WHERE first_seen >= now() - (${daysBack}::int * INTERVAL '1 day')
      AND is_bot = FALSE
    GROUP BY 1
    ORDER BY count DESC
    LIMIT ${limit}
  `) as unknown as TopItem[];
  return rows;
}
