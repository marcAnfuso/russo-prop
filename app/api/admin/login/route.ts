import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  makeSessionToken,
} from "@/lib/admin-auth";
import { verifyUserPassword } from "@/lib/admin-users";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: "Usuario y contraseña requeridos" },
      { status: 400 }
    );
  }

  const user = await verifyUserPassword(username, password);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, user: { username: user.username, role: user.role } });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: makeSessionToken(user.id),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
