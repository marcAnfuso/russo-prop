import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Sparkles,
  CheckCircle2,
  Building2,
  Video,
  Users,
  Database,
  Globe,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin-auth";
import AdminLogin from "../AdminLogin";

export const metadata: Metadata = {
  title: "Guía · Admin",
  description: "Cómo usar el panel de Russo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AyudaPage() {
  const me = await getCurrentAdmin();
  if (!me) return <AdminLogin />;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-magenta font-semibold">
            Guía rápida
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-navy">
            Cómo funciona el panel
          </h1>
          <p className="mt-2 text-gray-500 leading-relaxed">
            Hola {me.display_name} 👋. Acá te explicamos qué hace cada parte del
            panel y cómo se conecta con la web pública. Si dudás de algo, abrí
            esta guía y listo.
          </p>
        </div>

        {/* ── 1. De dónde sale cada cosa ───────────────────────────── */}
        <Section
          number="01"
          title="¿De dónde salen los datos?"
          subtitle="Tres fuentes distintas: Xintel, este panel y nuestra base."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <SourceCard
              icon={<Database className="h-5 w-5" />}
              title="Xintel"
              chip="Fuente principal"
              chipClass="bg-magenta text-white"
              description="Propiedades en venta y alquiler + Emprendimientos. Si querés cambiar precio, fotos, descripción de una propiedad o emprendimiento → lo cambiás en Xintel y en ~30 min se refleja en la web."
            />
            <SourceCard
              icon={<Globe className="h-5 w-5" />}
              title="Este panel"
              chip="Curaduría"
              chipClass="bg-navy text-white"
              description="Acá decidís qué se destaca, qué aparece como nuevo, qué se marca como vendido, qué emprendimiento se muestra y qué videos van en /historias. No reemplaza a Xintel — lo complementa."
            />
          </div>
        </Section>

        {/* ── 2. Los 3 botones de cada propiedad ───────────────────── */}
        <Section
          number="02"
          title="Los 3 botones de cada propiedad"
          subtitle="En el buscador del panel, cada card tiene tres botones. Cada uno hace algo distinto en la web."
        >
          <div className="space-y-4">
            <ButtonExplainer
              icon={<Star className="h-5 w-5" />}
              colorClass="text-magenta bg-magenta-50"
              name="Marcar exclusiva"
              effect="Entra al carousel «Propiedades exclusivas» del home."
              detail="Marcá las que más te interesa exhibir. Si marcás varias, la web va rotando 12 por día (no se aburre el visitante). Para sacarla del carousel, le hacés click de nuevo y vuelve a estado normal."
            />
            <ButtonExplainer
              icon={<Sparkles className="h-5 w-5" />}
              colorClass="text-navy bg-navy-50"
              name="Nueva"
              effect="Aparece en la sección «Nuevos ingresos» del home."
              detail="Pensado para propiedades que recién entraron. Auto-expira a los 30 días — si la marcaste hoy, dentro de un mes desaparece sola sin que tengas que destocarla. Útil para no olvidar."
            />
            <ButtonExplainer
              icon={<CheckCircle2 className="h-5 w-5" />}
              colorClass="text-emerald-700 bg-emerald-50"
              name="Vender"
              effect="Pone un sello verde «Vendimos» y reemplaza el precio por «Vendida»."
              detail="Marca la propiedad como vendida sin esconderla. Sigue apareciendo en los listados pero con el sello de venta concretada — refuerza la sensación de que Russo cierra operaciones."
            />
          </div>
        </Section>

        {/* ── 3. Emprendimientos ──────────────────────────────────── */}
        <Section
          number="03"
          title="Emprendimientos"
          subtitle="Acá el flujo es distinto: se cargan en Xintel y desde el panel sólo elegís cuáles mostrar."
        >
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-magenta/10 text-magenta flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy">¿Por qué no los puedo crear acá?</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Russo carga toda la ficha del emprendimiento en Xintel
                  (fotos, plano, video, precios, status). Hacer una segunda
                  carga acá sería duplicar trabajo. La web lee directo de
                  Xintel para que siempre esté sincronizado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <EyeOff className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy">¿Cómo escondo uno viejo?</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  En el panel «Emprendimientos» ves la lista completa. Cada
                  card tiene un botón <strong>«Ocultar del sitio»</strong>. Al
                  apretarlo desaparece del home y de la página /emprendimientos
                  pero <strong>no se borra nada en Xintel</strong> — la info
                  queda intacta. Para volver a mostrarlo, le hacés click de nuevo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Eye className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy">¿Cuántos se muestran en el home?</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Todos los visibles. Si tenés 5 visibles en el panel → 5 en el
                  home. Si tenés 7 → 7. La web muestra exactamente lo que vos
                  marcás como visible.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 4. Videos / Historias ───────────────────────────────── */}
        <Section
          number="04"
          title="Videos / Historias"
          subtitle="La sección /historias se alimenta sólo desde el panel — no toca Xintel."
        >
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-magenta/10 text-magenta flex items-center justify-center">
                <Video className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy">Cómo agregar un video</h3>
                <ol className="text-sm text-gray-600 mt-2 leading-relaxed space-y-1.5 list-decimal list-inside">
                  <li>Copiá la URL del video de TikTok o Instagram (Reel, post, etc).</li>
                  <li>En el panel «Historias», pegala en el campo y elegí la categoría.</li>
                  <li>Apretás «Agregar» y aparece en /historias al toque.</li>
                  <li>Para reordenar, arrastrás los videos. Para borrar uno, le das al ícono de basura.</li>
                </ol>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 5. Usuarios ─────────────────────────────────────────── */}
        <Section
          number="05"
          title="Usuarios del panel"
          subtitle="Quién puede entrar acá y qué puede hacer."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-magenta/30 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-magenta" />
                <h3 className="font-semibold text-navy">Owner</h3>
                <span className="rounded-full bg-magenta/10 text-magenta text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  manda
                </span>
              </div>
              <ul className="text-sm text-gray-600 leading-relaxed space-y-1 list-disc list-inside">
                <li>Crea y borra otros usuarios</li>
                <li>Resetea contraseñas de cualquiera</li>
                <li>Hace todo lo que un admin hace</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-navy" />
                <h3 className="font-semibold text-navy">Admin</h3>
                <span className="rounded-full bg-navy-50 text-navy text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  uso diario
                </span>
              </div>
              <ul className="text-sm text-gray-600 leading-relaxed space-y-1 list-disc list-inside">
                <li>Toda la curaduría (marcar exclusiva, vender, ocultar emp, videos)</li>
                <li>Puede cambiar su propia contraseña</li>
                <li>No puede crear ni borrar otros usuarios</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <KeyRound className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Olvidaste tu contraseña?</strong> Pedile al owner que te
                la resetee. Si vos sos el owner y la perdiste, escribinos.
              </p>
            </div>
          </div>
        </Section>

        {/* ── 6. Tiempos ─────────────────────────────────────────── */}
        <Section
          number="06"
          title="¿Cuánto tarda en aparecer un cambio?"
          subtitle="Spoiler: depende de quién lo hizo."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-emerald-700 fill-emerald-700" />
                <h3 className="font-semibold text-emerald-900">Al toque</h3>
              </div>
              <p className="text-sm text-emerald-900/80 leading-relaxed">
                Todo lo que hacés en este panel: marcar exclusiva, marcar como nuevo,
                vender, ocultar emprendimiento, agregar video. Apretás el botón
                y al refrescar la web ya está.
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-700" />
                <h3 className="font-semibold text-blue-900">~30 minutos</h3>
              </div>
              <p className="text-sm text-blue-900/80 leading-relaxed">
                Cambios que se hicieron en Xintel: nueva propiedad, edición de
                ficha, cambio de precio, nuevas fotos. Es la frecuencia con la
                que la web le pregunta a Xintel «¿hay novedades?».
              </p>
            </div>
          </div>
        </Section>

        {/* ── Cierre ─────────────────────────────────────────────── */}
        <div className="rounded-xl bg-navy text-white p-6 text-center">
          <p className="text-sm leading-relaxed">
            ¿Algo no queda claro o se rompió algo? Avisanos y lo solucionamos.
          </p>
        </div>
      </article>
    </main>
  );
}

// ── Subcomponentes ─────────────────────────────────────────────────────
function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-start gap-4">
        <span className="font-mono-price text-2xl font-bold text-magenta tabular-nums">
          {number}
        </span>
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-navy">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SourceCard({
  icon,
  title,
  chip,
  chipClass,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  chip: string;
  chipClass: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center text-navy">
          {icon}
        </div>
        <h3 className="font-semibold text-navy">{title}</h3>
        <span
          className={`ml-auto rounded-full text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${chipClass}`}
        >
          {chip}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ButtonExplainer({
  icon,
  colorClass,
  name,
  effect,
  detail,
}: {
  icon: React.ReactNode;
  colorClass: string;
  name: string;
  effect: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${colorClass}`}
        >
          {icon}
          {name}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-navy">{effect}</p>
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}
