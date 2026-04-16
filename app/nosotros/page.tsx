import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MeetRusso from "@/components/MeetRusso";
import { Home, Handshake, Compass, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotros · Russo Propiedades",
  description:
    "Russo Propiedades es una inmobiliaria familiar de zona oeste. Tres generaciones trabajando el mismo territorio desde San Justo.",
};

const values = [
  {
    icon: Home,
    title: "Conocimiento del territorio",
    text: "Nacimos y crecimos en zona oeste. No tasamos de escritorio: conocemos cada cuadra.",
  },
  {
    icon: Handshake,
    title: "Trato directo",
    text: "Hablás con quien decide. Sin intermediarios, sin respuestas tibias.",
  },
  {
    icon: Compass,
    title: "Acompañamiento completo",
    text: "Desde la primera visita hasta la escritura. Nos quedamos del lado tuyo.",
  },
  {
    icon: ShieldCheck,
    title: "Responsabilidad intacta",
    text: "Nuestro apellido está en la puerta. Es lo que nos mantiene despiertos.",
  },
];

const timeline = [
  {
    year: "1994",
    title: "Primera oficina en San Justo",
    text: "Elba Russo abre la inmobiliaria en el centro de San Justo con dos tableros y un teléfono.",
  },
  {
    year: "2005",
    title: "Expansión a zona oeste",
    text: "Sumamos operaciones en Ramos Mejía, Haedo, Villa Luzuriaga, Ciudadela y Morón.",
  },
  {
    year: "2015",
    title: "Segunda generación",
    text: "Franco Russo se suma al equipo y moderniza el trabajo: fotografía profesional, tasaciones basadas en data real.",
  },
  {
    year: "2024",
    title: "Más de 2.000 operaciones",
    text: "Cerramos el año con la confianza acumulada de 30 años y un equipo de 8 asesores activos.",
  },
];

export default function NosotrosPage() {
  return (
    <main className="bg-white">
      {/* Hero with MeetRusso reused */}
      <MeetRusso />

      {/* Historia / timeline */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Historia
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy">
              30 años, <span className="italic text-magenta">una sola cuadra</span> de San Justo.
            </h2>
          </div>

          <ol className="relative border-l-2 border-gray-200 ml-2 space-y-10">
            {timeline.map((t) => (
              <li key={t.year} className="pl-8 relative">
                <span className="absolute left-0 top-1.5 -translate-x-1/2 h-4 w-4 rounded-full bg-magenta ring-4 ring-gray-50" />
                <p className="font-mono-price text-sm text-magenta font-semibold mb-1">
                  {t.year}
                </p>
                <h3 className="font-display text-xl font-semibold text-navy mb-1">
                  {t.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  {t.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Cómo trabajamos
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy">
              Lo que <span className="italic text-magenta">no</span> cambia.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 hover:border-magenta/30 hover:shadow-[0_12px_40px_-12px_rgba(230,0,126,0.18)] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gray-50 text-navy-400 flex items-center justify-center group-hover:bg-magenta-50 group-hover:text-magenta transition-colors">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-navy mb-2">
                      {v.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{v.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sucursal */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(230,0,126,0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Nuestra sede
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
              Plaza de San Justo.{" "}
              <span className="italic text-magenta">Desde 1994</span>.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-xl">
              Nos podés encontrar a metros de la municipalidad. Atendemos con o
              sin cita previa, y siempre hay alguien del equipo en el local.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-magenta text-white font-semibold shadow-[0_10px_30px_-8px_rgba(230,0,126,0.55)] hover:bg-magenta-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                Escribinos
              </Link>
              <a
                href="tel:+541146514024"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white font-semibold backdrop-blur-sm hover:bg-white/10 hover:border-white/60 transition-all duration-200"
              >
                +54 11 4651 4024
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/neighborhoods/san-justo.jpg"
                alt="San Justo — sede de Russo Propiedades"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] text-white/70 uppercase tracking-widest mb-1">
                  Sede central
                </p>
                <p className="font-display text-xl text-white font-semibold leading-tight">
                  Centro de San Justo, La Matanza
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
