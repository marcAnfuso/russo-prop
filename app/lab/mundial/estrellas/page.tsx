import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export const metadata = { title: "Lab · Mundial · 3 estrellas" };

const GOLD = "#F6B40E";
const CELESTE = "#6CA6DC";

/** Fila de 3 estrellas de campeón. */
function Estrellas({
  size = 12,
  color = GOLD,
  gap = 2,
  outlined = false,
}: {
  size?: number;
  color?: string;
  gap?: number;
  outlined?: boolean;
}) {
  return (
    <div className="flex items-center justify-center" style={{ gap }}>
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          style={{
            width: size,
            height: size,
            color,
            fill: outlined ? "none" : color,
          }}
          strokeWidth={outlined ? 2.5 : 1}
        />
      ))}
    </div>
  );
}

/** Estrellas con el año de cada mundial debajo de cada una. */
function EstrellasAnios({
  starSize = 14,
  color = GOLD,
  yearColor = "#9aa1b2",
}: {
  starSize?: number;
  color?: string;
  yearColor?: string;
}) {
  const years = ["1978", "1986", "2022"];
  return (
    <div className="flex items-start justify-center gap-2.5">
      {years.map((y) => (
        <div key={y} className="flex flex-col items-center gap-[1px]">
          <Star style={{ width: starSize, height: starSize, color, fill: color }} strokeWidth={1} />
          <span
            className="font-bold tracking-wide tabular-nums leading-none"
            style={{ fontSize: Math.max(7, starSize * 0.5), color: yearColor }}
          >
            {y}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Logo + estrellas debajo (lo que iría en el navbar). */
function LogoConEstrellas({
  starSize = 12,
  color = GOLD,
  outlined = false,
  years = false,
}: {
  starSize?: number;
  color?: string;
  outlined?: boolean;
  years?: boolean;
}) {
  return (
    <div className="inline-flex flex-col items-center">
      <Image src="/images/logo.webp" alt="Russo Propiedades" width={160} height={48} className="h-12 w-auto" />
      <div className="mt-1">
        {years ? (
          <EstrellasAnios starSize={starSize} color={color} />
        ) : (
          <Estrellas size={starSize} color={color} outlined={outlined} />
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col items-center gap-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-widest font-bold text-gray-400">{title}</p>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <Link href="/lab/mundial" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-magenta">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-widest font-bold text-magenta">Lab · Mundial</p>
            <h1 className="font-display text-xl font-semibold text-navy">3 estrellas de campeón</h1>
          </div>
          <span className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* En contexto: barra blanca tipo navbar — versión elegida (con años) */}
        <section>
          <p className="text-sm text-gray-500 mb-3">
            <span className="font-semibold text-navy">Elegida</span> · con años, en el navbar (escala real):
          </p>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-2.5">
              <LogoConEstrellas starSize={12} years />
              <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-gray-600">
                <span>Ventas</span><span>Alquileres</span><span>Emprendimientos</span>
                <span>Barrios</span><span>Nosotros</span><span>Contacto</span>
              </nav>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-8 flex justify-center">
            <LogoConEstrellas starSize={20} years />
          </div>
        </section>

        {/* Variantes de estilo */}
        <section>
          <p className="text-sm text-gray-500 mb-3">Variantes de estilo (zoom):</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card title="Dorado lleno (recomendado)">
              <LogoConEstrellas starSize={16} color={GOLD} />
            </Card>
            <Card title="Dorado contorno">
              <LogoConEstrellas starSize={16} color={GOLD} outlined />
            </Card>
            <Card title="Celeste lleno">
              <LogoConEstrellas starSize={16} color={CELESTE} />
            </Card>
          </div>
        </section>

        {/* Sobre fondo oscuro (footer / hero) */}
        <section>
          <p className="text-sm text-gray-500 mb-3">Sobre fondo oscuro (footer):</p>
          <div className="rounded-2xl bg-navy p-10 flex items-center justify-center">
            <div className="inline-flex flex-col items-center">
              <Image src="/images/logo.webp" alt="Russo Propiedades" width={200} height={60} className="h-16 w-auto brightness-0 invert" />
              <div className="mt-1.5">
                <Estrellas size={18} color={GOLD} />
              </div>
            </div>
          </div>
        </section>

        {/* Con años · celeste (alternativa de color) */}
        <section>
          <p className="text-sm text-gray-500 mb-3">Con años, en celeste (alternativa):</p>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 flex justify-center">
            <LogoConEstrellas starSize={20} years color={CELESTE} />
          </div>
        </section>
      </div>
    </main>
  );
}
