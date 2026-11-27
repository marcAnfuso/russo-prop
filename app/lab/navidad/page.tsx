import Link from "next/link";
import { Lightbulb, PartyPopper, Building2, ArrowRight } from "lucide-react";

const IDEAS = [
  {
    slug: "guirnalda",
    name: "Guirnalda y moño",
    tagline: "La clásica, elegante",
    desc: "Una guirnalda de luces de lado a lado del Hero que se prende lamparita por lamparita al entrar (y se hamaca si le pasás el mouse). 'Empieza acá' queda atado con un moño: tu próxima casa es el regalo. Russia con gorro.",
    Icon: Lightbulb,
    accent: "bg-amber-500",
  },
  {
    slug: "brindis",
    name: "El brindis del 24",
    tagline: "Navidad argentina, de verano",
    desc: "Nada de nieve: fuegos artificiales en el cielo del Hero, en dorado, magenta y celeste. Si tocás el cielo, sale uno. El subrayado se escribe con una bengalita y el cintillo cuenta los días al brindis, como el del Mundial.",
    Icon: PartyPopper,
    accent: "bg-magenta",
  },
  {
    slug: "adviento",
    name: "Edificio de Adviento",
    tagline: "Lo que nadie tiene",
    desc: "Una sección nueva en el home: un edificio de noche con 24 ventanas, una por día de diciembre. Detrás de cada una, una propiedad elegida por el equipo, un dato útil o un saludo. Una razón para volver todos los días.",
    Icon: Building2,
    accent: "bg-emerald-700",
  },
];

export const metadata = { title: "Lab · Navidad" };

export default function LabNavidadIndex() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-emerald-700 mb-2">Lab · Russo Propiedades · 🎄</p>
          <h1 className="font-display text-4xl font-semibold text-navy">Navidad, <span className="italic text-magenta">a la Russo</span></h1>
          <p className="mt-3 text-sm text-gray-500 max-w-xl leading-relaxed">
            Tres ideas, cada una en su URL sobre el Hero real. Se pueden combinar (por ejemplo, la guirnalda con el edificio) y, como Halloween, se prenden y apagan solas por fecha: la propuesta es del lunes 30/11 a Reyes (6/1).
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/lab/navidad/combo" className="group mb-6 flex items-center justify-between gap-4 rounded-2xl bg-navy p-6 text-white hover:shadow-card-hover transition-all">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-300">Lo nuevo · 🥂 + 🤖 + 🎄</p>
            <h2 className="font-display text-2xl font-semibold">Todo junto: el brindis, Russia robot y las cards decoradas</h2>
            <p className="mt-1 text-sm text-white/70">Russia robot con gorro que dice &quot;¡Jo, jo, jo!&quot; (tocala: tiene voz), bolitas, guirnaldas, moños y acebo en las cards reales, y 5 bolitas doradas escondidas para buscar.</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 text-amber-300 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/lab/navidad/combo-bola" className="group mb-6 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#8f0e22] to-[#c8102e] p-6 text-white hover:shadow-card-hover transition-all">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-200">Lo más nuevo · ❄️ + 🦌 + 🎄</p>
            <h2 className="font-display text-2xl font-semibold">Combo 1: la bola de nieve + Rudolf</h2>
            <p className="mt-1 text-sm text-white/80">Intro de la bola de nieve, trineo, título con guirnalda de pino, bolitas y botita, Rudolf (el reno IA de Russo) y las cards decoradas.</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 text-amber-200 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/lab/navidad/intro" className="group mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 hover:border-magenta hover:shadow-card-hover transition-all">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-700">Intro de entrada · como la de Halloween</p>
            <h2 className="font-display text-2xl font-semibold text-navy">3 intros: la casa se prende, el regalo y chin chin</h2>
            <p className="mt-1 text-sm text-gray-600">Pantalla completa de 5 segundos, una vez por dispositivo y con &quot;Saltar&quot;. Después entra la web con todo lo de arriba.</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 text-magenta transition-transform group-hover:translate-x-1" />
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {IDEAS.map((p) => (
            <Link key={p.slug} href={`/lab/navidad/${p.slug}`} className="group relative bg-white rounded-2xl border border-gray-100 hover:border-magenta hover:shadow-card-hover transition-all duration-200 p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${p.accent}`}><p.Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">{p.tagline}</p>
                  <h2 className="font-display text-xl font-semibold text-navy leading-tight">{p.name}</h2>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              <div className="mt-auto pt-2 inline-flex items-center gap-1 text-sm font-semibold text-magenta">Ver prototipo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
