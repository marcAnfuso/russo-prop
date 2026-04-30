import { NextResponse } from "next/server";
import { fetchProperty } from "@/lib/xintel";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  const property = await fetchProperty(id);
  if (!property) {
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ images: property.images });
}
