import { NextRequest, NextResponse } from "next/server";
import { captureSnapshot } from "@/lib/snapshot";

// Snapshotting a few hundred rows takes ~10-30s. Give it headroom.
export const maxDuration = 60;

/**
 * Protected snapshot trigger. Vercel Cron calls this with
 *   Authorization: Bearer <CRON_SECRET>
 * You can also call it manually with ?token=<CRON_SECRET>.
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET env var not set" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const urlToken = req.nextUrl.searchParams.get("token") ?? "";
  const authed =
    authHeader === `Bearer ${secret}` || urlToken === secret;
  if (!authed) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await captureSnapshot();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
