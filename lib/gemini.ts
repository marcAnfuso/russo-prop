import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

/**
 * Lazy singleton Gemini client. Throws at call time (not import time) so
 * the rest of the app still builds when GOOGLE_GENAI_API_KEY isn't set
 * locally.
 */
export function gemini(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENAI_API_KEY is not set. Add it to .env.local (dev) and to Vercel env vars (prod)."
    );
  }
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

/** Model id for short, cheap, bounded responses. Swap here if Google ships a newer Flash. */
export const FLASH_MODEL = "gemini-2.5-flash";
