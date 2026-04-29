import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  countPriorities,
  deletePriority,
  listPriorities,
  upsertPriority,
} from "@/lib/priorities-db";

const PUBLIC_PATHS = ["/", "/ventas", "/alquileres"];

function revalidateAll() {
  for (const p of PUBLIC_PATHS) revalidatePath(p);
}

async function requireAdmin() {
  const me = await getCurrentAdmin();
  if (!me) {
    return { error: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }
  return { user: me };
}

function normalizeRusId(raw: string): string {
  // Aceptamos "10755", "RUS10755", "rus 10755". Guardamos sólo dígitos
  // para que matchee el id de Xintel (in_num).
  return raw.replace(/\D+/g, "").trim();
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const limit = Number(sp.get("limit") ?? "50");
  const offset = Number(sp.get("offset") ?? "0");
  const [{ rows, total }, totalAll] = await Promise.all([
    listPriorities({
      q,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    }),
    countPriorities(),
  ]);
  return NextResponse.json({ rows, total, totalAll });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const rawId = typeof body.xintel_id === "string" ? body.xintel_id : "";
  const xintelId = normalizeRusId(rawId);
  const priority = Number(body.priority);
  const note = typeof body.note === "string" ? body.note : null;

  if (!xintelId) {
    return NextResponse.json({ ok: false, error: "código RUS inválido" }, { status: 400 });
  }
  if (!Number.isFinite(priority) || priority < 0) {
    return NextResponse.json({ ok: false, error: "priority debe ser un número >= 0" }, { status: 400 });
  }

  const row = await upsertPriority({
    xintelId,
    priority: Math.round(priority),
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
    return NextResponse.json({ ok: false, error: "xintel_id requerido" }, { status: 400 });
  }
  await deletePriority(xintelId);
  revalidateAll();
  return NextResponse.json({ ok: true });
}
