import { createHash } from "crypto";
import { sql } from "./db";

export interface RussiaLogRow {
  id: number;
  created_at: string;
  ip_hash: string | null;
  user_agent: string | null;
  user_message: string;
  response_excerpt: string | null;
  function_call: string | null;
  function_args: unknown;
  result_count: number | null;
  error: string | null;
  ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
}

export async function ensureRussiaLogsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS russia_usage_logs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ip_hash TEXT,
      user_agent TEXT,
      user_message TEXT NOT NULL,
      response_excerpt TEXT,
      function_call TEXT,
      function_args JSONB,
      result_count INTEGER,
      error TEXT,
      ms INTEGER,
      input_tokens INTEGER,
      output_tokens INTEGER
    )
  `;
  await db`CREATE INDEX IF NOT EXISTS idx_russia_logs_created ON russia_usage_logs (created_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_russia_logs_ip ON russia_usage_logs (ip_hash, created_at DESC)`;
}

const HASH_SALT = process.env.RUSSIA_LOG_SALT ?? "russo-default-salt-change-me";

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${HASH_SALT}:${ip}`).digest("hex").slice(0, 16);
}

export interface LogRussiaParams {
  ipHash: string | null;
  userAgent: string | null;
  userMessage: string;
  responseExcerpt: string | null;
  functionCall: string | null;
  functionArgs: unknown;
  resultCount: number | null;
  error: string | null;
  ms: number;
  inputTokens: number | null;
  outputTokens: number | null;
}

/**
 * Inserta un log silencioso · NO bloquea la respuesta de Russia si
 * falla la DB. El que llama no debería await este resultado en el
 * camino crítico, mejor fire-and-forget.
 */
export async function logRussiaUsage(params: LogRussiaParams): Promise<void> {
  try {
    await ensureRussiaLogsSchema();
    const db = sql();
    await db`
      INSERT INTO russia_usage_logs (
        ip_hash, user_agent, user_message, response_excerpt,
        function_call, function_args, result_count, error, ms,
        input_tokens, output_tokens
      ) VALUES (
        ${params.ipHash},
        ${params.userAgent},
        ${params.userMessage},
        ${params.responseExcerpt},
        ${params.functionCall},
        ${params.functionArgs ? JSON.stringify(params.functionArgs) : null}::jsonb,
        ${params.resultCount},
        ${params.error},
        ${params.ms},
        ${params.inputTokens},
        ${params.outputTokens}
      )
    `;
  } catch {
    // logging es best-effort · no romper si DB falla
  }
}

export async function listRussiaLogs(params: {
  q?: string;
  ipHash?: string;
  hasError?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ rows: RussiaLogRow[]; total: number }> {
  await ensureRussiaLogsSchema();
  const db = sql();
  const limit = Math.max(1, Math.min(200, params.limit ?? 50));
  const offset = Math.max(0, params.offset ?? 0);
  const q = params.q?.trim() ?? "";
  const pattern = q ? `%${q}%` : "%";
  const ipHash = params.ipHash;

  // Filtrado dinámico · postgres no nos deja pasar arrays variables, así
  // que ramificamos los WHERE más comunes.
  let rows: RussiaLogRow[];
  let totalRows: Array<{ total: number }>;

  if (ipHash) {
    rows = (await db`
      SELECT id, created_at, ip_hash, user_agent, user_message, response_excerpt,
        function_call, function_args, result_count, error, ms, input_tokens, output_tokens
      FROM russia_usage_logs
      WHERE ip_hash = ${ipHash} AND user_message ILIKE ${pattern}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as RussiaLogRow[];
    totalRows = (await db`
      SELECT COUNT(*)::int AS total FROM russia_usage_logs
      WHERE ip_hash = ${ipHash} AND user_message ILIKE ${pattern}
    `) as Array<{ total: number }>;
  } else {
    rows = (await db`
      SELECT id, created_at, ip_hash, user_agent, user_message, response_excerpt,
        function_call, function_args, result_count, error, ms, input_tokens, output_tokens
      FROM russia_usage_logs
      WHERE user_message ILIKE ${pattern}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as RussiaLogRow[];
    totalRows = (await db`
      SELECT COUNT(*)::int AS total FROM russia_usage_logs
      WHERE user_message ILIKE ${pattern}
    `) as Array<{ total: number }>;
  }

  return { rows, total: totalRows[0]?.total ?? 0 };
}

export interface RussiaStats {
  totalToday: number;
  totalYesterday: number;
  total7d: number;
  total30d: number;
  uniqueIpsToday: number;
  uniqueIps7d: number;
  topIps7d: Array<{ ip_hash: string; count: number; last_seen: string }>;
  perDay30d: Array<{ day: string; count: number }>;
  inputTokens30d: number;
  outputTokens30d: number;
}

export async function getRussiaStats(): Promise<RussiaStats> {
  await ensureRussiaLogsSchema();
  const db = sql();

  const counts = (await db`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires'))::int AS total_today,
      COUNT(*) FILTER (
        WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires') - interval '1 day'
        AND created_at < date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires')
      )::int AS total_yesterday,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS total_7d,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS total_30d,
      COUNT(DISTINCT ip_hash) FILTER (
        WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires')
      )::int AS unique_ips_today,
      COUNT(DISTINCT ip_hash) FILTER (WHERE created_at >= now() - interval '7 days')::int AS unique_ips_7d,
      COALESCE(SUM(input_tokens) FILTER (WHERE created_at >= now() - interval '30 days'), 0)::int AS input_tokens_30d,
      COALESCE(SUM(output_tokens) FILTER (WHERE created_at >= now() - interval '30 days'), 0)::int AS output_tokens_30d
    FROM russia_usage_logs
  `) as Array<{
    total_today: number;
    total_yesterday: number;
    total_7d: number;
    total_30d: number;
    unique_ips_today: number;
    unique_ips_7d: number;
    input_tokens_30d: number;
    output_tokens_30d: number;
  }>;

  const c = counts[0];

  const topIps = (await db`
    SELECT ip_hash, COUNT(*)::int AS count,
      to_char(MAX(created_at), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_seen
    FROM russia_usage_logs
    WHERE created_at >= now() - interval '7 days' AND ip_hash IS NOT NULL
    GROUP BY ip_hash
    ORDER BY count DESC
    LIMIT 10
  `) as Array<{ ip_hash: string; count: number; last_seen: string }>;

  const perDay = (await db`
    SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'America/Argentina/Buenos_Aires'), 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS count
    FROM russia_usage_logs
    WHERE created_at >= now() - interval '30 days'
    GROUP BY day
    ORDER BY day ASC
  `) as Array<{ day: string; count: number }>;

  return {
    totalToday: c?.total_today ?? 0,
    totalYesterday: c?.total_yesterday ?? 0,
    total7d: c?.total_7d ?? 0,
    total30d: c?.total_30d ?? 0,
    uniqueIpsToday: c?.unique_ips_today ?? 0,
    uniqueIps7d: c?.unique_ips_7d ?? 0,
    topIps7d: topIps,
    perDay30d: perDay,
    inputTokens30d: c?.input_tokens_30d ?? 0,
    outputTokens30d: c?.output_tokens_30d ?? 0,
  };
}
