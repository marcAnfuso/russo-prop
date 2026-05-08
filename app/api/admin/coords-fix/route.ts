import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { fetchAllProperties } from "@/lib/xintel";
import { geocodeAddress } from "@/lib/geocoder";
import {
  checkCoordsSuspect,
  getCoordsOverrideMap,
  setCoordsOverride,
  listCoordsOverrides,
  deleteCoordsOverride,
} from "@/lib/coords-overrides";

export const maxDuration = 300; // 5 min · puede ser largo si hay muchas

/**
 * GET · lista las propiedades sospechosas + las que ya tienen override.
 * Útil para el panel admin sin disparar geocoding.
 */
export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [ventas, alquileres, overrides] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
    listCoordsOverrides(),
  ]);
  const overrideIds = new Set(overrides.map((o) => o.xintel_id));

  const all = [...ventas, ...alquileres];
  const seen = new Set<string>();
  const suspects: Array<{
    id: string;
    code: string;
    address: string;
    locality: string;
    currentLat: number;
    currentLng: number;
    reason: string;
    distanceKm?: number;
    hasOverride: boolean;
  }> = [];

  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const check = checkCoordsSuspect(p.location.lat, p.location.lng, p.locality);
    if (check.isSuspect) {
      suspects.push({
        id: p.id,
        code: p.code,
        address: p.address,
        locality: p.locality,
        currentLat: p.location.lat,
        currentLng: p.location.lng,
        reason: check.reason ?? "",
        distanceKm: check.distanceKm,
        hasOverride: overrideIds.has(p.id),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    suspects,
    overrides,
    counts: {
      total: seen.size,
      suspects: suspects.length,
      overridden: overrides.length,
      pending: suspects.filter((s) => !s.hasOverride).length,
    },
  });
}

/**
 * POST · ejecuta el batch de geocoding contra Google para todas las
 * sospechosas que aún no tengan override. Cada propiedad cuesta
 * aprox USD 0.005 (Geocoding API). Cacheable: solo se hace una vez
 * por propiedad y queda en DB.
 *
 * Body opcional:
 *   - { ids: string[] } · solo geocodifica esos IDs
 *   - { force: true } · re-geocodifica aunque tenga override
 */
export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const onlyIds: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined;
  const force = body.force === true;

  const [ventas, alquileres, overrideMap] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
    getCoordsOverrideMap(),
  ]);
  const all = [...ventas, ...alquileres];
  const seen = new Set<string>();

  // Detectar las que necesitan geocoding
  const toFix: typeof all = [];
  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (onlyIds && !onlyIds.includes(p.id)) continue;
    if (!force && overrideMap.has(p.id)) continue;
    if (onlyIds && onlyIds.includes(p.id)) {
      // si lo pidió específicamente, lo geocodifica aunque sea OK
      toFix.push(p);
      continue;
    }
    const check = checkCoordsSuspect(p.location.lat, p.location.lng, p.locality);
    if (check.isSuspect) toFix.push(p);
  }

  let geocoded = 0;
  let failed = 0;
  const results: Array<{ id: string; status: "ok" | "no_result" | "error"; addr: string }> = [];

  for (const p of toFix) {
    const query = `${p.address}, ${p.locality}, La Matanza, Buenos Aires, Argentina`;
    try {
      const r = await geocodeAddress(query);
      if (r) {
        await setCoordsOverride({
          xintelId: p.id,
          lat: r.lat,
          lng: r.lng,
          source: "geocoded-google",
          notes: `original: ${p.location.lat.toFixed(5)},${p.location.lng.toFixed(5)} · ${r.formattedAddress}`,
        });
        geocoded++;
        results.push({ id: p.id, status: "ok", addr: p.address });
      } else {
        failed++;
        results.push({ id: p.id, status: "no_result", addr: p.address });
      }
    } catch {
      failed++;
      results.push({ id: p.id, status: "error", addr: p.address });
    }
    // Pequeño delay para no flood Google · 50ms entre calls
    await new Promise((r) => setTimeout(r, 50));
  }

  // Revalidar las páginas públicas para que reflejen las nuevas coords
  revalidatePath("/");
  revalidatePath("/ventas");
  revalidatePath("/alquileres");

  return NextResponse.json({
    ok: true,
    processed: toFix.length,
    geocoded,
    failed,
    results: results.slice(0, 50), // primeras 50 para que la response no sea enorme
  });
}

/** DELETE · borra un override puntual (vuelve a usar las coords de Xintel) */
export async function DELETE(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }
  await deleteCoordsOverride(id);
  revalidatePath("/");
  revalidatePath("/ventas");
  revalidatePath("/alquileres");
  return NextResponse.json({ ok: true });
}
