import { NextRequest, NextResponse } from "next/server";
import { fetchProperty } from "@/lib/xintel";
import { getHighlightsForProperty } from "@/lib/ai-highlights";

// Gemini + DB round-trip can take a few seconds on a cold cache.
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }
  try {
    const property = await fetchProperty(id);
    if (!property) {
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 }
      );
    }
    const highlights = await getHighlightsForProperty(property);
    return NextResponse.json({ ok: true, highlights });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
