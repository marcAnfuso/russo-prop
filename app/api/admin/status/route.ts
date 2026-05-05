import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  clearStatus,
  countStatuses,
  listStatuses,
  setStatus,
  type PropertyStatus,
} from "@/lib/status-db";

const PUBLIC_PATHS = ["/", "/ventas", "/alquileres"];

function revalidateAll() {
  for (const p of PUBLIC_PATHS) revalidatePath(p);
}

async function requireAdmin() {
  const me = await getCurrentAdmin();
  if (!me) {
    return {
      error: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
    };
  }
  return { user: me };
}

function normalizeRusId(raw: string): string {
  return raw.replace(/\D+/g, "").trim();
}

function isStatus(s: unknown): s is PropertyStatus {
  return s === "active" || s === "reserved" || s === "sold";
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const statusParam = sp.get("status");
  const status = isStatus(statusParam) ? statusParam : undefined;
  const limit = Number(sp.get("limit") ?? "50");
  const offset = Number(sp.get("offset") ?? "0");

  const [{ rows, total }, counts] = await Promise.all([
    listStatuses({
      q,
      status,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    }),
    countStatuses(),
  ]);
  return NextResponse.json({ rows, total, counts });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const rawId = typeof body.xintel_id === "string" ? body.xintel_id : "";
  const xintelId = normalizeRusId(rawId);
  const status = body.status;
  const note = typeof body.note === "string" ? body.note : null;

  if (!xintelId) {
    return NextResponse.json(
      { ok: false, error: "código RUS inválido" },
      { status: 400 }
    );
  }
  if (!isStatus(status)) {
    return NextResponse.json(
      { ok: false, error: "status debe ser active, reserved o sold" },
      { status: 400 }
    );
  }

  // Para 'active' borramos el override en lugar de guardarlo · semánticamente
  // 'active' significa "respetá lo que diga Xintel" y mantener una fila
  // ensucia listados.
  if (status === "active") {
    await clearStatus(xintelId);
    revalidateAll();
    return NextResponse.json({ ok: true, cleared: true });
  }

  const row = await setStatus({
    xintelId,
    status,
    note,
    updatedBy: auth.user!.username,
  });
  revalidateAll();
  return NextResponse.json({ ok: true, row });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const rawId = req.nextUrl.searchParams.get("xintel_id") ?? "";
  const xintelId = normalizeRusId(rawId);
  if (!xintelId) {
    return NextResponse.json(
      { ok: false, error: "xintel_id requerido" },
      { status: 400 }
    );
  }
  await clearStatus(xintelId);
  revalidateAll();
  return NextResponse.json({ ok: true });
}
