import { NextRequest, NextResponse } from "next/server";
import {
  applyReaction,
  type ReactionEmoji,
} from "@/lib/media-reactions";

const ALLOWED: ReactionEmoji[] = ["heart", "home", "key"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const mediaId = typeof body.media_id === "string" ? body.media_id.trim() : "";
  const emoji = body.emoji as unknown;
  const action = body.action;

  if (!mediaId) {
    return NextResponse.json({ ok: false, error: "media_id requerido" }, { status: 400 });
  }
  if (typeof emoji !== "string" || !ALLOWED.includes(emoji as ReactionEmoji)) {
    return NextResponse.json({ ok: false, error: "emoji inválido" }, { status: 400 });
  }
  if (action !== "add" && action !== "remove") {
    return NextResponse.json({ ok: false, error: "action debe ser add o remove" }, { status: 400 });
  }

  const counts = await applyReaction(
    mediaId,
    emoji as ReactionEmoji,
    action === "add" ? 1 : -1
  );
  return NextResponse.json({ ok: true, counts });
}
