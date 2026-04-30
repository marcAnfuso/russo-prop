"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, Sparkles, X, LogOut, CheckCircle2, HelpCircle, BarChart3, Bell, ListOrdered, Inbox } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import MediaPicksPanel, { type MediaPick } from "./MediaPicksPanel";
import UsersPanel from "./UsersPanel";
// CRUD manual de emprendimientos · DEPRECATED — la data ahora viene de
// Xintel directo. Lo dejamos importado por las dudas, comentado abajo.
// import DevelopmentsPanel from "./DevelopmentsPanel";
import XintelDevelopmentsPanel from "./XintelDevelopmentsPanel";
import type { Development } from "@/data/types";

interface AdminProperty {
  id: string;
  code: string;
  title: string;
  address: string;
  locality: string;
  operation: "venta" | "alquiler";
  price: number;
  currency: "USD" | "ARS";
  image: string | null;
  type: string;
}

type PickList = "featured" | "new" | "sold";

interface Props {
  properties: AdminProperty[];
  initialFeatured: string[];
  initialNew: string[];
  initialSold: string[];
  initialMedia: MediaPick[];
  initialDevelopments: Development[];
  initialHiddenDevelopments: string[];
  currentUser: {
    id: number;
    username: string;
    displayName: string;
    role: "owner" | "admin";
  };
}

export default function AdminConsole({
  properties,
  initialFeatured,
  initialNew,
  initialSold,
  initialMedia,
  initialDevelopments,
  initialHiddenDevelopments,
  currentUser,
}: Props) {
  const [featured, setFeatured] = useState<Set<string>>(new Set(initialFeatured));
  const [fresh, setFresh] = useState<Set<string>>(new Set(initialNew));
  const [sold, setSold] = useState<Set<string>>(new Set(initialSold));
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState<"" | "venta" | "alquiler">("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (operation && p.operation !== operation) return false;
      if (!q) return true;
      return (
        p.code.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
      );
    });
  }, [properties, query, operation]);

  async function togglePick(propertyId: string, list: PickList) {
    const current =
      list === "featured" ? featured : list === "new" ? fresh : sold;
    const setter =
      list === "featured" ? setFeatured : list === "new" ? setFresh : setSold;
    const has = current.has(propertyId);
    const previous = new Set(current);
    // Optimistic update
    const next = new Set(current);
    if (has) next.delete(propertyId);
    else next.add(propertyId);
    setter(next);
    setBusyId(propertyId);
    try {
      const res = has
        ? await fetch(
            `/api/admin/picks?property_id=${encodeURIComponent(propertyId)}&list=${list}`,
            { method: "DELETE" }
          )
        : await fetch("/api/admin/picks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ property_id: propertyId, list }),
          });
      if (!res.ok) throw new Error("bad response");
      const labels: Record<PickList, string> = {
        featured: "Exclusivas",
        new: "Nuevos ingresos",
        sold: "Vendidas",
      };
      setToast(has ? "Quitado de la lista" : `Agregado a ${labels[list]}`);
      setTimeout(() => setToast(null), 2000);
    } catch {
      // Revert
      setter(previous);
      setToast("Error guardando el cambio. Probá de nuevo.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const propertyById = useMemo(
    () => new Map(properties.map((p) => [p.id, p])),
    [properties]
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-magenta font-semibold">
              Panel interno
            </p>
            <h1 className="font-display text-2xl font-semibold">
              Hola, {currentUser.displayName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <Inbox className="h-3.5 w-3.5" />
              Leads
            </Link>
            <Link
              href="/admin/alerts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              Alertas
            </Link>
            <Link
              href="/admin/priorities"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              Prioridades
            </Link>
            <Link
              href="/admin/ayuda"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Guía
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Current picks */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PickPanel
            title="Exclusivas"
            subtitle="Marcá varias — el sitio las va rotando de a 4 por día."
            icon={<Star className="h-4 w-4" />}
            ids={Array.from(featured)}
            propertyById={propertyById}
            onRemove={(id) => togglePick(id, "featured")}
          />
          <PickPanel
            title="Nuevos ingresos"
            subtitle="Se muestran como 'nuevos' durante 30 días, después expiran solas."
            icon={<Sparkles className="h-4 w-4" />}
            ids={Array.from(fresh)}
            propertyById={propertyById}
            onRemove={(id) => togglePick(id, "new")}
          />
          <PickPanel
            title="Vendidas"
            subtitle='Muestran el badge "Vendimos" en vez de "Reservado".'
            icon={<CheckCircle2 className="h-4 w-4" />}
            ids={Array.from(sold)}
            propertyById={propertyById}
            onRemove={(id) => togglePick(id, "sold")}
          />
        </div>

        {/* Emprendimientos · viven en Xintel; el equipo elige cuáles
            mostrar/ocultar en el sitio público desde acá */}
        <XintelDevelopmentsPanel
          initial={initialDevelopments}
          initialHiddenIds={initialHiddenDevelopments}
        />

        {/* CRUD manual de emprendimientos · DEPRECATED. Lo dejamos
            comentado por si en el futuro queremos volver a manejarlos
            desde acá (Russo no carga emprendimientos manuales por ahora,
            todo lo cargan en Xintel). El panel + API + tabla developments
            siguen existiendo en el código. */}
        {/* <DevelopmentsPanel initial={initialDevelopments} /> */}

        {/* Videos de Instagram / TikTok */}
        <MediaPicksPanel initial={initialMedia} />

        {/* Usuarios del panel (visible a todos; owner puede crear/borrar) */}
        <UsersPanel
          currentUser={{
            id: currentUser.id,
            username: currentUser.username,
            role: currentUser.role,
          }}
        />

        {/* Search */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px] flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 focus-within:border-magenta focus-within:ring-2 focus-within:ring-magenta/30">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código, dirección, barrio…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 text-sm">
              {([
                { v: "", l: "Todas" },
                { v: "venta", l: "Ventas" },
                { v: "alquiler", l: "Alquileres" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setOperation(o.v)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    operation === o.v
                      ? "bg-magenta text-white"
                      : "text-navy hover:text-magenta"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 ml-auto">
              {filtered.length} de {properties.length} propiedades
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, 60).map((p) => {
              const isFeatured = featured.has(p.id);
              const isNew = fresh.has(p.id);
              const isSold = sold.has(p.id);
              return (
                <li
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">
                        {p.code} · {p.operation === "venta" ? "Venta" : "Alquiler"}
                      </p>
                      <p className="text-sm font-semibold text-navy truncate">
                        {p.address}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.locality}
                      </p>
                      <p className="font-mono-price text-sm text-navy mt-0.5">
                        {p.currency === "ARS" ? "$" : "USD"} {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 p-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePick(p.id, "featured")}
                      disabled={busyId === p.id}
                      className={`flex-1 inline-flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                        isFeatured
                          ? "bg-magenta text-white"
                          : "bg-magenta-50 text-magenta hover:bg-magenta-100"
                      }`}
                    >
                      <Star className={`h-3 w-3 ${isFeatured ? "fill-white" : ""}`} />
                      {isFeatured ? "Exclusiva" : "Marcar exclusiva"}
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePick(p.id, "new")}
                      disabled={busyId === p.id}
                      className={`flex-1 inline-flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                        isNew
                          ? "bg-navy text-white"
                          : "bg-navy-50 text-navy hover:bg-navy-100"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {isNew ? "Nueva" : "Nueva"}
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePick(p.id, "sold")}
                      disabled={busyId === p.id}
                      className={`flex-1 inline-flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                        isSold
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {isSold ? "Vendida" : "Vender"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {filtered.length > 60 && (
            <p className="text-xs text-gray-400 text-center">
              Mostrando las primeras 60 — refiná con el buscador para ver el resto.
            </p>
          )}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-navy text-white px-5 py-2.5 text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

function PickPanel({
  title,
  subtitle,
  icon,
  ids,
  propertyById,
  onRemove,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  ids: string[];
  propertyById: Map<string, AdminProperty>;
  onRemove: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 3;
  const hasMore = ids.length > PREVIEW_COUNT;
  const visibleIds = showAll ? ids : ids.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1 text-navy">
          <span className="text-magenta">{icon}</span>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <span className="ml-auto text-xs font-mono-price tabular-nums text-gray-400">
            {ids.length}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
        {ids.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4">
            Sin propiedades seleccionadas todavía.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {visibleIds.map((id) => (
                <PickRow
                  key={id}
                  id={id}
                  property={propertyById.get(id)}
                  onRemove={onRemove}
                />
              ))}
            </ul>
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-3 w-full text-xs font-semibold text-magenta hover:bg-magenta-50 rounded-md py-2 transition-colors"
              >
                Ver las {ids.length} →
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal con todas (al hacer click en "Ver las N") */}
      {showAll && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 text-navy">
                <span className="text-magenta">{icon}</span>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <span className="text-xs font-mono-price tabular-nums text-gray-400">
                  {ids.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-5 space-y-2">
              {ids.map((id) => (
                <PickRow
                  key={id}
                  id={id}
                  property={propertyById.get(id)}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function PickRow({
  id,
  property: p,
  onRemove,
}: {
  id: string;
  property: AdminProperty | undefined;
  onRemove: (id: string) => void;
}) {
  if (!p) {
    return (
      <li className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
        <p className="flex-1 text-xs text-gray-400">
          Propiedad {id} · ya no está en el inventario
        </p>
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-magenta"
          aria-label="Quitar"
        >
          <X className="h-4 w-4" />
        </button>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">
          {p.code} · {p.operation === "venta" ? "Venta" : "Alquiler"}
        </p>
        <p className="text-sm font-medium text-navy truncate">{p.address}</p>
        <p className="text-xs text-gray-500">{p.locality}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-gray-400 hover:text-magenta"
        aria-label="Quitar"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}
