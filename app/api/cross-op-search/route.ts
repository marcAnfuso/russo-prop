import { NextRequest, NextResponse } from "next/server";
import { fetchAllProperties } from "@/lib/xintel";
import type { Property } from "@/data/types";

export const dynamic = "force-dynamic";

/** Normaliza igual que FilterBar: minúsculas, sin acentos. */
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Cuenta cuántas propiedades de una operación matchean una búsqueda
 * (texto libre + tipo + zonas). Lo usa el empty-state de un listado para
 * ofrecer "esto no está en venta, pero hay N en alquiler" (y viceversa).
 *
 * Aplica EXACTAMENTE los mismos matchers que FilterBar para q/type/zones,
 * así el conteo coincide con lo que el usuario ve al hacer click. Los
 * filtros avanzados (precio, ambientes, etc.) viven en localStorage y no
 * viajan por URL, así que no entran acá · el objetivo es sólo el "descubrí
 * que existe en la otra operación".
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const operation =
    searchParams.get("operation") === "alquiler" ? "alquiler" : "venta";
  const q = (searchParams.get("q") ?? "").trim();
  const typeParam = (searchParams.get("type") ?? "").trim();
  const zonesParam = (searchParams.get("zones") ?? "").trim();
  const zones = zonesParam ? zonesParam.split(",").filter(Boolean) : [];

  // Sin criterio no hay nada que sugerir.
  if (!q && !typeParam && zones.length === 0) {
    return NextResponse.json({ count: 0, operation });
  }

  let result: Property[];
  try {
    result = await fetchAllProperties(operation);
  } catch {
    return NextResponse.json({ count: 0, operation });
  }

  // zones · matchea contra locality (barrio) Y district (partido)
  if (zones.length > 0) {
    const lower = zones.map((z) => z.toLowerCase());
    result = result.filter((p) => {
      const loc = p.locality.toLowerCase();
      const dist = (p.district ?? "").toLowerCase();
      return lower.includes(loc) || (dist !== "" && lower.includes(dist));
    });
  }

  // type · soporta coma-separado + variantes "type:subtype"
  if (typeParam) {
    const allowed = typeParam.split(",").map((t) => t.trim()).filter(Boolean);
    if (allowed.length > 0) {
      const matchers = allowed.map((entry) => {
        const [t, sub] = entry.split(":");
        return { type: t, subtype: sub ? norm(sub) : null };
      });
      result = result.filter((p) =>
        matchers.some((m) => {
          if (p.type !== m.type) return false;
          if (!m.subtype) return true;
          return norm(p.subtype ?? "").includes(m.subtype);
        })
      );
    }
  }

  // text query · address, locality, district, code (sin acentos)
  if (q) {
    const nq = norm(q);
    result = result.filter((p) => {
      const haystack = norm(
        [p.address, p.locality, p.district, p.code].filter(Boolean).join(" ")
      );
      return haystack.includes(nq);
    });
  }

  return NextResponse.json({ count: result.length, operation });
}
