import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "russo_admin";
const SESSION_TTL_DAYS = 30;

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-admin-secret-change-me";
}

function getPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

/**
 * Constant-time password check against the env var. Returns false if no
 * password is configured — the admin surface stays closed until the
 * deployment has it set.
 */
export function checkPassword(input: string): boolean {
  const pwd = getPassword();
  if (!pwd || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pwd);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function makeSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  // Both hex strings of same length; timingSafeEqual is safe.
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && Date.now() < exp;
}

export async function currentSessionIsAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_TTL_DAYS * 24 * 60 * 60;
