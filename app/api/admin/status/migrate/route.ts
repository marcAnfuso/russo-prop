import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { fetchAllProperties } from "@/lib/xintel";
import { listPicks } from "@/lib/picks";
import { seedStatuses } from "@/lib/status-db";

const PUBLIC_PATHS = ["/", "/ventas", "/alquileres"];

/**
 * Migración inicial · idempotente. Lee:
 *   - feed Xintel (todas las que tengan price=9999999) → seed como 'reserved'
 *   - manual_picks list_key='sold' → seed como 'sold'
 * Sólo inserta si no existe override previo (ON CONFLICT DO NOTHING).
 * Se puede correr varias veces sin pisar overrides ya seteados desde admin.
 */
export async function POST() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [props, soldIds] = await Promise.all([
    fetchAllProperties(),
    listPicks("sold").catch(() => [] as string[]),
  ]);

  const reservedIds = props
    .filter((p) => p.price === 9999999)
    .map((p) => p.id);

  const reservedInserted = await seedStatuses(
    reservedIds.map((id) => ({ xintelId: id, status: "reserved" as const })),
    `migrate:${me.username}`
  );

  const soldInserted = await seedStatuses(
    soldIds.map((id) => ({ xintelId: id, status: "sold" as const })),
    `migrate:${me.username}`
  );

  for (const p of PUBLIC_PATHS) revalidatePath(p);

  return NextResponse.json({
    ok: true,
    reserved: { found: reservedIds.length, inserted: reservedInserted },
    sold: { found: soldIds.length, inserted: soldInserted },
  });
}
