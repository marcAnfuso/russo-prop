import { sql } from "./db";

export type ReactionEmoji = "heart" | "home" | "key";

export interface ReactionCounts {
  heart: number;
  home: number;
  key: number;
}

const ZERO: ReactionCounts = { heart: 0, home: 0, key: 0 };

export async function ensureReactionsSchema(): Promise<void> {
  const db = sql();
  await db`
    CREATE TABLE IF NOT EXISTS media_reactions (
      media_id TEXT PRIMARY KEY,
      heart INTEGER NOT NULL DEFAULT 0,
      home INTEGER NOT NULL DEFAULT 0,
      key INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

/** Devuelve un Map<media_id, ReactionCounts> con TODOS los contadores. */
export async function getReactionsMap(): Promise<Map<string, ReactionCounts>> {
  await ensureReactionsSchema();
  const db = sql();
  const rows = (await db`
    SELECT media_id, heart, home, key FROM media_reactions
  `) as Array<{ media_id: string; heart: number; home: number; key: number }>;
  const map = new Map<string, ReactionCounts>();
  for (const r of rows) {
    map.set(r.media_id, { heart: r.heart, home: r.home, key: r.key });
  }
  return map;
}

export async function getReactions(mediaId: string): Promise<ReactionCounts> {
  await ensureReactionsSchema();
  const db = sql();
  const rows = (await db`
    SELECT heart, home, key FROM media_reactions WHERE media_id = ${mediaId}
  `) as Array<ReactionCounts>;
  return rows[0] ?? ZERO;
}

/**
 * Aplica un delta a un emoji. delta=+1 para sumar, -1 para restar.
 * Crea la fila si no existe (solo aplica delta=+1 en ese caso).
 * Devuelve los contadores actualizados.
 */
export async function applyReaction(
  mediaId: string,
  emoji: ReactionEmoji,
  delta: 1 | -1
): Promise<ReactionCounts> {
  await ensureReactionsSchema();
  const db = sql();

  // Upsert con delta
  if (emoji === "heart") {
    const rows = (await db`
      INSERT INTO media_reactions (media_id, heart)
      VALUES (${mediaId}, GREATEST(0, ${delta}))
      ON CONFLICT (media_id) DO UPDATE SET
        heart = GREATEST(0, media_reactions.heart + ${delta}),
        updated_at = now()
      RETURNING heart, home, key
    `) as Array<ReactionCounts>;
    return rows[0] ?? ZERO;
  }
  if (emoji === "home") {
    const rows = (await db`
      INSERT INTO media_reactions (media_id, home)
      VALUES (${mediaId}, GREATEST(0, ${delta}))
      ON CONFLICT (media_id) DO UPDATE SET
        home = GREATEST(0, media_reactions.home + ${delta}),
        updated_at = now()
      RETURNING heart, home, key
    `) as Array<ReactionCounts>;
    return rows[0] ?? ZERO;
  }
  // key
  const rows = (await db`
    INSERT INTO media_reactions (media_id, key)
    VALUES (${mediaId}, GREATEST(0, ${delta}))
    ON CONFLICT (media_id) DO UPDATE SET
      key = GREATEST(0, media_reactions.key + ${delta}),
      updated_at = now()
    RETURNING heart, home, key
  `) as Array<ReactionCounts>;
  return rows[0] ?? ZERO;
}
