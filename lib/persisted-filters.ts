/**
 * Helpers para persistir el estado avanzado de FilterBar en localStorage
 * con TTL de 24h. Lo "compartible" (type, zones, q, page, sort) vive en
 * la URL; este módulo se encarga del resto.
 *
 * Diseñado para fallar silencioso · si localStorage no está disponible
 * (privado, quota, SSR) las funciones devuelven null o no hacen nada.
 */

const TTL_MS = 24 * 60 * 60 * 1000;

interface PersistedRecord<T> {
  filters: T;
  savedAt: number;
}

export function loadFilters<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedRecord<T> | null;
    if (!parsed || !parsed.filters || typeof parsed.savedAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.savedAt > TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.filters;
  } catch {
    return null;
  }
}

export function saveFilters<T>(key: string, filters: T): void {
  if (typeof window === "undefined") return;
  try {
    const record: PersistedRecord<T> = {
      filters,
      savedAt: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // private mode / quota · ignorar
  }
}

export function clearPersistedFilters(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Key estable por operación · `russo:filters:venta` / `russo:filters:alquiler` */
export function filterStorageKey(operation: "venta" | "alquiler"): string {
  return `russo:filters:${operation}`;
}
