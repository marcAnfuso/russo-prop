"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";

interface ShareButtonProps {
  property: Pick<
    Property,
    "id" | "code" | "operation" | "type" | "price" | "currency" | "address" | "locality"
  >;
  /** Variante visual · "card" usa el mismo estilo que FavoriteButton
   * (overlay sobre la imagen, fondo blanco semitransparente) */
  variant?: "card" | "ghost";
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://russopropiedades.com.ar";

function buildShare(p: ShareButtonProps["property"]) {
  const url = `${SITE_URL}/propiedad/${p.id}`;
  const currency = p.currency === "ARS" ? "$" : "USD";
  const priceLabel =
    p.price === 9999999 ? "Reservado" : `${currency} ${formatPrice(p.price)}`;
  const opLabel = p.operation === "alquiler" ? "alquiler" : "venta";
  const typeLabel = p.type.charAt(0).toUpperCase() + p.type.slice(1);
  const text = `${typeLabel} en ${opLabel} · ${priceLabel}\n${p.address}, ${p.locality}\n\nMirá la ficha completa en Russo Propiedades:`;
  return { url, title: `Russo Propiedades · ${p.code}`, text };
}

export default function ShareButton({ property, variant = "card" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const data = buildShare(property);
    // Native Share API (mobile) · iOS y Android lo soportan
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user canceló o no se pudo · caemos a copiar
      }
    }
    // Fallback desktop: copiar link al portapapeles
    try {
      await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // último fallback · seleccionar texto en un input invisible (raro)
      window.prompt("Copiá este link:", data.url);
    }
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label={copied ? "Link copiado" : "Compartir propiedad"}
        title={copied ? "Link copiado" : "Compartir"}
        className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-magenta hover:bg-gray-100 transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
      </button>
    );
  }

  // Variante card · overlay sobre la imagen, mismo estilo que FavoriteButton
  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copiado" : "Compartir propiedad"}
      title={copied ? "Link copiado" : "Compartir"}
      className="absolute top-3 right-12 z-40 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Share2 className="h-4 w-4 text-navy-300 hover:text-navy transition-colors" />
      )}
    </button>
  );
}
