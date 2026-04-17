"use client";

import { useState } from "react";
import { Heart, Share2, Check } from "lucide-react";
import { useFavorites } from "@/lib/favorites";

interface DetailHeaderActionsProps {
  propertyId: string;
  title: string;
}

export default function DetailHeaderActions({
  propertyId,
  title,
}: DetailHeaderActionsProps) {
  const { isFavorite, toggle } = useFavorites();
  const [shareCopied, setShareCopied] = useState(false);

  const favorited = isFavorite(propertyId);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: `Russo Propiedades · ${title}`, url };

    // Use Web Share API when available (mobile / some desktops)
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or API rejected — fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Older browsers
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Last-resort: prompt
      window.prompt("Copiá el enlace:", url);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={() => toggle(propertyId)}
        aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={favorited}
        className={`rounded-full border p-2 transition-all duration-200 active:scale-95 ${
          favorited
            ? "border-magenta bg-magenta/10 text-magenta"
            : "border-gray-300 text-gray-500 hover:border-magenta hover:text-magenta"
        }`}
      >
        <Heart
          className={`h-5 w-5 transition-transform ${
            favorited ? "fill-current scale-110" : ""
          }`}
        />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartir propiedad"
          className="rounded-full border border-gray-300 p-2 text-gray-500 transition-colors hover:border-magenta hover:text-magenta active:scale-95"
        >
          {shareCopied ? (
            <Check className="h-5 w-5 text-emerald-600" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </button>

        {shareCopied && (
          <span className="absolute top-full right-0 mt-2 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white shadow-lg">
            ¡Enlace copiado!
          </span>
        )}
      </div>
    </div>
  );
}
