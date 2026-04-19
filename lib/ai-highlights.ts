import { createHash } from "crypto";
import type { Property } from "@/data/types";
import { sql } from "./db";
import { gemini, FLASH_MODEL } from "./gemini";

export interface Highlight {
  /** Short emoji or symbol to precede the bullet. */
  icon?: string;
  /** 4-10 word headline describing the upside. */
  text: string;
}

async function ensureHighlightsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS ai_highlights (
      property_id TEXT PRIMARY KEY,
      highlights JSONB NOT NULL,
      source_hash TEXT NOT NULL,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

/** Stable hash of the source material. If it changes, we regenerate. */
function sourceHash(property: Property): string {
  const parts = [
    property.description ?? "",
    property.amenities.join(","),
    String(property.features.rooms ?? ""),
    String(property.features.bedrooms ?? ""),
    String(property.features.bathrooms ?? ""),
    String(property.features.garage ?? ""),
    String(property.features.totalArea ?? ""),
    String(property.features.coveredArea ?? ""),
    property.address ?? "",
    property.locality ?? "",
    property.subtype ?? "",
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

function buildPrompt(property: Property): string {
  const feat = property.features;
  return `Sos un asistente que resume propiedades inmobiliarias para mostrar 4 a 6 puntos clave en la ficha.

IMPORTANTE:
- Respondé SOLO en base a la data que te paso. NO inventes dirección, distancias exactas, barrios, años, ni características que no estén explícitas.
- Si no hay algo destacable suficiente, devolvé menos puntos (3 es OK).
- Cada punto: corto (4-10 palabras), útil, concreto. Nada de marketing vacío ("hermosa propiedad", "oportunidad única").
- Castellano rioplatense (voseo OK). Sin tildes raras.
- Agregá un emoji relevante al principio de cada punto.
- Respondé SOLO con JSON válido de la forma:
  { "highlights": [{ "icon": "🏡", "text": "..." }, ...] }

Data de la propiedad:
- Tipo: ${property.type}${property.subtype ? ` (${property.subtype})` : ""}
- Operación: ${property.operation}
- Dirección: ${property.address}
- Barrio: ${property.locality}${property.district ? `, ${property.district}` : ""}
- Ambientes: ${feat.rooms ?? "s/d"}
- Dormitorios: ${feat.bedrooms ?? "s/d"}
- Baños: ${feat.bathrooms ?? "s/d"}
- Cocheras: ${feat.garage ?? "s/d"}
- Superficie cubierta: ${feat.coveredArea ?? "s/d"} m²
- Superficie total: ${feat.totalArea ?? "s/d"} m²
- Antigüedad: ${feat.age != null ? `${feat.age} años` : "s/d"}
- Amenities (solo las que están en esta lista):
${property.amenities.length ? property.amenities.map((a) => `  · ${a}`).join("\n") : "  · (ninguna cargada)"}

Descripción original:
${property.description || "(sin descripción)"}

Respondé SOLO con el JSON.`;
}

function parseHighlightsJSON(raw: string): Highlight[] {
  // Gemini often wraps JSON in ```json fences — strip them.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/g, "")
    .trim();
  try {
    const data = JSON.parse(cleaned);
    const arr = Array.isArray(data) ? data : data?.highlights;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((h: unknown): Highlight | null => {
        if (!h || typeof h !== "object") return null;
        const obj = h as { icon?: unknown; text?: unknown };
        const text = typeof obj.text === "string" ? obj.text.trim() : "";
        const icon = typeof obj.icon === "string" ? obj.icon.trim() : "";
        if (!text) return null;
        return { icon: icon || undefined, text };
      })
      .filter((h): h is Highlight => h !== null)
      .slice(0, 6);
  } catch {
    return [];
  }
}

async function readCached(
  propertyId: string,
  hash: string
): Promise<Highlight[] | null> {
  const db = sql();
  const rows = (await db`
    SELECT highlights, source_hash
    FROM ai_highlights
    WHERE property_id = ${propertyId}
    LIMIT 1
  `) as unknown as { highlights: Highlight[]; source_hash: string }[];
  if (!rows.length) return null;
  if (rows[0].source_hash !== hash) return null;
  return rows[0].highlights;
}

async function writeCache(
  propertyId: string,
  hash: string,
  highlights: Highlight[]
): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO ai_highlights (property_id, highlights, source_hash)
    VALUES (${propertyId}, ${JSON.stringify(highlights)}::jsonb, ${hash})
    ON CONFLICT (property_id) DO UPDATE SET
      highlights = EXCLUDED.highlights,
      source_hash = EXCLUDED.source_hash,
      generated_at = now()
  `;
}

/**
 * Get the 4-6 AI-generated bullets for a property. Cached in Postgres
 * keyed by (property_id, source_hash). Regenerates automatically if the
 * Xintel description or features change.
 */
export async function getHighlightsForProperty(
  property: Property
): Promise<Highlight[]> {
  await ensureHighlightsSchema();
  const hash = sourceHash(property);

  const cached = await readCached(property.id, hash);
  if (cached) return cached;

  try {
    const res = await gemini().models.generateContent({
      model: FLASH_MODEL,
      contents: buildPrompt(property),
      config: {
        temperature: 0.3,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
      },
    });
    const raw = res.text ?? "";
    const highlights = parseHighlightsJSON(raw);
    if (highlights.length > 0) {
      await writeCache(property.id, hash, highlights);
    }
    return highlights;
  } catch (e) {
    console.error("[ai-highlights] generation failed", e);
    return [];
  }
}
