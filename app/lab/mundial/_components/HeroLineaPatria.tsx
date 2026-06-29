"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";

/**
 * Hero mundialista discreto: la línea ondulada bajo "empieza acá" pasa de
 * magenta a celeste/blanca (franjas de la bandera) y termina en un Sol de Mayo.
 * Sin bufanda — cero tapado de texto.
 */

function SolDeMayo({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <g stroke="#E8A317" strokeWidth="1.5" strokeLinecap="round">
        {rays.map((deg) => {
          const r = (deg * Math.PI) / 180;
          const x1 = 20 + Math.cos(r) * 12.5;
          const y1 = 20 + Math.sin(r) * 12.5;
          const x2 = 20 + Math.cos(r) * 18;
          const y2 = 20 + Math.sin(r) * 18;
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <circle cx="20" cy="20" r="11" fill="#F6B40E" stroke="#E8A317" strokeWidth="1.2" />
    </svg>
  );
}

export default function HeroLineaPatria() {
  return (
    <section className="relative -mt-[72px] min-h-[72vh] md:min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hero-russo-color.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-5 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-white/80"
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-8 bg-magenta" aria-hidden="true" />
            Zona Oeste · desde 1992
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
            {/* Línea ondulada celeste/blanca (franjas) */}
            <svg
              viewBox="0 0 300 20"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute left-0 right-0 -bottom-2 w-full h-3"
            >
              <path
                d="M5 12 Q 80 2, 150 10 T 295 8"
                stroke="#6CA6DC"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M5 12 Q 80 2, 150 10 T 295 8"
                stroke="#FFFFFF"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            {/* Sol de Mayo al final de la línea */}
            <span className="absolute -bottom-[0.28em] -right-[0.5em] z-20 w-[0.62em] h-[0.62em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]">
              <SolDeMayo className="w-full h-full" />
            </span>
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
