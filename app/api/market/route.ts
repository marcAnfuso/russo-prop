import { NextResponse } from "next/server";
import { fetchMarketAggregate, REVALIDATE } from "@/lib/xintel";

export const revalidate = REVALIDATE;

export async function GET() {
  const aggregate = await fetchMarketAggregate();
  return NextResponse.json({ aggregate });
}
