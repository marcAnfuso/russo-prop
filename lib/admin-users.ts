import bcrypt from "bcryptjs";
import { sql } from "./db";

export type AdminRole = "owner" | "admin";

export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  role: AdminRole;
  created_at: string;
  last_login_at: string | null;
  created_by: string | null;
}

export interface AdminUserWithHash extends AdminUser {
  password_hash: string;
}

const BCRYPT_ROUNDS = 10;

export async function ensureUsersSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login_at TIMESTAMPTZ,
      created_by TEXT
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_admin_users_username
    ON admin_users (username)
  `;
  await seedOwnerIfEmpty();
}

/**
 * Si la tabla está vacía y hay OWNER_USERNAME + OWNER_PASSWORD en el
 * entorno, crea el primer usuario owner. Esto nos permite bootstrappear
 * sin depender de un formulario público.
 */
async function seedOwnerIfEmpty(): Promise<void> {
  const db = sql();
  const countRow = (await db`SELECT COUNT(*)::int AS n FROM admin_users`) as unknown as { n: number }[];
  if (countRow[0].n > 0) return;

  const username = process.env.OWNER_USERNAME;
  const password = process.env.OWNER_PASSWORD;
  const displayName = process.env.OWNER_DISPLAY_NAME || username || "Owner";

  if (!username || !password) return;

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db`
    INSERT INTO admin_users (username, display_name, password_hash, role, created_by)
    VALUES (${username}, ${displayName}, ${hash}, 'owner', 'seed')
    ON CONFLICT (username) DO NOTHING
  `;
}

export async function findUserByUsername(
  username: string
): Promise<AdminUserWithHash | null> {
  await ensureUsersSchema();
  const db = sql();
  const rows = (await db`
    SELECT id, username, display_name, password_hash, role,
           created_at, last_login_at, created_by
    FROM admin_users
    WHERE username = ${username.toLowerCase().trim()}
    LIMIT 1
  `) as unknown as AdminUserWithHash[];
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<AdminUser | null> {
  await ensureUsersSchema();
  const db = sql();
  const rows = (await db`
    SELECT id, username, display_name, role,
           created_at, last_login_at, created_by
    FROM admin_users
    WHERE id = ${id}
    LIMIT 1
  `) as unknown as AdminUser[];
  return rows[0] ?? null;
}

export async function verifyUserPassword(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const user = await findUserByUsername(username);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  const db = sql();
  await db`UPDATE admin_users SET last_login_at = now() WHERE id = ${user.id}`;
  const { password_hash: _omit, ...safe } = user;
  void _omit;
  return safe;
}

export async function listUsers(): Promise<AdminUser[]> {
  await ensureUsersSchema();
  const db = sql();
  const rows = (await db`
    SELECT id, username, display_name, role,
           created_at, last_login_at, created_by
    FROM admin_users
    ORDER BY created_at ASC
  `) as unknown as AdminUser[];
  return rows;
}

export async function createUser(params: {
  username: string;
  displayName: string;
  password: string;
  role?: AdminRole;
  createdBy: string;
}): Promise<AdminUser> {
  await ensureUsersSchema();
  const db = sql();
  const username = params.username.toLowerCase().trim();
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    throw new Error("Usuario inválido (3-32 chars: a-z, 0-9, . _ -)");
  }
  if (params.password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }
  const hash = await bcrypt.hash(params.password, BCRYPT_ROUNDS);
  const rows = (await db`
    INSERT INTO admin_users (username, display_name, password_hash, role, created_by)
    VALUES (${username}, ${params.displayName.trim()}, ${hash},
            ${params.role ?? "admin"}, ${params.createdBy})
    RETURNING id, username, display_name, role,
              created_at, last_login_at, created_by
  `) as unknown as AdminUser[];
  return rows[0];
}

export async function deleteUser(id: number): Promise<void> {
  await ensureUsersSchema();
  const db = sql();
  await db`DELETE FROM admin_users WHERE id = ${id} AND role <> 'owner'`;
}

export async function updateUserPassword(
  id: number,
  newPassword: string
): Promise<void> {
  await ensureUsersSchema();
  if (newPassword.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }
  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const db = sql();
  await db`UPDATE admin_users SET password_hash = ${hash} WHERE id = ${id}`;
}
