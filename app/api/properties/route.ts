import { NextRequest, NextResponse } from "next/server";
import { fetchProperties } from "@/lib/xintel";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const operation = searchParams.get("operation") as "venta" | "alquiler" | null;
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  // Note: property type filtering is done client-side by FilterBar component
  // Xintel API does not support server-side type filtering via the 'tip' parameter
  const result = await fetchProperties({ operation: operation ?? undefined, page });
  return NextResponse.json(result);
}
