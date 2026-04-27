"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { Building2, Plus, Trash2, Pencil, Star } from "lucide-react";
import type { Development, DevelopmentStatus } from "@/data/types";

const STATUS_OPTIONS: { value: DevelopmentStatus; label: string }[] = [
  { value: "pre-venta", label: "Pre-venta" },
  { value: "pozo", label: "Pozo" },
  { value: "en-construccion", label: "En construcción" },
  { value: "terminado", label: "Terminado" },
];

const STATUS_LABEL: Record<DevelopmentStatus, string> = {
  "pre-venta": "Pre-venta",
  pozo: "Pozo",
  "en-construccion": "En construcción",
  terminado: "Terminado",
};

interface Props {
  initial: Development[];
}

const EMPTY: Development = {
  id: "",
  code: "",
  name: "",
  address: "",
  locality: "",
  district: "",
  description: "",
  status: "en-construccion",
  deliveryDate: "",
  category: "Residencial",
  priceFrom: 0,
  priceTo: 0,
  totalUnits: 0,
  availableUnits: 0,
  roomsRange: "",
  areaRange: "",
  coveredAreaRange: "",
  bathrooms: 0,
  amenities: [],
  images: [],
  videoUrl: undefined,
  location: { lat: -34.674, lng: -58.561 }, // San Justo aprox
  elevators: undefined,
  featured: false,
};

export default function DevelopmentsPanel({ initial }: Props) {
  const [items, setItems] = useState<Development[]>(initial);
  const [editing, setEditing] = useState<Development | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/developments");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.developments ?? []);
    } catch {
      setError("No se pudo refrescar la lista");
    }
  }, []);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Borrar el emprendimiento "${name}"? No se puede deshacer.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/developments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await refresh();
    } catch {
      setError("Error al borrar");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-magenta/10 text-magenta">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy">Emprendimientos</h2>
            <p className="text-xs text-gray-500">
              {items.length} cargados · creá, editá o borrá los que se muestran en /emprendimientos.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(EMPTY)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-magenta px-3 py-2 text-sm font-semibold text-white hover:bg-magenta-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo emprendimiento
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <div
            key={d.id}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-gray-100 relative">
              {d.images[0] ? (
                <img
                  src={d.images[0]}
                  alt={d.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                  Sin imagen
                </div>
              )}
              <span className="absolute top-2 left-2 inline-block rounded-full bg-navy/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {STATUS_LABEL[d.status]}
              </span>
              {d.featured && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-magenta px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Star className="h-2.5 w-2.5 fill-white" /> Destacado
                </span>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <p className="text-[10px] font-mono text-gray-400">{d.code}</p>
              <p className="font-semibold text-navy text-sm leading-tight">{d.name}</p>
              <p className="text-xs text-gray-500">
                {d.locality}
                {d.district && d.district !== d.locality ? `, ${d.district}` : ""}
              </p>
              <p className="text-xs text-gray-600 mt-auto">
                USD {d.priceFrom.toLocaleString()} – {d.priceTo.toLocaleString()} ·{" "}
                {d.totalUnits} u. ({d.availableUnits} disp.)
              </p>
              <div className="flex gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(d)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-gray-100 hover:bg-gray-200 text-navy text-xs font-semibold py-1.5 transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </button>
                <button
                  type="button"
                  disabled={busyId === d.id}
                  onClick={() => handleDelete(d.id, d.name)}
                  className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 transition-colors disabled:opacity-50"
                  title="Borrar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <DevelopmentFormModal
          initial={editing}
          isNew={!editing.id}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </section>
  );
}

function DevelopmentFormModal({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: Development;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState<Development>(initial);
  const [amenitiesText, setAmenitiesText] = useState(initial.amenities.join(", "));
  const [imagesText, setImagesText] = useState(initial.images.join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Development>(key: K, value: Development[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: Development = {
        ...data,
        amenities: amenitiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: imagesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin/developments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? "Error al guardar");
        return;
      }
      onSaved();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy">
            {isNew ? "Nuevo emprendimiento" : `Editar · ${data.name}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="ID (slug único)"
              value={data.id}
              onChange={(v) => update("id", v)}
              placeholder="rus19"
              hint="3-32 chars · sin espacios. No se puede cambiar después."
              required
              disabled={!isNew}
            />
            <Field
              label="Código RUS"
              value={data.code}
              onChange={(v) => update("code", v)}
              placeholder="RUS19"
              required
            />
          </div>
          <Field
            label="Nombre"
            value={data.name}
            onChange={(v) => update("name", v)}
            placeholder="Av. Santamaria 3257"
            required
          />
          <Field
            label="Dirección"
            value={data.address}
            onChange={(v) => update("address", v)}
            placeholder="Av. Santamaria 3257"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Localidad" value={data.locality} onChange={(v) => update("locality", v)} placeholder="San Justo" />
            <Field label="Partido" value={data.district} onChange={(v) => update("district", v)} placeholder="La Matanza" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Descripción
            </label>
            <textarea
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Estado
              </label>
              <select
                value={data.status}
                onChange={(e) => update("status", e.target.value as DevelopmentStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Field
              label="Fecha entrega"
              value={data.deliveryDate}
              onChange={(v) => update("deliveryDate", v)}
              placeholder="2027-06"
              hint="Formato AAAA-MM"
            />
          </div>

          <Field label="Categoría" value={data.category} onChange={(v) => update("category", v)} placeholder="Residencial" />

          <div className="grid grid-cols-2 gap-3">
            <NumField label="Precio desde (USD)" value={data.priceFrom} onChange={(v) => update("priceFrom", v)} />
            <NumField label="Precio hasta (USD)" value={data.priceTo} onChange={(v) => update("priceTo", v)} />
            <NumField label="Total unidades" value={data.totalUnits} onChange={(v) => update("totalUnits", v)} />
            <NumField label="Disponibles" value={data.availableUnits} onChange={(v) => update("availableUnits", v)} />
            <Field label="Rango ambientes" value={data.roomsRange} onChange={(v) => update("roomsRange", v)} placeholder="1-3" />
            <Field label="Rango superficie total" value={data.areaRange} onChange={(v) => update("areaRange", v)} placeholder="35-65 m²" />
            <Field label="Rango cubierta" value={data.coveredAreaRange} onChange={(v) => update("coveredAreaRange", v)} placeholder="32-58 m²" />
            <NumField label="Baños (típico)" value={data.bathrooms} onChange={(v) => update("bathrooms", v)} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Amenities (separados por coma)
            </label>
            <input
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="Ascensor, Terraza común, Laundry, Bicicletero"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Imágenes (URLs · una por línea)
            </label>
            <textarea
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              rows={3}
              placeholder="https://…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumField
              label="Latitud"
              value={data.location.lat}
              onChange={(v) => update("location", { ...data.location, lat: v })}
              decimal
            />
            <NumField
              label="Longitud"
              value={data.location.lng}
              onChange={(v) => update("location", { ...data.location, lng: v })}
              decimal
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="rounded text-magenta focus:ring-magenta"
            />
            <span>Destacado (aparece primero en /emprendimientos)</span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-magenta text-white text-sm font-semibold hover:bg-magenta-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 disabled:bg-gray-50 disabled:text-gray-400"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  decimal,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  decimal?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        step={decimal ? "any" : "1"}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
      />
    </div>
  );
}
