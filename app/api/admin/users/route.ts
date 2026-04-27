import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  listUsers,
  createUser,
  deleteUser,
  updateUserPassword,
  updateUserRole,
  findUserById,
  countOwners,
  type AdminRole,
} from "@/lib/admin-users";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const users = await listUsers();
  return NextResponse.json({ ok: true, users, me });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role !== "owner") {
    return NextResponse.json(
      { ok: false, error: "Sólo el owner puede crear usuarios" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { username, displayName, password, role } = body as {
    username?: string;
    displayName?: string;
    password?: string;
    role?: string;
  };

  if (!username || !displayName || !password) {
    return NextResponse.json(
      { ok: false, error: "Faltan campos" },
      { status: 400 }
    );
  }

  try {
    const user = await createUser({
      username,
      displayName,
      password,
      role: role === "owner" ? "owner" : "admin",
      createdBy: me.username,
    });
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("duplicate key")
        ? "Ese usuario ya existe"
        : err instanceof Error
        ? err.message
        : "Error al crear usuario";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  if (me.role !== "owner") {
    return NextResponse.json(
      { ok: false, error: "Sólo el owner puede borrar usuarios" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
  }
  if (id === me.id) {
    return NextResponse.json(
      { ok: false, error: "No podés borrarte a vos mismo" },
      { status: 400 }
    );
  }

  await deleteUser(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, password, role } = body as {
    id?: number;
    password?: string;
    role?: string;
  };

  if (!id) {
    return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 });
  }

  // ── Cambio de rol (sólo owner) ──────────────────────────────────────
  if (typeof role === "string") {
    if (me.role !== "owner") {
      return NextResponse.json(
        { ok: false, error: "Sólo el owner puede cambiar roles" },
        { status: 403 }
      );
    }
    if (role !== "owner" && role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "Rol inválido" },
        { status: 400 }
      );
    }
    // Evitar quedarse sin ningún owner si se está bajando al último
    if (role === "admin") {
      const target = await findUserById(id);
      if (target?.role === "owner") {
        const total = await countOwners();
        if (total <= 1) {
          return NextResponse.json(
            { ok: false, error: "No podés bajar al último owner" },
            { status: 400 }
          );
        }
      }
    }
    try {
      await updateUserRole(id, role as AdminRole);
      return NextResponse.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cambiar rol";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  }

  // ── Cambio de contraseña ────────────────────────────────────────────
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Falta password o role" },
      { status: 400 }
    );
  }

  // Un usuario sólo puede cambiar su propia contraseña; el owner puede
  // resetear la de cualquiera.
  if (id !== me.id && me.role !== "owner") {
    return NextResponse.json(
      { ok: false, error: "No autorizado" },
      { status: 403 }
    );
  }

  try {
    await updateUserPassword(id, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al cambiar contraseña";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
