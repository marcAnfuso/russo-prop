import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Building2,
  Bed,
  DollarSign,
  Car,
  Home as HomeIcon,
  TreePine,
} from "lucide-react";
import RussiaPageCTA from "@/components/RussiaPageCTA";

export const metadata: Metadata = {
  title: "Russia · Asistente de IA",
  description:
    "Conocé a Russia, la asistente de inteligencia artificial de Russo Propiedades. Buscá propiedades en zona oeste hablándole en castellano natural, sin filtros.",
  alternates: { canonical: "/russia" },
  openGraph: {
    title: "Russia · Asistente IA de Russo Propiedades",
    description:
      "Buscá propiedades en zona oeste hablándole en castellano natural · sin filtros, sin formularios.",
    type: "website",
  },
};

const STEPS = [
  {
    n: "01",
    title: "Decile lo que buscás",
    body: "En castellano normal. Como le hablarías a un asesor: «Casa en San Justo cerca de la estación, 3 ambientes, hasta 200 mil dólares».",
  },
  {
    n: "02",
    title: "Russia entiende y busca",
    body: "Extrae filtros, los aplica al catálogo en tiempo real y, si mencionás un punto de referencia, calcula distancias reales con coordenadas.",
  },
  {
    n: "03",
    title: "Te muestra los matches",
    body: "Hasta 5 propiedades reales del catálogo con foto, precio, dirección, distancia y un link directo a la ficha completa.",
  },
];

const EXAMPLES = [
  {
    icon: <Building2 className="h-4 w-4" />,
    text: "Departamento de 2 ambientes en Ramos Mejía hasta USD 100.000",
    tag: "Filtro exacto",
  },
  {
    icon: <MapPin className="h-4 w-4" />,
    text: "Casa cerca de la estación de Haedo, hasta USD 250.000",
    tag: "Geo-búsqueda",
  },
  {
    icon: <Car className="h-4 w-4" />,
    text: "Algo con cochera doble en San Justo a estrenar",
    tag: "Detalles específicos",
  },
  {
    icon: <DollarSign className="h-4 w-4" />,
    text: "Alquiler de departamento bajo $500.000 en La Matanza",
    tag: "Por presupuesto",
  },
  {
    icon: <Bed className="h-4 w-4" />,
    text: "Monoambiente para alquiler en Ramos",
    tag: "Tipo específico",
  },
  {
    icon: <TreePine className="h-4 w-4" />,
    text: "PH con patio en Villa Luzuriaga",
    tag: "Por amenities",
  },
  {
    icon: <HomeIcon className="h-4 w-4" />,
    text: "Casa de 3 dormitorios y 2 baños cerca de UNLaM",
    tag: "Combinada",
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    text: "Galpón industrial en La Tablada de 500 a 1000 m²",
    tag: "Comercial",
  },
];

const FAQ = [
  {
    q: "¿Russia guarda mis datos?",
    a: "No. Las consultas no se asocian a una persona ni se guardan con tu identidad. Solo procesamos el mensaje para devolverte propiedades.",
  },
  {
    q: "¿Reemplaza a un asesor?",
    a: "No. Russia te orienta y filtra el catálogo. Cuando encuentres propiedades que te interesan, podés escribirnos por WhatsApp y un asesor humano te acompaña en el resto del proceso.",
  },
  {
    q: "¿Qué pasa si no encuentra lo que busco?",
    a: "Te lo dice directamente y sugiere flexibilizar criterios (subir presupuesto, ampliar zonas, sacar algún filtro). Russia nunca inventa propiedades que no existen.",
  },
  {
    q: "¿Tiene costo?",
    a: "Es completamente gratis. No hay límites de consultas ni registro requerido.",
  },
];

export default function RussiaInfoPage() {
  return (
    <main className="bg-gradient-to-b from-white via-gray-50/40 to-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Glow magenta de fondo · sutil */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(230,0,126,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-magenta/8 border border-magenta/20 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[2px] text-magenta backdrop-blur-sm mb-6">
            <Sparkles className="h-3 w-3" />
            Asistente de IA · Inédito en zona oeste
          </span>

          {/* Avatar Russia · círculo gradient con glow */}
          <div className="relative mx-auto mb-7 h-24 w-24">
            <div
              aria-hidden="true"
              className="absolute inset-[-12px] rounded-full bg-magenta/30 blur-2xl animate-pulse"
            />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-magenta via-[#cc006f] to-navy shadow-[0_24px_48px_-12px_rgba(230,0,126,0.5),0_8px_16px_-6px_rgba(26,34,81,0.35),inset_0_2px_0_rgba(255,255,255,0.2)] ring-1 ring-white/20 flex items-center justify-center">
              <Sparkles className="h-9 w-9 text-white drop-shadow-md" />
            </div>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-semibold text-navy leading-[1.05] tracking-tight mb-4">
            Conocé a <em className="text-magenta italic not-italic-mobile">Russia</em>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-9">
            Tu asistente con inteligencia artificial para encontrar la propiedad ideal sin tocar un solo filtro. Hablale en castellano normal · ella se encarga del resto.
          </p>

          <RussiaPageCTA size="lg" />

          <p className="mt-4 text-xs text-gray-400 font-medium">
            Gratis · Sin registro · 100% privado
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[2.5px] text-magenta mb-2">
            Cómo funciona
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy">
            Tres pasos. Sin filtros.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative rounded-3xl bg-white border border-gray-100/80 shadow-[0_2px_4px_-2px_rgba(26,34,81,0.06),0_18px_40px_-20px_rgba(26,34,81,0.18)] p-7 hover:shadow-[0_8px_16px_-4px_rgba(230,0,126,0.18),0_24px_56px_-20px_rgba(26,34,81,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="font-display text-5xl font-semibold text-magenta/15 leading-none mb-4 block">
                {s.n}
              </span>
              <h3 className="font-display text-xl font-semibold text-navy mb-2 leading-tight">
                {s.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUÉ PODÉS PEDIRLE */}
      <section className="bg-gradient-to-b from-gray-50/60 to-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[2.5px] text-magenta mb-2">
              Qué podés pedirle
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
              Estos son ejemplos reales
            </h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto">
              Russia entiende presupuestos, zonas, ambientes exactos, puntos de referencia, características específicas y combinaciones complejas.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {EXAMPLES.map((ex) => (
              <RussiaPageCTA
                key={ex.text}
                presetMessage={ex.text}
                variant="example"
                example={ex}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CONFIANZA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-navy to-[#2d3a7a] p-10 sm:p-14 text-white relative overflow-hidden shadow-[0_30px_80px_-20px_rgba(26,34,81,0.45)]">
          {/* Glow magenta */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(230,0,126,0.35) 0%, transparent 55%)",
            }}
          />
          <div className="relative grid gap-8 md:grid-cols-3">
            <div>
              <ShieldCheck className="h-7 w-7 text-magenta mb-3" />
              <h3 className="font-semibold text-base mb-1.5">Datos reales</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Russia consulta el inventario actualizado en vivo. Cada propiedad que ves está publicada y disponible.
              </p>
            </div>
            <div>
              <CheckCircle2 className="h-7 w-7 text-magenta mb-3" />
              <h3 className="font-semibold text-base mb-1.5">No inventa</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Si no hay match con tus criterios, te lo dice y sugiere flexibilizar. Sin propiedades fantasma.
              </p>
            </div>
            <div>
              <Zap className="h-7 w-7 text-magenta mb-3" />
              <h3 className="font-semibold text-base mb-1.5">Privado</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Sin login. Sin cookies de tracking. Las conversaciones no se guardan asociadas a tu identidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[2.5px] text-magenta mb-2">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-3xl font-semibold text-navy">
            Todo lo que querés saber
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white border border-gray-100/80 shadow-[0_2px_4px_-2px_rgba(26,34,81,0.04),0_8px_24px_-12px_rgba(26,34,81,0.10)] overflow-hidden"
            >
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 text-sm font-semibold text-navy hover:bg-gray-50/60 transition-colors">
                <span>{item.q}</span>
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-magenta/10 text-magenta flex items-center justify-center text-base font-bold transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100/60 pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24 pt-4">
        <div className="rounded-3xl bg-white border border-gray-100/80 shadow-[0_4px_8px_-2px_rgba(26,34,81,0.05),0_30px_70px_-20px_rgba(26,34,81,0.18)] p-10 sm:p-14 text-center relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(230,0,126,0.07) 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <Sparkles className="h-7 w-7 text-magenta mx-auto mb-3" />
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3 leading-tight">
              Lista para encontrar tu próxima propiedad
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto mb-7">
              Probala ahora · si en 30 segundos no te encuentra al menos 3 opciones razonables, escribinos por WhatsApp.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <RussiaPageCTA size="md" />
              <a
                href="https://wa.me/5491150187340?text=Hola!%20Quer%C3%ADa%20consultarles..."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-navy hover:border-magenta hover:text-magenta transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Hablar con un asesor
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
