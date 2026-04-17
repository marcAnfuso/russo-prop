import { NextResponse } from "next/server";
import { snapshotStatus } from "@/lib/snapshot";

export async function GET() {
  try {
    const status = await snapshotStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
