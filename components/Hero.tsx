"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";

export default function Hero() {
  return (
    <section className="relative -mt-[72px] min-h-[72vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-russo-color.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Base darkening — ligero, sólo para bajar el ruido de la foto. */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Radial focal: oscurece el centro donde vive el copy, sin
            apagar los bordes de la imagen. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 100%)",
          }}
        />
        {/* Fade inferior para separar el hero de la sección siguiente. */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto">
        {/* Kicker — línea chica que prepara el titular. */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-5 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-white/80"
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-magenta" aria-hidden="true" />
            Zona Oeste · desde 1994
            <span className="h-px w-8 bg-magenta" aria-hidden="true" />
          </span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display font-bold text-white tracking-tight mb-10 text-5xl sm:text-6xl lg:text-7xl leading-[1.05]"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,0.35)" }}
        >
          Tu próximo hogar
          <br />
          <span className="relative inline-block">
            <span className="relative z-10">empieza acá</span>
            <svg
              viewBox="0 0 300 20"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute left-0 right-0 -bottom-2 w-full h-3 text-magenta"
            >
              <path
                d="M5 12 Q 80 2, 150 10 T 295 8"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="w-full flex justify-center"
        >
          <SearchBar variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
