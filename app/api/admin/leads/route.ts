import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  deleteLead,
  listLeads,
  updateLeadNotes,
  updateLeadStatus,
  type LeadType,
} from "@/lib/leads-db";

async function requireAdmin() {
  const me = await getCurrentAdmin();
  if (!me) {
    return { error: NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }
  return { user: me };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sp = req.nextUrl.searchParams;
  const statusRaw = sp.get("status") ?? "todos";
  const status =
    statusRaw === "nuevo" || statusRaw === "contactado" || statusRaw === "cerrado"
      ? statusRaw
      : "todos";
  const typeRaw = sp.get("type");
  const type =
    typeRaw === "contacto" || typeRaw === "tasacion" || typeRaw === "consulta"
      ? (typeRaw as LeadType)
      : undefined;
  const limit = Number(sp.get("limit") ?? "50");
  const offset = Number(sp.get("offset") ?? "0");

  const data = await listLeads({
    status,
    type,
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
  });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
  }
  if (typeof body.status === "string") {
    if (body.status !== "nuevo" && body.status !== "contactado" && body.status !== "cerrado") {
      return NextResponse.json({ ok: false, error: "status inválido" }, { status: 400 });
    }
    await updateLeadStatus(id, body.status);
  }
  if (typeof body.notes === "string") {
    await updateLeadNotes(id, body.notes);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
  }
  await deleteLead(id);
  return NextResponse.json({ ok: true });
}
