import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listRussiaSessions } from "@/lib/russia-logs";

/**
 * Páginas siguientes de charlas para el panel de Russia.
 *
 * La vista cargaba sólo las 30 sesiones más recientes y no había forma de
 * ver más atrás — en septiembre de 2026 eso tapaba todo lo anterior al 11.
 * El cliente ya recibía `pageSize` pero lo descartaba con `void pageSize`:
 * la paginación estaba a medio hacer. Esto la completa.
 *
 * Va aparte de /api/admin/russia-logs porque aquella devuelve mensajes
 * sueltos y ésta devuelve charlas agrupadas, que es lo que pinta la vista.
 */
export async function GET(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const limit = Number(sp.get("limit") ?? "100");
  const offset = Number(sp.get("offset") ?? "0");

  const { sessions, total } = await listRussiaSessions({
    limit: Number.isFinite(limit) ? limit : 100,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return NextResponse.json({ ok: true, sessions, total });
}
