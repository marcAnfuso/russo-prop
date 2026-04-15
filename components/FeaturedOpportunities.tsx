"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { Property } from "@/data/types";
import OpportunityCard from "./OpportunityCard";

interface FeaturedOpportunitiesProps {
  properties: Property[];
}

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

export default function FeaturedOpportunities({
  properties,
}: FeaturedOpportunitiesProps) {
  if (properties.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-magenta mb-3">
            <Flame className="w-3.5 h-3.5" /> Oportunidades
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">
            Bajas de precio recientes
          </h2>
          <p className="mt-3 text-navy-500 text-base max-w-md mx-auto">
            Propiedades con rebajas que no podés dejar pasar
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {properties.map((property) => (
            <motion.div key={property.id} variants={cardVariants}>
              <OpportunityCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
