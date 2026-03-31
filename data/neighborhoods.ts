export interface Neighborhood {
  name: string;
  slug: string;
  description: string;
}

export const neighborhoods: Neighborhood[] = [
  { name: "San Justo", slug: "San Justo", description: "Centro comercial y residencial de La Matanza" },
  { name: "Villa Luzuriaga", slug: "Villa Luzuriaga", description: "Barrio tranquilo con excelente conectividad" },
  { name: "Ramos Mejía", slug: "Ramos Mejía", description: "Zona premium con amplia oferta gastronómica" },
  { name: "Ciudadela", slug: "Ciudadela", description: "Acceso directo a Capital Federal" },
  { name: "Haedo", slug: "Haedo", description: "Calles arboladas y ambiente residencial" },
  { name: "Morón", slug: "Morón", description: "Centro urbano con todos los servicios" },
  { name: "Isidro Casanova", slug: "Isidro Casanova", description: "Barrio en crecimiento con oportunidades" },
  { name: "González Catán", slug: "González Catán", description: "Amplios terrenos y casas con jardín" },
];
