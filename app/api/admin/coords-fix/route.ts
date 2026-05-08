import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { fetchAllProperties } from "@/lib/xintel";
import { geocodeAddress } from "@/lib/geocoder";
import {
  checkCoordsSuspect,
  cleanXintelAddress,
  setCoordsOverride,
  listCoordsOverrides,
  approveCoordsOverride,
  ignoreCoordsOverride,
  deleteCoordsOverride,
  getIgnoredIds,
} from "@/lib/coords-overrides";

export const maxDuration = 300;

/**
 * GET · devuelve:
 *   - suspects (sospechosas SIN preview todavía)
 *   - pending (con preview ya generado, esperando aprobación)
 *   - applied (aprobadas)
 *   - ignored (descartadas por Ramita)
 */
export async function GET() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [ventas, alquileres, allOverrides, ignoredSet] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
    listCoordsOverrides(),
    getIgnoredIds(),
  ]);

  const overrideById = new Map(allOverrides.map((o) => [o.xintel_id, o]));

  const all = [...ventas, ...alquileres];
  const seen = new Set<string>();
  const suspects: Array<{
    id: string;
    code: string;
    address: string;
    locality: string;
    type: string;
    currentLat: number;
    currentLng: number;
    reason: string;
    distanceKm?: number;
    specialCase?: boolean;
    specialReason?: string;
  }> = [];

  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (overrideById.has(p.id)) continue; // ya tiene preview/applied/ignored
    if (ignoredSet.has(p.id)) continue;
    const check = checkCoordsSuspect(p.location.lat, p.location.lng, p.locality, p.type);
    if (check.isSuspect) {
      suspects.push({
        id: p.id,
        code: p.code,
        address: p.address,
        locality: p.locality,
        type: p.type,
        currentLat: p.location.lat,
        currentLng: p.location.lng,
        reason: check.reason ?? "",
        distanceKm: check.distanceKm,
        specialCase: check.specialCase,
        specialReason: check.specialReason,
      });
    }
  }

  // Enriquecer pending/applied/ignored con info de la propiedad +
  // chequear si es caso especial para mostrar el badge en el UI.
  const propById = new Map(all.map((p) => [p.id, p]));
  const enriched = allOverrides.map((o) => {
    const p = propById.get(o.xintel_id);
    let specialCase: boolean | undefined;
    let specialReason: string | undefined;
    if (p) {
      const c = checkCoordsSuspect(p.location.lat, p.location.lng, p.locality, p.type);
      specialCase = c.specialCase;
      specialReason = c.specialReason;
    }
    return {
      ...o,
      code: p?.code ?? `RUS${o.xintel_id}`,
      address: p?.address ?? "(no en feed actual)",
      locality: p?.locality ?? "",
      type: p?.type ?? "",
      specialCase,
      specialReason,
    };
  });

  const pending = enriched.filter((o) => o.status === "pending");
  const applied = enriched.filter((o) => o.status === "applied");
  const ignored = enriched.filter((o) => o.status === "ignored");

  return NextResponse.json({
    ok: true,
    suspects,
    pending,
    applied,
    ignored,
    counts: {
      total: seen.size,
      suspects: suspects.length,
      pending: pending.length,
      applied: applied.length,
      ignored: ignored.length,
    },
  });
}

/**
 * POST · genera preview (geocodificación) para sospechosas. NO aplica
 * todavía · queda en estado 'pending' hasta que Ramita revise.
 *
 * Body opcional:
 *   - { ids: string[] } · solo procesa esos IDs
 *   - { all: true } · procesa TODAS las sospechosas que aún no tengan
 *     override en DB
 */
export async function POST(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const onlyIds: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined;
  const fetchAll = body.all === true;

  if (!onlyIds && !fetchAll) {
    return NextResponse.json(
      { ok: false, error: "Pasá { ids: [...] } o { all: true }" },
      { status: 400 }
    );
  }

  const [ventas, alquileres, allOverrides] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
    listCoordsOverrides(),
  ]);
  const overrideIds = new Set(allOverrides.map((o) => o.xintel_id));
  const all = [...ventas, ...alquileres];
  const seen = new Set<string>();

  const toGeocode: typeof all = [];
  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (overrideIds.has(p.id)) continue;
    if (onlyIds) {
      if (onlyIds.includes(p.id)) toGeocode.push(p);
      continue;
    }
    const check = checkCoordsSuspect(p.location.lat, p.location.lng, p.locality, p.type);
    if (check.isSuspect) toGeocode.push(p);
  }

  let geocoded = 0;
  let failed = 0;

  for (const p of toGeocode) {
    // Limpiar la dirección de Xintel antes de mandarla · evita confundir
    // al geocoder con "al", piso/depto, abreviaturas. Sube los aciertos
    // de ~8% a ~90% según el test de calidad.
    const cleanAddr = cleanXintelAddress(p.address);
    const query = `${cleanAddr}, ${p.locality}, Buenos Aires, Argentina`;
    try {
      const r = await geocodeAddress(query);
      if (r) {
        await setCoordsOverride({
          xintelId: p.id,
          lat: r.lat,
          lng: r.lng,
          originalLat: p.location.lat,
          originalLng: p.location.lng,
          source: "geocoded-google",
          status: "pending",
          notes: r.formattedAddress,
        });
        geocoded++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  return NextResponse.json({
    ok: true,
    processed: toGeocode.length,
    geocoded,
    failed,
  });
}

/**
 * PATCH · aplica acción sobre un override existente.
 * Body: { id: string, action: 'approve' | 'ignore' }
 */
export async function PATCH(req: NextRequest) {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  const action = body.action;
  if (!id || (action !== "approve" && action !== "ignore")) {
    return NextResponse.json(
      { ok: false, error: "Pasá id y action ('approve' o 'ignore')" },
      { status: 400 }
    );
  }
  if (action === "approve") {
    await approveCoordsOverride(id, me.username);
  } else {
    await ignoreCoordsOverride(id, me.username);
  }
  revalidatePath("/");
  revalidatePath("/ventas");
  revalidatePath("/alquileres");
  return NextResponse.json({ ok: true });
}

/** DELETE · borra el override (vuelve a usar coords de Xintel y permite re-geocodificar). */
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
