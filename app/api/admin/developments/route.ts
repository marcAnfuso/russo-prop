import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  listDevelopments,
  upsertDevelopment,
  deleteDevelopment,
  getDevelopment,
} from "@/lib/developments-db";
import type { Development, DevelopmentStatus } from "@/data/types";

const VALID_STATUS: DevelopmentStatus[] = [
  "pre-venta",
  "pozo",
  "en-construccion",
  "terminado",
];

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function parsePayload(body: unknown): Development | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "payload inválido" };
  const b = body as Record<string, unknown>;

  const id = typeof b.id === "string" ? b.id.trim() : "";
  const code = typeof b.code === "string" ? b.code.trim() : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!id || !code || !name) return { error: "id, code y name son requeridos" };

  const status = typeof b.status === "string" ? b.status : "";
  if (!VALID_STATUS.includes(status as DevelopmentStatus)) {
    return { error: "status inválido" };
  }

  const num = (v: unknown, def = 0) => (typeof v === "number" ? v : def);
  const str = (v: unknown, def = "") => (typeof v === "string" ? v : def);

  const loc = b.location as Record<string, unknown> | undefined;
  return {
    id,
    code,
    name,
    address: str(b.address),
    locality: str(b.locality),
    district: str(b.district),
    description: str(b.description),
    status: status as DevelopmentStatus,
    deliveryDate: str(b.deliveryDate),
    category: str(b.category),
    priceFrom: num(b.priceFrom),
    priceTo: num(b.priceTo),
    totalUnits: num(b.totalUnits),
    availableUnits: num(b.availableUnits),
    roomsRange: str(b.roomsRange),
    areaRange: str(b.areaRange),
    coveredAreaRange: str(b.coveredAreaRange),
    bathrooms: num(b.bathrooms),
    amenities: asStringArray(b.amenities),
    images: asStringArray(b.images),
    videoUrl: typeof b.videoUrl === "string" && b.videoUrl ? b.videoUrl : undefined,
    location: {
      lat: num(loc?.lat),
      lng: num(loc?.lng),
    },
    elevators: typeof b.elevators === "number" ? b.elevators : undefined,
    featured: Boolean(b.featured),
  };
}

export async function GET(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const d = await getDevelopment(id);
    if (!d) return NextResponse.json({ ok: false, error: "no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, development: d });
  }
  const list = await listDevelopments();
  return NextResponse.json({ ok: true, developments: list });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = parsePayload(body);
  if ("error" in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  await upsertDevelopment(parsed, me.username);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id requerido" }, { status: 400 });
  }
  await deleteDevelopment(id);
  return NextResponse.json({ ok: true });
}
