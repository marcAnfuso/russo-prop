"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

export interface MapViewProps {
  properties?: Array<{
    id: string;
    title: string;
    price: number;
    currency?: "USD" | "ARS";
    address: string;
    location: { lat: number; lng: number };
    images: string[];
    operation?: string;
  }>;
  center?: [number, number];
  zoom?: number;
  highlightedId?: string | null;
  singleMarker?: boolean;
  className?: string;
}

const MapViewInner = dynamic(() => import("./MapViewInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
  ),
});

/**
 * Static Maps API URL · imagen estática (mucho más barata que un Map Load
 * dinámico y la cachea el browser). La usamos como preview para single
 * marker; el mapa interactivo recién se monta si el usuario lo pide.
 */
function staticMapUrl(
  lat: number,
  lng: number,
  zoom: number,
  apiKey: string
): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: "640x400",
    scale: "2",
    language: "es",
    region: "AR",
    markers: `color:0xe6007e|${lat},${lng}`,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

/**
 * Wrapper de MapView con dos optimizaciones para bajar el costo de
 * Google Maps (cada Map Load dinámico se factura):
 *
 *  A) Lazy load · nada se carga hasta que el contenedor entra en viewport
 *     (IntersectionObserver). En la ficha el mapa está abajo de todo —
 *     mucha gente no scrollea hasta ahí.
 *  B) Static-then-interactive · para single marker mostramos una imagen
 *     estática (barata + cacheable) y el mapa interactivo recién se monta
 *     si el usuario clickea "Ver mapa interactivo".
 *
 * Para multi-marker (listados) mantenemos el mapa interactivo pero igual
 * lazy (no se monta hasta verse).
 */
export default function MapView(props: MapViewProps) {
  const { singleMarker, center, properties, className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // IntersectionObserver · marca inView cuando el contenedor se acerca.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" } // empieza a preparar un poco antes
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Coords para el preview estático (single marker).
  const singleCoords = (() => {
    if (center) return { lat: center[0], lng: center[1] };
    if (singleMarker && properties && properties.length === 1) {
      return properties[0].location;
    }
    return null;
  })();

  const useStaticPreview = !!singleMarker && !!singleCoords && !!apiKey;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className ?? ""}`}
      style={{ minHeight: 300 }}
    >
      {/* No está en viewport todavía · placeholder liviano (cero requests) */}
      {!inView && (
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <MapPin className="h-6 w-6 text-gray-300" />
        </div>
      )}

      {/* En viewport · single marker → static preview con click-to-interactive */}
      {inView && useStaticPreview && !interactive && (
        <button
          type="button"
          onClick={() => setInteractive(true)}
          className="group relative w-full h-full rounded-lg overflow-hidden block"
          aria-label="Ver mapa interactivo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={staticMapUrl(
              singleCoords!.lat,
              singleCoords!.lng,
              props.zoom ?? 15,
              apiKey!
            )}
            alt="Ubicación en el mapa"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-white/95 text-navy text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
            <MapPin className="h-3.5 w-3.5 text-magenta" />
            Ver mapa interactivo
          </span>
        </button>
      )}

      {/* En viewport · interactivo (multi-marker siempre, single tras click) */}
      {inView && (!useStaticPreview || interactive) && (
        <MapViewInner {...props} />
      )}
    </div>
  );
}
