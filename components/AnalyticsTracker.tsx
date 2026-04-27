"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { installAnalytics, track } from "@/lib/analytics-client";

/**
 * Tracker global. Se monta UNA VEZ en el root layout. Su único rol acá
 * en Fase 1 es:
 *  - Instalar listeners de pagehide/visibilitychange (flush automático)
 *  - Disparar `pageview` en cada cambio de ruta (incluyendo el primero)
 * En fases siguientes se va a sumar scroll/time/clicks dentro del mismo
 * componente o módulos auxiliares.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string>("");

  // Install one-time
  useEffect(() => {
    installAnalytics();
  }, []);

  // Page view en cada cambio de ruta
  useEffect(() => {
    if (!pathname) return;
    const fullPath =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (fullPath === lastPath.current) return;
    lastPath.current = fullPath;

    // Detect property_id si la ruta es /propiedad/[id]
    const match = pathname.match(/^\/propiedad\/([^/]+)/);
    const propertyId = match?.[1];

    track("pageview", {
      path: fullPath,
      property_id: propertyId,
    });

    // Si es una propiedad, dispará también el "property_view" para
    // separar pageviews de visualizaciones reales de fichas.
    if (propertyId) {
      track("property_view", {
        path: fullPath,
        property_id: propertyId,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
