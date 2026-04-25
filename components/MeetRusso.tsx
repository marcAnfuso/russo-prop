"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MeetRusso() {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* Full-bleed background photo */}
      <div className="absolute inset-0">
        <Image
          src="/images/neighborhoods/san-justo.jpg"
          alt="San Justo"
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        {/* Gradient overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(230,0,126,0.25),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8 max-w-3xl"
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Quiénes somos
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight">
            Desde <span className="text-magenta">1992</span> acompañando a quienes buscan su{" "}
            <span className="italic">próximo hogar</span>.
          </h1>

          <p className="text-white/75 text-lg leading-relaxed max-w-2xl">
            Somos una empresa con espíritu de servicio que busca la excelencia
            en todo lo que hace. Combinamos más de tres décadas de experiencia
            con toda la tecnología disponible y un equipo joven, capaz, idóneo
            y honesto.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-magenta text-white font-semibold shadow-[0_10px_30px_-8px_rgba(230,0,126,0.55)] hover:bg-magenta-600 hover:-translate-y-0.5 transition-all duration-200"
            >
              Conocenos
            </Link>
            <Link
              href="/tasaciones"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white font-semibold backdrop-blur-sm hover:bg-white/10 hover:border-white/60 transition-all duration-200"
            >
              Quiero tasar mi propiedad
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
