import { NextRequest, NextResponse } from "next/server";
import { fetchProperty } from "@/lib/xintel";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}
