import { sql } from "./db";
// Las funciones puras viven en media-embed.ts para que el cliente pueda
// usarlas sin arrastrar la base ni la caché del servidor al navegador.
import { canonicalizeUrl, detectPlatform, type MediaPlatform } from "./media-embed";
export { detectPlatform, getEmbedUrl, canonicalizeUrl, type MediaPlatform } from "./media-embed";
import { invalidarLecturasDB, LECTURA_DB } from "./db-cache";
import { unstable_cache } from "next/cache";

export type MediaCategory = "campana" | "tour" | "otro";

export interface MediaPick {
  id: string;
  url: string;
  platform: MediaPlatform;
  category: MediaCategory;
  title: string | null;
  position: number;
  added_at: string;
  /** Código RUS opcional · si está, la card es clickeable y va a /propiedad/<id> */
  property_id: string | null;
}

export async function ensureMediaSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS media_picks (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      platform TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      added_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Migración aditiva · agregar property_id a tablas pre-existentes
  await db`ALTER TABLE media_picks ADD COLUMN IF NOT EXISTS property_id TEXT`;
  await db`
    CREATE INDEX IF NOT EXISTS idx_media_position
      ON media_picks (position ASC, added_at DESC)
  `;
}


export async function listMediaPicks(): Promise<MediaPick[]> {
  await ensureMediaSchema();
  const db = sql();
  const rows = (await db`
    SELECT id, url, platform, category, title, position, added_at, property_id
    FROM media_picks
    ORDER BY position ASC, added_at DESC
  `) as unknown as MediaPick[];
  return rows;
}

export async function addMediaPick(params: {
  id: string;
  url: string;
  category: MediaCategory;
  title?: string;
  propertyId?: string | null;
}): Promise<void> {
  await ensureMediaSchema();
  const db = sql();
  const platform = detectPlatform(params.url);
  const url = canonicalizeUrl(params.url);
  await db`
    INSERT INTO media_picks (id, url, platform, category, title, property_id)
    VALUES (${params.id}, ${url}, ${platform}, ${params.category}, ${params.title ?? null}, ${params.propertyId ?? null})
  `;
  invalidarLecturasDB();
}

export async function removeMediaPick(id: string): Promise<void> {
  const db = sql();
  await db`DELETE FROM media_picks WHERE id = ${id}`;
  invalidarLecturasDB();
}

export async function reorderMediaPicks(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = sql();
  for (let i = 0; i < ids.length; i++) {
    await db`UPDATE media_picks SET position = ${i} WHERE id = ${ids[i]}`;
  }
  invalidarLecturasDB();
}

export async function updateMediaPick(
  id: string,
  changes: { url?: string; title?: string | null; category?: MediaCategory; propertyId?: string | null }
): Promise<void> {
  await ensureMediaSchema();
  const db = sql();
  // Si la URL cambia, recomputamos plataforma y la canonicalizamos.
  if (changes.url !== undefined) {
    const url = canonicalizeUrl(changes.url);
    const platform = detectPlatform(url);
    await db`UPDATE media_picks SET url = ${url}, platform = ${platform} WHERE id = ${id}`;
  }
  if (changes.title !== undefined) {
    const t = changes.title === "" ? null : changes.title;
    await db`UPDATE media_picks SET title = ${t} WHERE id = ${id}`;
  }
  if (changes.category !== undefined) {
    await db`UPDATE media_picks SET category = ${changes.category} WHERE id = ${id}`;
  }
  if (changes.propertyId !== undefined) {
    const pid = changes.propertyId ? changes.propertyId.replace(/\D+/g, "") : null;
    await db`UPDATE media_picks SET property_id = ${pid || null} WHERE id = ${id}`;
  }
  invalidarLecturasDB();
}

/**
 * listMediaPicks para la página pública de historias: cacheada hasta que
 * el admin toque algo (cada escritura de este archivo invalida). La de
 * arriba, sin caché, queda para el admin.
 */
export const listMediaPicksPublic = unstable_cache(
  async (): Promise<MediaPick[]> => listMediaPicks(),
  ["media-picks-rows"],
  LECTURA_DB
);
