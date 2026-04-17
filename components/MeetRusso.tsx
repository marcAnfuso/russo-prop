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
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(230,0,126,0.25),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: eyebrow + quote + name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Quiénes somos
            </p>

            <blockquote className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.15] tracking-tight max-w-3xl">
              <span className="text-magenta">&ldquo;</span>Nací en San Justo. Mi vieja
              vendía desde el living. Russo no es un negocio que armé — es{" "}
              <span className="italic">la casa donde me crié</span>.
              <span className="text-magenta">&rdquo;</span>
            </blockquote>

            <div className="flex items-center gap-4 pt-4">
              <div className="h-14 w-14 rounded-full bg-magenta/20 border border-magenta/40 text-white flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                FR
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Franco Russo
                </p>
                <p className="text-sm text-white/60">
                  Director · 3ra generación
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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

          {/* Right: mini stats card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 lg:justify-self-end"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 p-6 max-w-sm">
              <p className="text-[11px] text-white/50 uppercase tracking-widest mb-4">
                Lo que nos define
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                  <span className="font-display text-4xl font-semibold text-magenta leading-none">30</span>
                  <div>
                    <p className="text-sm font-semibold text-white">años en zona oeste</p>
                    <p className="text-xs text-white/50">Conocemos cada cuadra</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                  <span className="font-display text-4xl font-semibold text-magenta leading-none">3</span>
                  <div>
                    <p className="text-sm font-semibold text-white">generaciones Russo</p>
                    <p className="text-xs text-white/50">Tradición familiar intacta</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-display text-4xl font-semibold text-magenta leading-none">+2K</span>
                  <div>
                    <p className="text-sm font-semibold text-white">operaciones cerradas</p>
                    <p className="text-xs text-white/50">Experiencia real, no marketing</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
