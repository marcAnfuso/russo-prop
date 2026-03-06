import { Review } from "./types";

export const reviews: Review[] = [
  {
    id: "review-1",
    name: "María García",
    rating: 5,
    text: "Excelente atención de principio a fin. Nos ayudaron a encontrar nuestra casa ideal en San Justo. El equipo de Russo fue muy profesional y nos acompañó en todo el proceso de compra. Totalmente recomendable.",
    date: "2025-11-15",
  },
  {
    id: "review-2",
    name: "Carlos Rodríguez",
    rating: 5,
    text: "Vendimos nuestro departamento en tiempo récord gracias a Russo Propiedades. La tasación fue justa y el proceso muy transparente. Destaco la comunicación constante y el compromiso del equipo.",
    date: "2025-10-22",
  },
  {
    id: "review-3",
    name: "Laura Fernández",
    rating: 4,
    text: "Muy buena experiencia alquilando a través de Russo. El equipo fue atento y resolvió todas nuestras dudas rápidamente. La gestión fue ágil y sin complicaciones. Los recomiendo.",
    date: "2025-09-08",
  },
];

export const averageRating = 4.8;
export const totalReviews = 127;
