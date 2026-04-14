"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { neighborhoods } from "@/data/neighborhoods";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function NeighborhoodGrid() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-magenta mb-3">
            Explorá la zona
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif">Barrios</h2>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {neighborhoods.map((neighborhood) => (
            <motion.div key={neighborhood.slug} variants={cardVariants}>
              <Link
                href={`/ventas?zona=${neighborhood.slug}`}
                className="group relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden block"
              >
                <Image
                  src={neighborhood.image}
                  alt={neighborhood.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-navy/0 group-hover:from-navy group-hover:via-navy/50 transition-colors duration-300" />
                <div className="relative z-10 flex flex-col justify-end h-full p-5">
                  <h3 className="text-lg font-bold text-white drop-shadow-md">{neighborhood.name}</h3>
                  <p className="text-sm text-white/90 mt-1 drop-shadow-md">{neighborhood.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
