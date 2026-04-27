import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { exportEvents } from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Escape doble-comillas y envolver si tiene caracteres especiales
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const days = Number(req.nextUrl.searchParams.get("days")) || 7;
  const rows = await exportEvents(Math.min(days, 365));

  const header = ["ts", "session_id", "visitor_id", "type", "path", "property_id", "metadata"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.ts,
        r.session_id,
        r.visitor_id,
        r.type,
        r.path,
        r.property_id,
        r.metadata,
      ]
        .map(csvCell)
        .join(",")
    );
  }
  const csv = lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="russo-analytics-${days}d-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
