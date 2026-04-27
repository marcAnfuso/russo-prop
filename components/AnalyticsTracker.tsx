"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { installAnalytics, track } from "@/lib/analytics-client";

const SCROLL_BUCKETS = [25, 50, 75, 100] as const;

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
 * Tracker global. Captura:
 *  - pageview en cada cambio de ruta (+ property_view en /propiedad/[id])
 *  - scroll_depth (25/50/75/100) por página, una vez cada threshold
 *  - time_on_page al ocultarse la pestaña
 *  - contact_click cuando alguien clickea un link de wpp / tel / mailto
 *    (escuchamos en document, no necesitamos tocar cada componente)
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string>("");
  const scrollHit = useRef<Set<number>>(new Set());
  const enterTime = useRef<number>(Date.now());

  // Install one-time
  useEffect(() => {
    installAnalytics();
  }, []);

  // Page view en cada cambio de ruta + reset de scroll/time
  useEffect(() => {
    if (!pathname) return;
    const fullPath =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (fullPath === lastPath.current) return;

    // Antes de cambiar de página, mandá el time_on_page de la anterior
    if (lastPath.current) {
      const seconds = Math.round((Date.now() - enterTime.current) / 1000);
      if (seconds >= 2) {
        track("time_on_page", {
          path: lastPath.current,
          metadata: { seconds },
        });
      }
    }

    lastPath.current = fullPath;
    scrollHit.current = new Set();
    enterTime.current = Date.now();

    const propertyId = getPropertyIdFromPath(pathname);
    track("pageview", { path: fullPath, property_id: propertyId });
    if (propertyId) {
      track("property_view", { path: fullPath, property_id: propertyId });
    }
  }, [pathname, searchParams]);

  // Scroll depth listener · global, fires al pasar 25/50/75/100
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight;
      if (total <= window.innerHeight) return;
      const pct = (scrolled / total) * 100;
      for (const b of SCROLL_BUCKETS) {
        if (pct >= b && !scrollHit.current.has(b)) {
          scrollHit.current.add(b);
          track("scroll_depth", {
            metadata: { bucket: b, path: lastPath.current },
          });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Time on page al cerrar/ocultar la pestaña
  useEffect(() => {
    const onHide = () => {
      const seconds = Math.round((Date.now() - enterTime.current) / 1000);
      if (seconds >= 2 && lastPath.current) {
        track("time_on_page", {
          path: lastPath.current,
          metadata: { seconds },
        });
      }
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  // Click tracking global · captura de clicks en links wpp/tel/mailto
  // sin tener que instrumentar cada botón del sitio
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
