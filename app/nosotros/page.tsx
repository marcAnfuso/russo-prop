import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MeetRusso from "@/components/MeetRusso";
import BlueprintTimeline, { type TimelineItem } from "@/components/BlueprintTimeline";
import { Heart, Target, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Russo Propiedades: desde 1992 acompañando a quienes buscan su hogar en zona oeste. Servicio profesional y personalizado en San Justo, La Matanza.",
};

const timeline: TimelineItem[] = [
  {
    year: "1992",
    title: "Primeros pasos",
    text: "Abrimos la primera oficina, humilde pero con objetivos muy claros.",
    city: "sj",
  },
  {
    year: "1995",
    title: "Oficina propia",
    text: "Lo que empezó como una visión, se transformó en realidad: inauguramos nuestra primera oficina propia.",
    city: "sj",
  },
  {
    year: "2008",
    title: "Administración",
    text: "Creamos un gran departamento de administración de propiedades, lo que nos permitió sumar un enorme capital humano al equipo.",
    city: "sj",
  },
  {
    year: "2017",
    title: "Oficina modelo",
    text: "Inauguramos una nueva oficina modelo en una moderna torre, con divisiones dedicadas a administración, alquileres y ventas.",
    city: "sj",
  },
  {
    year: "2024",
    title: "Expansión",
    text: "Dimos el salto a un nuevo territorio: abrimos nuestra primera oficina fuera de San Justo.",
    city: "rm",
  },
  {
    year: "2026",
    title: "Próxima apertura",
    text: "Sumamos una segunda sede en Ramos Mejía, consolidando nuestra presencia en toda zona oeste.",
    city: "rm",
  },
];

const pillars = [
  {
    icon: Heart,
    title: "Historia",
    text: "Más de 30 años acompañando a familias en zona oeste. Empezamos en 1992 con una oficina humilde y objetivos claros. Durante este último año agregamos a nuestra experiencia toda la tecnología disponible, que sumada a nuestro más importante capital (gente joven, capaz, idónea y honesta) permite brindar un servicio de excelencia.",
  },
  {
    icon: Target,
    title: "Objetivos",
    text: "Somos una empresa con espíritu de servicio, buscando la excelencia en todo lo que hacemos. Nuestra prioridad es la tranquilidad del cliente, acompañándolo durante todo el proceso con una gestión profesional y personalizada.",
  },
  {
    icon: Eye,
    title: "Visión",
    text: "El cliente es nuestra razón de ser. Cada nuevo reto se convierte en una motivación personal — su confianza es nuestro valor más preciado. Queremos acompañar a cada persona a construir su futuro teniendo en cuenta sus necesidades y objetivos.",
  },
];

export default function NosotrosPage() {
  return (
    <main className="bg-white">
      {/* Hero with MeetRusso reused */}
      <MeetRusso />

      {/* Historia — timeline tipo blueprint arquitectónico */}
      <BlueprintTimeline items={timeline} />

      {/* Slogans — el de antes y el de ahora */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Nuestros slogans
            </p>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              La forma cambia, los valores no.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Slogan anterior */}
            <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 lg:p-10">
              <span className="inline-block rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-5">
                De siempre
              </span>
              <p className="font-display text-2xl sm:text-3xl leading-tight text-navy italic">
                &ldquo;Usted sabe en quién confiar.&rdquo;
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Nuestro slogan durante décadas. Una frase de familia que se trajo a la inmobiliaria y se quedó.
              </p>
            </div>

            {/* Slogan actual */}
            <div className="relative rounded-2xl border border-magenta/30 bg-gradient-to-br from-magenta/5 via-white to-magenta/10 p-8 lg:p-10 shadow-[0_10px_40px_-12px_rgba(230,0,126,0.2)]">
              <span className="inline-block rounded-full bg-magenta text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-5">
                Hoy
              </span>
              <p className="font-display text-2xl sm:text-3xl leading-tight text-navy">
                <span className="text-magenta">Valores</span> humanos.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Nuestra bandera actual. Porque más allá de toda la tecnología, lo que sigue haciendo la diferencia es la gente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares: Historia · Objetivos · Visión */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Quiénes somos
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy">
              Nuestra <span className="italic text-magenta">razón de ser</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 lg:p-8 hover:border-magenta/30 hover:shadow-[0_12px_40px_-12px_rgba(230,0,126,0.18)] transition-all duration-300"
              >
                <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gray-50 text-navy-400 flex items-center justify-center group-hover:bg-magenta-50 group-hover:text-magenta transition-colors mb-4">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-navy mb-3">
                  {p.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sedes */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(230,0,126,0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
              Nuestras sedes
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
              Cerca tuyo, en{" "}
              <span className="italic text-magenta">zona oeste</span>.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Tenemos dos puntos de referencia en La Matanza. La oficina de
              San Justo es nuestra sede histórica desde 1992; en Ramos Mejía
              estamos abriendo nuestro nuevo local con atención al público.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <SedeCard
              tag="Sede histórica"
              name="Pte. J. D. Perón 3501"
              locality="San Justo"
              image="/images/sedes/san-justo.webp"
              imageAlt="Frente del local de Russo Propiedades en Av. Perón 3501, San Justo"
              description="Donde empezamos en 1992. La atención del equipo se hace por WhatsApp, mail o coordinando una cita previa."
            />
            <SedeCard
              tag="Próxima apertura"
              tagAccent
              name="Belgrano 123"
              locality="Ramos Mejía"
              image="/images/neighborhoods/ramos-mejia.jpg"
              imageAlt="Sede de Russo Propiedades en Ramos Mejía"
              description="Nuestra nueva oficina con atención al público sin cita previa. Vení a conocernos en cuanto abramos."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-magenta text-white font-semibold shadow-[0_10px_30px_-8px_rgba(230,0,126,0.55)] hover:bg-magenta-600 hover:-translate-y-0.5 transition-all duration-200"
            >
              Escribinos
            </Link>
            <a
              href="https://wa.me/5491150187340?text=Hola!%20Quer%C3%ADa%20consultarles..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-semibold backdrop-blur-sm hover:bg-white/10 hover:border-white/60 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +54 11 5018 7340
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function SedeCard({
  tag,
  tagAccent,
  name,
  locality,
  image,
  imageAlt,
  description,
}: {
  tag: string;
  tagAccent?: boolean;
  name: string;
  locality: string;
  image: string;
  imageAlt: string;
  description: string;
}) {
  return (
    <article className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 transition-colors duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              tagAccent
                ? "bg-magenta text-white"
                : "bg-white/15 text-white border border-white/20 backdrop-blur-sm"
            }`}
          >
            {tag}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-2">
        <h3 className="font-display text-2xl font-semibold text-white leading-tight">
          {name}
        </h3>
        <p className="text-magenta text-sm font-semibold uppercase tracking-widest">
          {locality}
        </p>
        <p className="text-white/70 leading-relaxed pt-2">{description}</p>
      </div>
    </article>
  );
}
