import Link from "next/link";
import {
  Clock,
  Sparkles,
  Tag,
  Wand2,
  CircleDot,
  Crown,
  PaintBucket,
  Volleyball,
  Footprints,
  PartyPopper,
  ArrowRight,
} from "lucide-react";

type Variant = {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  group: "Sitio" | "Russia";
  Icon: typeof Clock;
  accent: string;
};

const VARIANTS: Variant[] = [
  {
    slug: "countdown",
    name: "Banner countdown",
    tagline: "Barra fina arriba",
    desc: "Franja celeste/blanca arriba del navbar con el rival, fase y un countdown vivo al próximo partido. Cierre con X.",
    group: "Sitio",
    Icon: Clock,
    accent: "bg-sky-500",
  },
  {
    slug: "confetti",
    name: "Confetti al cargar",
    tagline: "Lluvia sutil",
    desc: "Papelitos celestes, blancos y dorados que caen unos 5-6 segundos cuando entra al sitio. Se pueden controlar con prefers-reduced-motion.",
    group: "Sitio",
    Icon: Sparkles,
    accent: "bg-sky-400",
  },
  {
    slug: "sticker",
    name: "Sticker en esquina",
    tagline: "🇦🇷 ¡Vamos!",
    desc: "Sticker bandera flotante en esquina inf. derecha (arriba del WhatsApp). Wiggle suave + click dispara confeti.",
    group: "Sitio",
    Icon: Tag,
    accent: "bg-sky-600",
  },
  {
    slug: "hero",
    name: "Hero patrio",
    tagline: "Detalles muy sutiles",
    desc: "El kicker arriba del titular pasa a celeste/blanco con 🇦🇷. El garabato bajo 'empieza acá' deja el magenta y pasa a gradiente bandera.",
    group: "Sitio",
    Icon: Wand2,
    accent: "bg-sky-700",
  },
  {
    slug: "pelota",
    name: "Pelota rodando",
    tagline: "Easter egg lúdico",
    desc: "Cada 12 segundos una pelota de fútbol cruza la parte inferior de la pantalla rodando de izquierda a derecha. Discreta pero notoria.",
    group: "Sitio",
    Icon: CircleDot,
    accent: "bg-sky-800",
  },
  {
    slug: "russia-vincha",
    name: "Russia con vincha",
    tagline: "Permanente sutil",
    desc: "Vinchita celeste/blanca con un solcito apoyada arriba del botón flotante de Russia. Sigue siendo Russia, ahora con onda hincha.",
    group: "Russia",
    Icon: Crown,
    accent: "bg-magenta",
  },
  {
    slug: "russia-pintura",
    name: "Russia cara pintada",
    tagline: "Permanente sutil",
    desc: "Dos rayitas celestes diagonales sobre el ícono, como un hincha pintado para la cancha. Más minimalista que la vincha.",
    group: "Russia",
    Icon: PaintBucket,
    accent: "bg-magenta",
  },
  {
    slug: "russia-pelota-rebote",
    name: "Russia con pelota",
    tagline: "Loop infinito",
    desc: "Una pelotita de fútbol rebota permanentemente al lado del botón de Russia. Atrae la mirada sin ser intrusivo.",
    group: "Russia",
    Icon: Volleyball,
    accent: "bg-magenta",
  },
  {
    slug: "russia-patea",
    name: "Russia patea",
    tagline: "Animación al cargar",
    desc: "Cuando entra el visitante: Russia hace un mini wind-up y patea una pelota que sale rodando hacia la derecha de la pantalla. Se ejecuta una vez por sesión.",
    group: "Russia",
    Icon: Footprints,
    accent: "bg-magenta",
  },
  {
    slug: "russia-confetti",
    name: "Russia confetti",
    tagline: "Click en el FAB",
    desc: "Al abrir Russia por primera vez explota un confetti celeste/blanco. Celebra el primer encuentro con la IA. (En este demo el click reactiva el efecto)",
    group: "Russia",
    Icon: PartyPopper,
    accent: "bg-magenta",
  },
];

export const metadata = { title: "Lab · Mundial 2026" };

export default function LabMundialIndex() {
  const sitio = VARIANTS.filter((v) => v.group === "Sitio");
  const russia = VARIANTS.filter((v) => v.group === "Russia");

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-magenta mb-2">
            Lab · Russo Propiedades · 🇦🇷
          </p>
          <h1 className="font-display text-4xl font-semibold text-navy">
            Decorando para el <span className="italic text-magenta">Mundial 2026</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 max-w-2xl leading-relaxed">
            10 ideas distintas, en su propia URL para que las compares lado a
            lado. Cada una se mete con el sitio real arriba (Hero + Navbar)
            para que veas cómo queda integrado, no aislado.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="font-display text-2xl font-semibold text-navy mb-1">
          Sitio · efectos globales
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Cosas que viven en cualquier página: banner, confeti, sticker, hero,
          pelota.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {sitio.map((v) => (
            <VariantCard key={v.slug} v={v} />
          ))}
        </div>

        <h2 className="font-display text-2xl font-semibold text-navy mb-1">
          Russia · la IA del sitio
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Decoraciones del botón flotante de Russia (esquina inferior izquierda).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {russia.map((v) => (
            <VariantCard key={v.slug} v={v} />
          ))}
        </div>

        <p className="mt-10 text-xs text-gray-400 text-center">
          Después de elegir las que te gustan, las llevamos a producción con un
          flag de fecha (se activan solas durante el Mundial y se apagan al
          terminar).
        </p>
      </section>
    </main>
  );
}

function VariantCard({ v }: { v: Variant }) {
  return (
    <Link
      href={`/lab/mundial/${v.slug}`}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-magenta hover:shadow-card-hover transition-all duration-200 p-6 flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${v.accent}`}
        >
          <v.Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
            {v.tagline}
          </p>
          <h3 className="font-display text-xl font-semibold text-navy leading-tight">
            {v.name}
          </h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
      <div className="mt-auto pt-2 inline-flex items-center gap-1 text-sm font-semibold text-magenta">
        Ver prototipo
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
