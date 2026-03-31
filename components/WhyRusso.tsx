"use client";

import { Building, Monitor, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

const reasons: Reason[] = [
  { icon: Building,    title: "Experiencia",   description: "Mas de 30 anos en el mercado inmobiliario de zona oeste" },
  { icon: Monitor,     title: "Tecnologia",    description: "Herramientas digitales de ultima generacion para optimizar tu busqueda" },
  { icon: Users,       title: "Equipo joven",  description: "Capital humano rigurosamente seleccionado por su capacidad e idoneidad" },
  { icon: ShieldCheck, title: "Honestidad",    description: "Transparencia y confianza en cada operacion" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function WhyRusso() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/80">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-3">Nuestros valores</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">¿Por qué elegirnos?</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                variants={cardVariants}
                className="group card card-hover flex flex-col items-center text-center p-8 gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-magenta/8 border border-magenta/12 transition-all duration-300 group-hover:bg-magenta/15 group-hover:border-magenta/25 group-hover:scale-110">
                  <Icon className="h-7 w-7 text-magenta" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-navy">{reason.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{reason.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
