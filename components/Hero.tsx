"use client";

import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";

export default function Hero() {
  return (
    <section className="relative -mt-[72px] min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay — darker on the left where the copy sits so the
          subtitle is legible over the busy background video, softer on the
          right so the video still reads as a scene. */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:items-start md:text-left items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-magenta mb-4"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
          Zona oeste · desde 1994
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white leading-[1.05] tracking-tight mb-5 max-w-3xl"
        >
          Tu próximo hogar <span className="italic text-magenta">empieza acá</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-base sm:text-lg text-white/85 mb-8 max-w-xl leading-relaxed"
        >
          Inmobiliaria familiar con tres generaciones conociendo cada cuadra
          de zona oeste.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="w-full md:w-auto"
        >
          <SearchBar variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
