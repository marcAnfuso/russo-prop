import {
  Droplet,
  Flame,
  Sun,
  Wind,
  Wifi,
  Zap,
  Archive,
  ArrowUpDown,
  Waves,
  Car,
  Dumbbell,
  Trees,
  ChefHat,
  Bed,
  Sofa,
  Bath,
  Building2,
  Home,
  DoorOpen,
  Utensils,
  ShieldCheck,
  Flower2,
  Sparkles,
  PhoneCall,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

// Normalize string for matching (lowercase, strip accents, trim)
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Each entry is [needle, icon]. We check if the normalized amenity label
// CONTAINS the needle. Ordered from most specific to most generic so
// earlier entries win.
const iconRules: [string, LucideIcon][] = [
  // water / plumbing
  ["agua corriente", Droplet],
  ["agua caliente", Thermometer],
  ["tanque de agua", Droplet],
  ["desague", Droplet],
  ["cloacal", Droplet],
  // heating / gas
  ["termotanque", Flame],
  ["gas natural", Flame],
  ["gas", Flame],
  ["calefac", Flame],
  // lighting / electricity
  ["luz", Sun],
  ["luminoso", Sun],
  ["electric", Zap],
  // climate
  ["aire acondicionado", Wind],
  ["aire", Wind],
  // connectivity
  ["internet", Wifi],
  ["wifi", Wifi],
  ["telefono", PhoneCall],
  ["cable", Wifi],
  // storage / closets
  ["baulera", Archive],
  ["placard", Archive],
  ["vestidor", Archive],
  // vertical access
  ["ascensor", ArrowUpDown],
  // pool / spa
  ["pileta", Waves],
  ["piscina", Waves],
  ["jacuzzi", Waves],
  // parking
  ["cochera", Car],
  ["garage", Car],
  ["parking", Car],
  ["maniobra", Car],
  // amenities
  ["gimnasio", Dumbbell],
  ["gym", Dumbbell],
  // outdoor
  ["jardin", Trees],
  ["parque", Trees],
  ["patio", Flower2],
  ["terraza", Sun],
  ["balcon", DoorOpen],
  // rooms
  ["cocina", ChefHat],
  ["comedor", Utensils],
  ["living", Sofa],
  ["dormitorio", Bed],
  ["bano", Bath],
  ["toilette", Bath],
  // security
  ["seguridad", ShieldCheck],
  ["alarma", ShieldCheck],
  ["porton", ShieldCheck],
  // building structure
  ["vivienda", Home],
  ["edificio", Building2],
  ["pavimento", Building2],
  ["hall", DoorOpen],
  ["sum", Sparkles],
  ["area comercial", Sparkles],
];

function iconFor(amenity: string): LucideIcon {
  const norm = normalize(amenity);
  for (const [needle, Icon] of iconRules) {
    if (norm.includes(needle)) return Icon;
  }
  return Sparkles;
}

export default function AmenityList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-5">
      {items.map((amenity) => {
        const Icon = iconFor(amenity);
        return (
          <li
            key={amenity}
            className="flex items-center gap-3 text-sm text-navy"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-magenta/10 text-magenta transition-colors group-hover/amenity:bg-magenta/15">
              <Icon className="h-4 w-4" />
            </span>
            <span className="leading-snug font-medium">{amenity}</span>
          </li>
        );
      })}
    </ul>
  );
}
