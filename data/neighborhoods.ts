export interface NeighborhoodImageCredit {
  author: string;
  license: string;
  sourceUrl: string;
}

export interface Neighborhood {
  name: string;
  slug: string;
  description: string;
  image: string;
  credit: NeighborhoodImageCredit;
}

export const neighborhoods: Neighborhood[] = [
  {
    name: "San Justo",
    slug: "San Justo",
    description: "Centro comercial y residencial de La Matanza",
    image: "/images/neighborhoods/san-justo.jpg",
    credit: {
      author: "Mithell5.0",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Plaza_de_San_Justo%2C_en_la_ciudad_de_San_Justo%2C_es_el_centro_de_la_localidad_de_la_Matanza.jpg",
    },
  },
  {
    name: "Villa Luzuriaga",
    slug: "Villa Luzuriaga",
    description: "Barrio tranquilo con excelente conectividad",
    image: "/images/neighborhoods/villa-luzuriaga.jpg",
    credit: {
      author: "Mithell5.0",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Una_calle_de_Villa_Luzuriaga.jpg",
    },
  },
  {
    name: "Ramos Mejía",
    slug: "Ramos Mejía",
    description: "Zona premium con amplia oferta gastronómica",
    image: "/images/neighborhoods/ramos-mejia.jpg",
    credit: {
      author: "Roberto Fiadone",
      license: "CC BY 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Parroquia_Nuestra_Se%C3%B1ora_del_Carmen%2C_Ramos_Mej%C3%ADa_-_2024.jpg",
    },
  },
  {
    name: "Ciudadela",
    slug: "Ciudadela",
    description: "Acceso directo a Capital Federal",
    image: "/images/neighborhoods/ciudadela.jpg",
    credit: {
      author: "Fernando Martello",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Calle_donofrio_en_ciudadela.jpg",
    },
  },
  {
    name: "Haedo",
    slug: "Haedo",
    description: "Calles arboladas y ambiente residencial",
    image: "/images/neighborhoods/haedo.jpg",
    credit: {
      author: "Wilmer Osario",
      license: "CC0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Estaci%C3%B3n_Haedo_2022_(1).jpg",
    },
  },
  {
    name: "Morón",
    slug: "Morón",
    description: "Centro urbano con todos los servicios",
    image: "/images/neighborhoods/moron.jpg",
    credit: {
      author: "Roberto Jorge Gómez",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Centro_c%C3%ADvico_de_Mor%C3%B3n.JPG",
    },
  },
  {
    name: "Isidro Casanova",
    slug: "Isidro Casanova",
    description: "Barrio en crecimiento con oportunidades",
    image: "/images/neighborhoods/isidro-casanova.jpg",
    credit: {
      author: "Leonardo Meza (Chryslerark)",
      license: "CC BY-SA 3.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Estacion_Isidro_Casanova_Andenes.jpg",
    },
  },
  {
    name: "González Catán",
    slug: "González Catán",
    description: "Amplios terrenos y casas con jardín",
    image: "/images/neighborhoods/gonzalez-catan.jpg",
    credit: {
      author: "Frodar",
      license: "CC BY-SA 4.0",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Ruta_3_-_Gonz%C3%A1lez_Cat%C3%A1n_-_Vista_hacia_el_este.jpg",
    },
  },
];
