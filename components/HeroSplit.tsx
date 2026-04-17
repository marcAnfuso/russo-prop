"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const reviews = [
  { text: "Excelente atención", author: "María García" },
  { text: "Cerramos en tiempo récord", author: "Carlos Rodríguez" },
  { text: "La recomiendo mil veces", author: "Laura Fernández" },
  { text: "Profesionales y honestos", author: "Diego Martínez" },
  { text: "Acompañamiento de punta a punta", author: "Ana Suárez" },
];

export default function HeroSplit() {
  return (
    <section className="relative overflow-hidden bg-navy text-white -mt-[72px]">
      {/* Decorative gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,126,0.22),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.06),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-8 lg:pb-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: portrait card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-3xl overflow-hidden bg-gradient-to-br from-navy-500 via-navy-600 to-navy-700 shadow-2xl">
              {/* Big monogram background */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="font-display text-[18rem] lg:text-[22rem] font-bold text-white/5 leading-none select-none">
                  FR
                </span>
              </div>
              {/* Gradient vignette */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent"
              />

              {/* Floating quote card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 lg:right-auto lg:max-w-sm"
              >
                <div className="rounded-2xl bg-white/95 backdrop-blur-md p-6 text-navy shadow-xl">
                  <p className="font-display text-lg italic leading-snug text-gray-700">
                    &ldquo;Nací en San Justo. Mi vieja vendía desde el living.
                    Russo no es un negocio que armé — es la casa donde me crié.&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="h-10 w-10 rounded-full bg-magenta text-white flex items-center justify-center font-bold">
                      FR
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Franco Russo</p>
                      <p className="text-xs text-gray-500">
                        Director · 2da generación
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.5rem] font-semibold leading-[1.02] tracking-tight mb-6">
              Tu próximo hogar,
              <br />
              <span className="italic text-magenta">sin vueltas</span>.
            </h1>
            <p className="text-base sm:text-lg text-white/70 mb-10 leading-relaxed max-w-md">
              30 años viviendo, vendiendo y caminando zona oeste. No somos un
              portal — somos los que te abren la puerta.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/ventas"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-magenta text-white font-semibold shadow-lg hover:bg-magenta-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                Ver propiedades →
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-200"
              >
                Agendar visita
              </Link>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
              <div>
                <p className="font-mono-price text-2xl font-bold text-white">676</p>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">
                  propiedades
                </p>
              </div>
              <div>
                <p className="font-mono-price text-2xl font-bold text-white">
                  4.8<span className="text-sm">/5</span>
                </p>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">
                  Google rating
                </p>
              </div>
              <div>
                <p className="font-mono-price text-2xl font-bold text-white">30+</p>
                <p className="text-[11px] text-white/50 uppercase tracking-wider">
                  años
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Review marquee */}
      <div className="relative border-t border-white/10 py-5 overflow-hidden">
        <div className="flex gap-16 whitespace-nowrap animate-[marquee_40s_linear_infinite]">
          {[...reviews, ...reviews].map((r, i) => (
            <span key={i} className="text-white/45 text-sm flex-shrink-0">
              <span className="text-amber-400">★★★★★</span> &ldquo;{r.text}&rdquo; —{" "}
              {r.author}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
