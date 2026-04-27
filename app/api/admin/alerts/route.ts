import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listAllAlerts, deleteAlertById, deactivateByToken } from "@/lib/alerts-db";

export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const alerts = await listAllAlerts();
  return NextResponse.json({ ok: true, alerts });
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  const token = req.nextUrl.searchParams.get("token");

  if (Number.isFinite(id) && id > 0) {
    await deleteAlertById(id);
    return NextResponse.json({ ok: true });
  }
  if (token) {
    await deactivateByToken(token);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Falta id o token" }, { status: 400 });
}
