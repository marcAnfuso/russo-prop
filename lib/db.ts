import { neon } from "@neondatabase/serverless";

/**
 * Returns a tagged SQL template using the pooled Postgres connection.
 * Vercel's Neon integration wires the connection string via one of
 * several env var names depending on the chosen prefix — we try them
 * in order and throw at call-time so dev/prod startup doesn't crash
 * when the DB isn't configured.
 */
function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.STORAGE_URL ??
    process.env.STORAGE_POSTGRES_URL ??
    process.env.STORAGE_DATABASE_URL;
  if (!url) {
    throw new Error(
      "No Postgres connection string found in env (checked DATABASE_URL, POSTGRES_URL, STORAGE_URL, STORAGE_POSTGRES_URL, STORAGE_DATABASE_URL)."
    );
  }
  return url;
}

let _sql: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!_sql) _sql = neon(getConnectionString());
  return _sql;
}
