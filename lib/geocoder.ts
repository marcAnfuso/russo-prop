/**
 * Resolver de direcciones / lugares → coordenadas (lat/lng) usando
 * Google Geocoding API. Sólo usado como fallback cuando `findPOI`
 * no encontró match en la tabla local. Tiene cache in-memory para
 * no repetir queries idénticas dentro del mismo runtime.
 *
 * Costo: USD 5 por 1.000 requests. Con cache + POIs primero, en la
 * práctica sólo gastamos en queries genuinamente nuevas.
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

const cache = new Map<string, GeocodeResult | null>();

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

/**
 * Resuelve un texto a coordenadas. Devuelve null si no encontró
 * algo razonable (sin location component, fuera de Argentina, etc.).
 *
 * Por defecto sesgamos la búsqueda hacia Buenos Aires / La Matanza
 * para que "estación" no devuelva una de Madrid o México.
 */
export async function geocodeAddress(
  query: string,
  options: { region?: string; bounds?: string } = {}
): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const key = normalize(trimmed);
  if (cache.has(key)) return cache.get(key) ?? null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    cache.set(key, null);
    return null;
  }

  // Si el query no incluye contexto geográfico, lo agregamos para
  // sesgar a zona oeste GBA. "Estación de Ramos" sin context devuelve
  // cosas raras; "Estación de Ramos, La Matanza, Argentina" devuelve
  // Ramos Mejía.
  const enriched =
    /argentina|buenos aires|la matanza/i.test(trimmed)
      ? trimmed
      : `${trimmed}, La Matanza, Buenos Aires, Argentina`;

  const params = new URLSearchParams({
    address: enriched,
    key: apiKey,
    region: options.region ?? "ar",
    language: "es",
  });
  if (options.bounds) params.set("bounds", options.bounds);

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) {
      cache.set(key, null);
      return null;
    }
    const top = data.results[0];
    const loc = top.geometry?.location;
    if (!loc?.lat || !loc?.lng) {
      cache.set(key, null);
      return null;
    }

    // Sanity check · debe estar en GBA. Si no, descartamos.
    const inGBA =
      loc.lat <= -34.3 &&
      loc.lat >= -35.2 &&
      loc.lng >= -59.0 &&
      loc.lng <= -58.2;
    if (!inGBA) {
      cache.set(key, null);
      return null;
    }

    const result: GeocodeResult = {
      lat: loc.lat,
      lng: loc.lng,
      formattedAddress: top.formatted_address ?? trimmed,
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
