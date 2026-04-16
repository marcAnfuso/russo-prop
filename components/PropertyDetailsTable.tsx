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

interface DetailTile {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean; // highlight in magenta
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

interface Group {
  title: string;
  tiles: DetailTile[];
}

function Tile({ tile }: { tile: DetailTile }) {
  const Icon = tile.icon;
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-magenta/30 hover:shadow-[0_12px_28px_-12px_rgba(230,0,126,0.18)] hover:-translate-y-0.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-magenta/10 text-magenta transition-colors group-hover:bg-magenta/15">
        <Icon className="h-4 w-4" />
      </span>
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {tile.label}
        </p>
        <p
          className={`font-display text-2xl font-semibold leading-tight tracking-tight ${
            tile.accent ? "text-magenta" : "text-navy"
          }`}
        >
          {tile.value}
        </p>
      </div>
    </div>
  );
}

export default function PropertyDetailsTable({ property }: { property: Property }) {
  const d = property.details ?? {};
  const f = property.features ?? {};

  // Group 1: Ubicación
  const ubicacion: DetailTile[] = [
    { icon: Home, label: "Tipo", value: typeLabel(property.type) },
    { icon: Tag, label: "Operación", value: operationLabel(property.operation), accent: true },
  ];
  if (property.locality) ubicacion.push({ icon: MapPin, label: "Barrio", value: property.locality });
  if (property.district && property.district !== property.locality)
    ubicacion.push({ icon: MapPin, label: "Localidad", value: property.district });
  if (d.floor) ubicacion.push({ icon: Building2, label: "Piso", value: `${d.floor}°` });
  if (d.aptNumber) ubicacion.push({ icon: DoorOpen, label: "Departamento", value: d.aptNumber });
  if (d.orientation) ubicacion.push({ icon: Compass, label: "Ubicación", value: d.orientation });

  // Group 2: Especificaciones
  const especificaciones: DetailTile[] = [];
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

  // Group 3: Costos
  const costos: DetailTile[] = [];
  if (d.expenses) costos.push({ icon: Receipt, label: "Expensas", value: `$ ${formatPrice(d.expenses)}`, accent: true });
  if (d.tax) costos.push({ icon: Banknote, label: "Impuesto", value: `$ ${formatPrice(d.tax)}`, accent: true });

  const groups: Group[] = [];
  if (ubicacion.length) groups.push({ title: "Ubicación", tiles: ubicacion });
  if (especificaciones.length) groups.push({ title: "Especificaciones", tiles: especificaciones });
  if (costos.length) groups.push({ title: "Costos mensuales", tiles: costos });

  if (groups.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-6 w-1 rounded-full bg-magenta" />
        <h2 className="font-display text-2xl font-semibold text-navy">
          Detalles de la propiedad
        </h2>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-magenta mb-3">
              {group.title}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.tiles.map((tile) => (
                <Tile key={tile.label} tile={tile} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
