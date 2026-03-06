export type OperationType = "venta" | "alquiler";
export type PropertyType = "casa" | "departamento" | "ph" | "terreno" | "cochera" | "local" | "oficina" | "edificio";
export type DevelopmentStatus = "pre-venta" | "pozo" | "en-construccion" | "terminado";

export interface Property {
  id: string;
  code: string;
  title: string;
  operation: OperationType;
  type: PropertyType;
  price: number;
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
  images: string[];
  videoUrl?: string;
  location: { lat: number; lng: number };
  featured: boolean;
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
