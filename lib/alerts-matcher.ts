import type { Property } from "@/data/types";
import type { AlertCriterion } from "./alerts-db";

/**
 * Devuelve true si la propiedad satisface el criterio. Cualquier campo
 * del criterio que esté ausente se considera "match cualquiera".
 *
 * Conversión de moneda: si el criterion tiene priceMax en USD pero la
 * propiedad está en ARS (o viceversa), no aplicamos conversion FX —
 * comparamos sólo si las monedas coinciden. Esto evita matches falsos
 * por tasa desactualizada.
 */
export function matchesCriterion(
  p: Property,
  c: AlertCriterion
): boolean {
  if (c.operation && p.operation !== c.operation) return false;

  if (c.zones && c.zones.length > 0) {
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
    const propLoc = norm(p.locality);
    const matchesZone = c.zones.some((z) => norm(z) === propLoc);
    if (!matchesZone) return false;
  }

  if (c.types && c.types.length > 0) {
    if (!c.types.map((t) => t.toLowerCase()).includes(p.type)) return false;
  }

  if (c.rooms && c.rooms.length > 0) {
    const r = p.features.rooms ?? 0;
    if (!c.rooms.includes(r)) return false;
  }

  if (c.priceMax && c.priceMax > 0) {
    if (c.priceCurrency && c.priceCurrency !== p.currency) return false;
    if (p.price > c.priceMax) return false;
    // Excluir el sentinel de "Reservado/Consultar" (9999999) — no es un
    // precio real.
    if (p.price === 9999999) return false;
  }

  return true;
}
