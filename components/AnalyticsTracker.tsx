"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { installAnalytics, track } from "@/lib/analytics-client";

function getPropertyIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/propiedad\/([^/]+)/);
  return match?.[1];
}

function classifyContactClick(href: string): "wpp" | "phone" | "email" | null {
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(href)) return "wpp";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("mailto:")) return "email";
  return null;
}

/**
 * Tracker global · modo "lite" (reencendido post kill-switch de Neon).
 * Captura sólo lo accionable para el negocio:
 *  - pageview en cada cambio de ruta (+ property_view en /propiedad/[id])
 *  - contact_click cuando alguien clickea un link de wpp / tel / mailto
 *    (escuchamos en document, sin instrumentar cada botón)
 *
 * NO trackeamos scroll_depth ni time_on_page: eran ~60% del volumen de
 * eventos (y del cómputo de Neon) a cambio de poco valor. Si alguna vez se
 * necesitan, se re-agregan acá. El on/off global sigue siendo la env
 * NEXT_PUBLIC_ANALYTICS_ENABLED (ver analytics-client).
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string>("");

  // Install one-time (flush de la cola en pagehide/visibilitychange)
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

    const propertyId = getPropertyIdFromPath(pathname);
    track("pageview", { path: fullPath, property_id: propertyId });
    if (propertyId) {
      track("property_view", { path: fullPath, property_id: propertyId });
    }
  }, [pathname, searchParams]);

  // Click tracking global · captura clicks en links wpp/tel/mailto
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const link = target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (!href) return;
      const channel = classifyContactClick(href);
      if (!channel) return;

      // Inferí property_id si estamos en /propiedad/[id]
      const propId = pathname ? getPropertyIdFromPath(pathname) : undefined;
      track("contact_click", {
        property_id: propId,
        metadata: {
          channel,
          target_text: link.textContent?.trim().slice(0, 60),
          path: lastPath.current,
        },
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  return null;
}
