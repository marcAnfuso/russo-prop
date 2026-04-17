import { NextResponse } from "next/server";
import { fetchMarketAggregate } from "@/lib/xintel";

// Match lib/xintel.ts REVALIDATE (30 min). Must be a literal for Next's
// segment-config static analysis.
export const revalidate = 1800;

export async function GET() {
  const aggregate = await fetchMarketAggregate();
  return NextResponse.json({ aggregate });
}
