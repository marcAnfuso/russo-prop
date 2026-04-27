"use client";

import { useState, FormEvent } from "react";
import { Bell, Video, Film, Trash2, Instagram, ExternalLink, Pencil, X, Check } from "lucide-react";

export type MediaCategory = "campana" | "tour" | "otro";
export type MediaPlatform = "instagram" | "tiktok" | "youtube" | "otro";

export interface MediaPick {
  id: string;
  url: string;
  platform: MediaPlatform;
  category: MediaCategory;
  title: string | null;
  position: number;
  added_at: string;
}

const CATEGORY_LABEL: Record<MediaCategory, string> = {
  campana: "La campana",
  tour: "Tour de propiedad",
  otro: "Otro",
};

const CATEGORY_ICON: Record<MediaCategory, React.ElementType> = {
  campana: Bell,
  tour: Film,
  otro: Video,
};

function PlatformIcon({ p }: { p: MediaPlatform }) {
  if (p === "instagram") return <Instagram className="h-3.5 w-3.5" />;
  if (p === "tiktok")
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    );
  return <Video className="h-3.5 w-3.5" />;
}

export default function MediaPicksPanel({
  initial,
}: {
  initial: MediaPick[];
}) {
  const [items, setItems] = useState<MediaPick[]>(initial);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<MediaCategory>("campana");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Estado de edición de un item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<MediaCategory>("campana");

  function startEdit(item: MediaPick) {
    setEditingId(item.id);
    setEditUrl(item.url);
    setEditTitle(item.title ?? "");
    setEditCategory(item.category);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditUrl("");
    setEditTitle("");
  }
  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media-picks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          url: editUrl.trim(),
          title: editTitle.trim() || null,
          category: editCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "No se pudo guardar");
        return;
      }
      const list = await fetch("/api/admin/media-picks").then((r) => r.json());
      setItems(list.items ?? []);
      cancelEdit();
      setToast("Video actualizado");
      setTimeout(() => setToast(null), 1800);
    } catch {
      setError("Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/media-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), category, title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "No se pudo agregar");
        return;
      }
      // Refresh list
      const list = await fetch("/api/admin/media-picks").then((r) => r.json());
      setItems(list.items ?? []);
      setUrl("");
      setTitle("");
      setToast("Video agregado");
      setTimeout(() => setToast(null), 2000);
    } catch {
      setError("Error de red. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(id: string) {
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== id));
    try {
      const res = await fetch(
        `/api/admin/media-picks?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("bad response");
      setToast("Video quitado");
      setTimeout(() => setToast(null), 2000);
    } catch {
      setItems(prev);
      setToast("Error al quitar");
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1 text-navy">
        <span className="text-magenta">
          <Video className="h-5 w-5" />
        </span>
        <h2 className="font-display text-lg font-semibold">Videos de Instagram / TikTok</h2>
        <span className="ml-auto text-xs font-mono-price tabular-nums text-gray-400">
          {items.length}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Pegá la URL de un Reel o TikTok del feed oficial de Russo. El sitio los muestra embebidos en
        una sección de la home. Ideal: videos de la campanita 🔔 y tours de propiedades.
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="space-y-2 mb-5">
        <input
          type="url"
          required
          placeholder="https://www.instagram.com/reel/XXXXXX/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/30"
        />
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Título corto (opcional — ej: &quot;Familia López en Ramos Mejía&quot;)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="flex-1 min-w-[200px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/30"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MediaCategory)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/30"
          >
            <option value="campana">🔔 La campana</option>
            <option value="tour">🎥 Tour de propiedad</option>
            <option value="otro">Otro</option>
          </select>
          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="rounded-lg bg-magenta text-white font-semibold px-4 py-2 text-sm transition-colors hover:bg-magenta-600 disabled:opacity-50"
          >
            {busy ? "Agregando…" : "Agregar"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic py-4">
          Todavía no cargaste ningún video. Agregá el primero arriba.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const CatIcon = CATEGORY_ICON[item.category];
            const isEditing = editingId === item.id;

            if (isEditing) {
              return (
                <li
                  key={item.id}
                  className="rounded-lg border border-magenta/30 bg-magenta-50/30 px-3 py-3 space-y-2"
                >
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="URL del video"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título (opcional)"
                      className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as MediaCategory)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
                    >
                      <option value="campana">🔔 La campana</option>
                      <option value="tour">🎬 Tour</option>
                      <option value="otro">📌 Otro</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={busy}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(item.id)}
                      disabled={busy || !editUrl.trim()}
                      className="inline-flex items-center gap-1 rounded-md bg-magenta px-3 py-1.5 text-xs font-semibold text-white hover:bg-magenta-600 disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" />
                      Guardar
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-2.5"
              >
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-magenta-50 text-magenta flex-shrink-0">
                  <CatIcon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy truncate">
                    {item.title || item.url}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400">
                    <PlatformIcon p={item.platform} />
                    {CATEGORY_LABEL[item.category]}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 hover:text-magenta transition-colors ml-2"
                    >
                      Abrir
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label="Editar"
                    className="text-gray-400 hover:text-navy transition-colors p-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label="Quitar"
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-navy text-white px-5 py-2.5 text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </section>
  );
}
