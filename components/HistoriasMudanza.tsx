"use client";

import { motion } from "framer-motion";
import { MapPin, Quote } from "lucide-react";

interface Historia {
  name: string;
  year: string;
  route: string;
  quote: string;
  summary: string;
}

const historias: Historia[] = [
  {
    name: "Familia Gómez",
    year: "2025",
    route: "Haedo → San Justo",
    quote:
      "Buscábamos casa con patio para los chicos. Franco nos acompañó a ver 8 propiedades en un mes.",
    summary:
      "Vendieron el depto en Haedo, compraron una casa de 4 ambientes. Todo con Russo de punta a punta.",
  },
  {
    name: "Lucas Pérez",
    year: "2024",
    route: "Capital Federal → Ramos Mejía",
    quote:
      "Quería salir de Capital pero sin resignar la movida. Ramos fue el match perfecto.",
    summary:
      "Primera propiedad. Alquilaba hace 8 años. Russo lo guió con tasación, crédito y escritura.",
  },
  {
    name: "Roberto A.",
    year: "2025",
    route: "Morón · Inversor",
    quote:
      "Compré 3 deptos chicos como inversión. Russo administra el alquiler desde entonces.",
    summary:
      "Empezó con uno. Hoy tiene tres. Los alquileres los maneja el equipo sin dolores de cabeza.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function HistoriasMudanza() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Quienes se mudaron con nosotros
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy">
            Historias de mudanza
            <br />
            <span className="italic text-gray-400">reales</span>
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {historias.map((h) => (
            <motion.article
              key={h.name}
              variants={cardVariants}
              className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 p-7 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Decorative quote glyph */}
              <Quote className="h-8 w-8 text-magenta/20 mb-4" />

              {/* Quote */}
              <p className="font-display text-lg font-semibold leading-snug text-navy mb-4">
                {h.quote}
              </p>

              {/* Summary */}
              <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
                {h.summary}
              </p>

              {/* Attribution */}
              <div className="pt-5 border-t border-gray-100">
                <p className="text-sm font-semibold text-navy">{h.name}</p>
                <p className="inline-flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <MapPin className="h-3 w-3 text-magenta" />
                  {h.route} · {h.year}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
