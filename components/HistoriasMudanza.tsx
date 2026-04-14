"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface Historia {
  initials: string;
  name: string;
  year: string;
  route: string;
  quote: string;
  summary: string;
  gradient: string;
}

const historias: Historia[] = [
  {
    initials: "GM",
    name: "Familia Gómez",
    year: "2025",
    route: "Haedo → San Justo",
    quote:
      "Buscábamos casa con patio para los chicos. Franco nos acompañó a ver 8 propiedades en un mes.",
    summary:
      "Vendieron el depto en Haedo, compraron una casa de 4 ambientes en San Justo. Todo con Russo de punta a punta.",
    gradient: "from-emerald-300 via-teal-400 to-cyan-500",
  },
  {
    initials: "LP",
    name: "Lucas Pérez",
    year: "2024",
    route: "Capital Federal → Ramos Mejía",
    quote:
      "Quería salir de Capital pero sin resignar la movida. Ramos fue el match perfecto.",
    summary:
      "Primera propiedad. Alquilaba hace 8 años y por fin se decidió. Russo lo guió con tasación, crédito y escritura.",
    gradient: "from-purple-400 via-fuchsia-400 to-pink-500",
  },
  {
    initials: "RA",
    name: "Roberto A.",
    year: "2025",
    route: "Morón · Inversor",
    quote:
      "Compré 3 deptos chicos como inversión. Russo administra el alquiler desde entonces.",
    summary:
      "Empezó con uno. Hoy tiene 3. Los alquileres los maneja el equipo y cobra todos los meses sin dolores de cabeza.",
    gradient: "from-amber-300 via-orange-400 to-rose-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HistoriasMudanza() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Lo que dicen quienes se mudaron con nosotros
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
              key={h.initials}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`relative aspect-[4/5] bg-gradient-to-br ${h.gradient}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[9rem] font-bold text-white/20 leading-none select-none">
                    {h.initials}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[11px] font-semibold text-navy shadow-sm">
                    <MapPin className="h-3 w-3 text-magenta" />
                    {h.route}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-3">
                  {h.name} · {h.year}
                </p>
                <p className="font-display text-lg font-semibold leading-snug mb-3 text-navy">
                  &ldquo;{h.quote}&rdquo;
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {h.summary}
                </p>
                <button className="mt-4 inline-flex items-center gap-1 text-magenta text-sm font-semibold hover:gap-2 transition-all duration-200">
                  Leer historia →
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
