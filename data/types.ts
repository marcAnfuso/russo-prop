export type OperationType = "venta" | "alquiler";
export type PropertyType =
  | "casa"
  | "departamento"
  | "ph"
  | "terreno"
  | "cochera"
  | "local"
  | "oficina"
  | "edificio"
  | "galpon"
  | "negocio"
  | "quinta"
  | "campo";
export type DevelopmentStatus = "pre-venta" | "pozo" | "en-construccion" | "terminado";

export interface PriceHistoryEntry {
  price: number;
  currency: "USD" | "ARS";
  date: string; // ISO 8601
}

/** A row from Xintel's `superficie` table: label + value (e.g. "Cubierta" / "62.00m2"). */
export interface AreaMeasurement {
  label: string;
  value: string;
}

/**
 * Extra ficha details only populated by fetchProperty() (detail endpoint).
 * Everything optional — Xintel fields are inconsistent across listings.
 */
export interface PropertyDetails {
  floor?: string;            // in_pis — piso
  aptNumber?: string;        // in_dto — departamento letra/número
  condition?: string;        // in_esa — estado (Muy Bueno, A estrenar, …)
  category?: string;         // in_eco — categoría
  orientation?: string;      // ubicacion — frente/contrafrente/…
  elevators?: number;        // in_asc
  expenses?: number;         // in_exp — expensas (ARS)
  tax?: number;              // in_imp — impuesto (ARS)
  apartmentType?: string;    // in_tip + tipo
  hasBaulera?: boolean;      // derived
  hasHotWater?: boolean;     // in_agu / in_ale derived
  hasAC?: boolean;           // in_aire / derived
}

export interface Property {
  id: string;
  code: string;
  title: string;
  operation: OperationType;
  type: PropertyType;
  /** Xintel's `in_tpr` — a finer-grained category ("Dúplex", "Semipiso", "Monoambiente") when present. Title-cased. */
  subtype?: string;
  price: number;
  currency: "USD" | "ARS";
  address: string;
  locality: string;
  district: string;
  description: string;
  features: {
    totalArea?: number;
    coveredArea?: number;
    landArea?: number;
    rooms?: number;
    bathrooms?: number;
    bedrooms?: number;
    garage?: number;
    age?: number;
  };
  amenities: string[];
  areas?: AreaMeasurement[];  // full `superficie` table
  plans?: string[];           // blueprints / floor plans from `lista_planos` (detail only)
  details?: PropertyDetails;  // extra ficha details (detail page only)
  images: string[];
  videoUrl?: string;
  /** URL externa de recorrido virtual 360° (Xintel: tour360). */
  tour360Url?: string;
  location: { lat: number; lng: number };
  featured: boolean;
  priceHistory?: PriceHistoryEntry[];
  /** Override manual del equipo desde el admin — marca la propiedad
   * como vendida, independientemente del precio 9999999 que usa Xintel
   * ambiguamente para reservadas/vendidas/consultar. */
  sold?: boolean;
  /** Prioridad de visibilidad — número mayor sale primero en listings.
   * Override del equipo (admin /priorities). Si no hay override, usamos
   * el `in_ord2` que carga Russo en Xintel. */
  priority?: number;
}

export interface Development {
  id: string;
  code: string;
  name: string;
  address: string;
  locality: string;
  district: string;
  description: string;
  status: DevelopmentStatus;
  deliveryDate: string;
  category: string;
  priceFrom: number;
  priceTo: number;
  totalUnits: number;
  availableUnits: number;
  roomsRange: string;
  areaRange: string;
  coveredAreaRange: string;
  bathrooms: number;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  location: { lat: number; lng: number };
  elevators?: number;
  featured: boolean;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}
