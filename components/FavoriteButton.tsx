"use client";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";

export default function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { toggle, isFavorite } = useFavorites();
  const active = isFavorite(propertyId);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(propertyId); }}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className="absolute top-3 right-3 z-40 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
    >
      <Heart className={`h-4 w-4 transition-colors ${active ? "fill-magenta text-magenta" : "text-navy-300"}`} />
    </button>
  );
}
