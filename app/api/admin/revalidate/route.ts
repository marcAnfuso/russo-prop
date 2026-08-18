import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/admin-auth";

/**
 * Trigger de refresco de caché · lo dispara el botón "Actualizar Xintel" del
 * admin. Cuando el equipo cambia algo en Xintel (ej. el precio de una unidad)
 * y no quiere esperar los 30 min de revalidación, purga acá el caché de las
 * páginas que traen datos de Xintel. La próxima visita re-fetchea con los
 * datos frescos.
 *
 * Usamos revalidatePath (estable en Next 16) · con el type "page" cubrimos
 * TODAS las instancias de las rutas dinámicas (cada ficha / cada emprendimiento).
 */
export async function POST() {
  const me = await getCurrentAdmin();
  if (!me) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Listados y home
  for (const p of ["/", "/ventas", "/alquileres", "/emprendimientos"]) {
    revalidatePath(p);
  }
  // Todas las fichas de propiedad y de emprendimiento (rutas dinámicas)
  revalidatePath("/propiedad/[id]", "page");
  revalidatePath("/emprendimiento/[id]", "page");

  return NextResponse.json({ ok: true });
}
