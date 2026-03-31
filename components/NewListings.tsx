"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/data/types";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function NewListings({ properties }: { properties: Property[] }) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-3">Recién llegados</p>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy">
            Nuevos <span className="text-magenta">ingresos</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {properties.map((property) => (
            <motion.div key={property.id} variants={itemVariants}>
              <div className="relative">
                <span className="absolute -top-2 -right-2 z-30 rounded-full bg-magenta px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Nuevo
                </span>
                <PropertyCard property={property} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/ventas"
            className="rounded-full border-2 border-magenta px-6 py-2.5 text-sm font-semibold text-magenta transition-colors hover:bg-magenta hover:text-white"
          >
            Ver todas las propiedades
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
