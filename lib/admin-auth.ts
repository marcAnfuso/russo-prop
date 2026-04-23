import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AdminUser } from "./admin-users";
import { findUserById } from "./admin-users";

const COOKIE_NAME = "russo_admin";
const SESSION_TTL_DAYS = 30;

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-admin-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

interface SessionPayload {
  uid: number;
  exp: number;
}

/**
 * Firma un token de sesión con el id del usuario + expiración. El HMAC
 * evita que se pueda falsificar sin conocer el secret.
 */
export function makeSessionToken(userId: number): string {
  const exp = Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload: SessionPayload = { uid: userId, exp };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function decodeSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = sign(encoded);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const raw = Buffer.from(encoded, "base64url").toString("utf8");
    const payload = JSON.parse(raw) as SessionPayload;
    if (typeof payload.uid !== "number" || typeof payload.exp !== "number") return null;
    if (Date.now() >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function currentSessionIsAdmin(): Promise<boolean> {
  const payload = await readSessionPayload();
  return payload !== null;
}

async function readSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decodeSessionToken(store.get(COOKIE_NAME)?.value);
}

/**
 * Devuelve el usuario completo (sin hash) de la sesión actual, o null
 * si no hay sesión válida o el usuario fue borrado.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const payload = await readSessionPayload();
  if (!payload) return null;
  return findUserById(payload.uid);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_TTL_DAYS * 24 * 60 * 60;
