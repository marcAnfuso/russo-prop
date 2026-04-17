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
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-navy/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,126,0.15),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
        >
          Tu próximo hogar empieza acá
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl"
        >
          Las necesidades y objetivos de nuestros clientes son nuestra prioridad
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          <SearchBar variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
