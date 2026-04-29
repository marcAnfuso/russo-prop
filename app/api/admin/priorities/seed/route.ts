import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { fetchAllProperties } from "@/lib/xintel";
import { seedPriorities } from "@/lib/priorities-db";

const PUBLIC_PATHS = ["/", "/ventas", "/alquileres"];

export async function POST() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Traemos todas las propiedades (ventas + alquileres) y filtramos las
  // que tienen prioridad cargada en Xintel (in_ord2 > 0). El seed es
  // idempotente: si ya hay un override en DB, no lo pisa.
  const [ventas, alquileres] = await Promise.all([
    fetchAllProperties("venta"),
    fetchAllProperties("alquiler"),
  ]);
  const all = [...ventas, ...alquileres];
  const entries = all
    .filter((p) => (p.priority ?? 0) > 0)
    .map((p) => ({ xintelId: p.id, priority: p.priority ?? 0 }));

  const inserted = await seedPriorities(entries, me.username);
  for (const path of PUBLIC_PATHS) revalidatePath(path);
  return NextResponse.json({
    ok: true,
    candidates: entries.length,
    inserted,
    skipped: entries.length - inserted,
  });
}
