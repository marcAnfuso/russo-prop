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

/** Comparativo · período actual (last N días) vs anterior (N-2N días). */
export async function getOverviewWithDelta(daysBack: number): Promise<
  OverviewStats & { delta: { visitors: number; sessions: number; pageviews: number } }
> {
  const [curr, prev] = await Promise.all([
    getOverview(daysBack),
    getOverviewRange(daysBack * 2, daysBack),
  ]);
  function pct(now: number, before: number): number {
    if (before === 0) return now > 0 ? 100 : 0;
    return Math.round(((now - before) / before) * 100);
  }
  return {
    ...curr,
    delta: {
      visitors: pct(curr.visitors, prev.visitors),
      sessions: pct(curr.sessions, prev.sessions),
      pageviews: pct(curr.pageviews, prev.pageviews),
    },
  };
}

/** Stats para un rango exacto (entre `fromDays` atrás y `toDays` atrás). */
async function getOverviewRange(
  fromDays: number,
  toDays: number
): Promise<OverviewStats> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(DISTINCT session_id)::int AS sessions,
      COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageviews
    FROM analytics_events
    WHERE ts >= now() - (${fromDays}::int * INTERVAL '1 day')
      AND ts <  now() - (${toDays}::int * INTERVAL '1 day')
      AND visitor_id NOT IN (
        SELECT visitor_id FROM analytics_sessions WHERE is_bot = TRUE
      )
  `) as unknown as { visitors: number; sessions: number; pageviews: number }[];
  return { ...rows[0], avgSessionMinutes: 0 };
}

/** Top búsquedas (text de search bar). */
export async function getTopSearches(daysBack: number, limit = 10): Promise<TopItem[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  // Si la metadata.zones existe la concatenamos, si no usamos types
  const rows = (await db`
    SELECT
      COALESCE(
        NULLIF(metadata->>'zones', ''),
        NULLIF(metadata->>'types', ''),
        '(sin filtro)'
      ) AS key,
      COUNT(*)::int AS count
    FROM analytics_events
    WHERE type = 'search'
      AND ts >= now() - (${daysBack}::int * INTERVAL '1 day')
    GROUP BY 1
    ORDER BY count DESC
    LIMIT ${limit}
  `) as unknown as TopItem[];
  return rows;
}

/** Distribución de scroll depth (qué % de visitas llega a cada bucket). */
export async function getScrollDepthDistribution(daysBack: number): Promise<
  { bucket: number; reach: number }[]
> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      (metadata->>'bucket')::int AS bucket,
      COUNT(DISTINCT (session_id || COALESCE(metadata->>'path', '')))::int AS hits
    FROM analytics_events
    WHERE type = 'scroll_depth'
      AND ts >= now() - (${daysBack}::int * INTERVAL '1 day')
      AND metadata->>'bucket' IS NOT NULL
    GROUP BY bucket
    ORDER BY bucket ASC
  `) as unknown as { bucket: number; hits: number }[];

  // Total = max bucket reach (todos los que vieron al menos 25%)
  const max = Math.max(...rows.map((r) => r.hits), 1);
  return rows.map((r) => ({
    bucket: r.bucket,
    reach: Math.round((r.hits / max) * 100),
  }));
}

/** Distribución por canal de contact_click (wpp / phone / email). */
export async function getContactBreakdown(daysBack: number): Promise<TopItem[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      COALESCE(metadata->>'channel', 'otro') AS key,
      COUNT(*)::int AS count
    FROM analytics_events
    WHERE type = 'contact_click'
      AND ts >= now() - (${daysBack}::int * INTERVAL '1 day')
    GROUP BY 1
    ORDER BY count DESC
  `) as unknown as TopItem[];
  return rows;
}

// ── Sesiones (drill-down) ──────────────────────────────────────────────

export interface SessionRow {
  id: string;
  visitor_id: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  first_seen: string;
  last_seen: string;
  event_count: number;
  pageview_count: number;
  contacted: boolean;
}

export async function listSessions(
  daysBack: number,
  options: {
    limit?: number;
    onlyContacted?: boolean;
    onlyContactProperties?: boolean;
  } = {}
): Promise<SessionRow[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const limit = options.limit ?? 100;
  const onlyContacted = options.onlyContacted ?? false;

  // Joineamos sesión con sus eventos para contar y detectar si contactó
  const rows = (await db`
    WITH stats AS (
      SELECT
        session_id,
        COUNT(*)::int AS event_count,
        COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageview_count,
        bool_or(type IN ('contact_click', 'form_submit', 'russia_chat_open')) AS contacted
      FROM analytics_events
      WHERE ts >= now() - (${daysBack}::int * INTERVAL '1 day')
      GROUP BY session_id
    )
    SELECT
      s.id, s.visitor_id, s.device, s.browser, s.os,
      s.country, s.city, s.referrer,
      to_char(s.first_seen, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS first_seen,
      to_char(s.last_seen,  'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_seen,
      COALESCE(stats.event_count, 0) AS event_count,
      COALESCE(stats.pageview_count, 0) AS pageview_count,
      COALESCE(stats.contacted, FALSE) AS contacted
    FROM analytics_sessions s
    LEFT JOIN stats ON stats.session_id = s.id
    WHERE s.last_seen >= now() - (${daysBack}::int * INTERVAL '1 day')
      AND s.is_bot = FALSE
      AND (NOT ${onlyContacted} OR stats.contacted = TRUE)
    ORDER BY s.last_seen DESC
    LIMIT ${limit}
  `) as unknown as SessionRow[];
  return rows;
}

export async function getSession(id: string): Promise<SessionRow | null> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    WITH stats AS (
      SELECT
        session_id,
        COUNT(*)::int AS event_count,
        COUNT(*) FILTER (WHERE type = 'pageview')::int AS pageview_count,
        bool_or(type IN ('contact_click', 'form_submit', 'russia_chat_open')) AS contacted
      FROM analytics_events
      WHERE session_id = ${id}
      GROUP BY session_id
    )
    SELECT
      s.id, s.visitor_id, s.device, s.browser, s.os,
      s.country, s.city, s.referrer,
      to_char(s.first_seen, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS first_seen,
      to_char(s.last_seen,  'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_seen,
      COALESCE(stats.event_count, 0) AS event_count,
      COALESCE(stats.pageview_count, 0) AS pageview_count,
      COALESCE(stats.contacted, FALSE) AS contacted
    FROM analytics_sessions s
    LEFT JOIN stats ON stats.session_id = s.id
    WHERE s.id = ${id}
    LIMIT 1
  `) as unknown as SessionRow[];
  return rows[0] ?? null;
}

export interface SessionEvent {
  id: number;
  type: string;
  path: string | null;
  property_id: string | null;
  metadata: Record<string, unknown> | null;
  ts: string;
}

export async function getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      id::int AS id,
      type,
      path,
      property_id,
      metadata,
      to_char(ts, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS ts
    FROM analytics_events
    WHERE session_id = ${sessionId}
    ORDER BY ts ASC, id ASC
  `) as unknown as SessionEvent[];
  return rows;
}

// ── Funnel de conversión ───────────────────────────────────────────────

export interface FunnelStep {
  key: string;
  label: string;
  visitors: number;
}

/**
 * Funnel clásico de inmobiliaria:
 *   1. Visitaron el sitio (cualquier pageview)
 *   2. Vieron alguna sección de listados (/ventas o /alquileres)
 *   3. Entraron a una ficha de propiedad
 *   4. Iniciaron contacto (wpp/tel/email/form/Russia)
 *
 * Cada paso se cuenta como "visitor_ids únicos que llegaron a ese paso".
 * No exige orden estricto — alguien que entró directo a una propiedad
 * cuenta para los pasos 1 y 3 (skip del 2). Es una vista realista del
 * funnel, no una secuencia rígida.
 */
export async function getFunnel(daysBack: number): Promise<FunnelStep[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    WITH range AS (SELECT now() - (${daysBack}::int * INTERVAL '1 day') AS since),
    eligible AS (
      SELECT visitor_id FROM analytics_sessions WHERE is_bot = FALSE
    )
    SELECT
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE type = 'pageview'
      )::int AS step_visit,
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE type = 'pageview'
        AND (path LIKE '/ventas%' OR path LIKE '/alquileres%' OR path LIKE '/emprendimientos%')
      )::int AS step_listing,
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE type = 'property_view'
      )::int AS step_detail,
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE type IN ('contact_click', 'form_submit', 'russia_chat_open')
      )::int AS step_contact
    FROM analytics_events, range
    WHERE ts >= range.since
      AND visitor_id IN (SELECT visitor_id FROM eligible)
  `) as unknown as {
    step_visit: number;
    step_listing: number;
    step_detail: number;
    step_contact: number;
  }[];
  const r = rows[0];
  return [
    { key: "visit", label: "Visitaron el sitio", visitors: r.step_visit },
    { key: "listing", label: "Buscaron en listados", visitors: r.step_listing },
    { key: "detail", label: "Entraron a una ficha", visitors: r.step_detail },
    { key: "contact", label: "Iniciaron contacto", visitors: r.step_contact },
  ];
}

/** Export raw de eventos para análisis externo (CSV). */
export async function exportEvents(
  daysBack: number
): Promise<{
  ts: string;
  session_id: string;
  visitor_id: string;
  type: string;
  path: string | null;
  property_id: string | null;
  metadata: string | null;
}[]> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    SELECT
      to_char(ts, 'YYYY-MM-DD HH24:MI:SS') AS ts,
      session_id, visitor_id, type, path, property_id,
      metadata::text AS metadata
    FROM analytics_events
    WHERE ts >= now() - (${daysBack}::int * INTERVAL '1 day')
    ORDER BY ts ASC
  `) as unknown as {
    ts: string;
    session_id: string;
    visitor_id: string;
    type: string;
    path: string | null;
    property_id: string | null;
    metadata: string | null;
  }[];
  return rows;
}

/** Tráfico por hora del día (heatmap), promedio sobre el rango. */
export async function getHourlyTraffic(daysBack: number): Promise<
  { hour: number; pageviews: number }[]
> {
  await ensureAnalyticsSchema();
  const db = sql();
  const rows = (await db`
    WITH hours AS (SELECT generate_series(0, 23) AS hour)
    SELECT
      hours.hour,
      COALESCE(COUNT(e.id) FILTER (WHERE e.type = 'pageview'), 0)::int AS pageviews
    FROM hours
    LEFT JOIN analytics_events e
      ON EXTRACT(HOUR FROM e.ts AT TIME ZONE 'America/Argentina/Buenos_Aires') = hours.hour
      AND e.ts >= now() - (${daysBack}::int * INTERVAL '1 day')
    GROUP BY hours.hour
    ORDER BY hours.hour ASC
  `) as unknown as { hour: number; pageviews: number }[];
  return rows;
}
