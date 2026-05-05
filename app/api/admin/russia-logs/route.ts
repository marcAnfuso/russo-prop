import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listRussiaLogs } from "@/lib/russia-logs";

export async function GET(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const ipHash = sp.get("ip_hash") ?? undefined;
  const limit = Number(sp.get("limit") ?? "30");
  const offset = Number(sp.get("offset") ?? "0");

  const { rows, total } = await listRussiaLogs({
    q,
    ipHash,
    limit: Number.isFinite(limit) ? limit : 30,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return NextResponse.json({ rows, total });
}
