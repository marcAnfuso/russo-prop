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
  {
    icon: Building,
    title: "Experiencia",
    description:
      "Mas de 30 anos en el mercado inmobiliario de zona oeste",
  },
  {
    icon: Monitor,
    title: "Tecnologia",
    description:
      "Herramientas digitales de ultima generacion para optimizar tu busqueda",
  },
  {
    icon: Users,
    title: "Equipo Joven",
    description:
      "Capital humano rigurosamente seleccionado por su capacidad e idoneidad",
  },
  {
    icon: ShieldCheck,
    title: "Honestidad",
    description: "Transparencia y confianza en cada operacion",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function WhyRusso() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy uppercase tracking-wide">
            Por que Russo?
          </h2>
        </div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                variants={cardVariants}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-magenta mb-5">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
