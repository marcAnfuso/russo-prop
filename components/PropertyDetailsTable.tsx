import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";
import {
  MapPin,
  Building2,
  DoorOpen,
  Home,
  Bed,
  Bath,
  Car,
  ArrowUpDown,
  Droplet,
  Sparkles,
  CalendarClock,
  Tag,
  Receipt,
  Banknote,
  Briefcase,
  Compass,
  type LucideIcon,
} from "lucide-react";

interface DetailRow {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}

interface Group {
  title: string;
  rows: DetailRow[];
}

function operationLabel(op: string): string {
  return op === "alquiler" ? "Alquiler" : "Venta";
}

function typeLabel(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function yesNo(v?: boolean): string | null {
  if (v === true) return "Sí";
  if (v === false) return "No";
  return null;
}

function Row({ row }: { row: DetailRow }) {
  const Icon = row.icon;
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-navy-400 flex-shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 flex-shrink-0 w-28">
        {row.label}
      </span>
      <span
        className={`font-semibold text-sm flex-1 min-w-0 truncate ${
          row.accent ? "text-magenta" : "text-navy"
        }`}
        title={row.value}
      >
        {row.value}
      </span>
    </div>
  );
}

export default function PropertyDetailsTable({ property }: { property: Property }) {
  const d = property.details ?? {};
  const f = property.features ?? {};

  const ubicacion: DetailRow[] = [
    { icon: Home, label: "Tipo", value: typeLabel(property.type) },
    { icon: Tag, label: "Operación", value: operationLabel(property.operation), accent: true },
  ];
  if (property.locality) ubicacion.push({ icon: MapPin, label: "Barrio", value: property.locality });
  if (property.district && property.district !== property.locality)
    ubicacion.push({ icon: MapPin, label: "Localidad", value: property.district });
  if (d.floor) ubicacion.push({ icon: Building2, label: "Piso", value: `${d.floor}°` });
  if (d.aptNumber) ubicacion.push({ icon: DoorOpen, label: "Departamento", value: d.aptNumber });
  if (d.orientation) ubicacion.push({ icon: Compass, label: "Ubicación", value: d.orientation });

  const especificaciones: DetailRow[] = [];
  if (f.rooms) especificaciones.push({ icon: Home, label: "Ambientes", value: String(f.rooms) });
  if (f.bedrooms) especificaciones.push({ icon: Bed, label: "Dormitorios", value: String(f.bedrooms) });
  if (f.bathrooms) especificaciones.push({ icon: Bath, label: "Baños", value: String(f.bathrooms) });
  if (f.garage) especificaciones.push({ icon: Car, label: "Cocheras", value: String(f.garage) });
  if (d.elevators) especificaciones.push({ icon: ArrowUpDown, label: "Ascensores", value: String(d.elevators) });
  const hw = yesNo(d.hasHotWater);
  if (hw) especificaciones.push({ icon: Droplet, label: "Agua caliente", value: hw });
  if (d.condition) especificaciones.push({ icon: Sparkles, label: "Estado", value: d.condition });
  if (d.category) especificaciones.push({ icon: Briefcase, label: "Categoría", value: d.category });
  if (f.age != null && f.age > 0) especificaciones.push({ icon: CalendarClock, label: "Antigüedad", value: `${f.age} años` });

  const costos: DetailRow[] = [];
  if (d.expenses) costos.push({ icon: Receipt, label: "Expensas", value: `$ ${formatPrice(d.expenses)} /mes`, accent: true });
  if (d.tax) costos.push({ icon: Banknote, label: "ABL / Imp.", value: `$ ${formatPrice(d.tax)} /mes`, accent: true });

  const groups: Group[] = [];
  if (ubicacion.length) groups.push({ title: "Ubicación", rows: ubicacion });
  if (especificaciones.length) groups.push({ title: "Especificaciones", rows: especificaciones });
  if (costos.length) groups.push({ title: "Costos mensuales", rows: costos });

  if (groups.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className="h-6 w-1 rounded-full bg-magenta" />
        <h2 className="font-display text-2xl font-semibold text-navy">
          Detalles de la propiedad
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white divide-y divide-gray-100">
        {groups.map((group) => (
          <div key={group.title} className="px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-magenta mb-2">
              {group.title}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
              {group.rows.map((row) => (
                <Row key={row.label} row={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
