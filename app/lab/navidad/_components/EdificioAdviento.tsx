"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, MapPin, Home, Lightbulb, Sparkles, Gift, BedDouble, Ruler } from "lucide-react";


export type PropAdviento = {
  id: string;
  title: string;
  locality: string;
  price: string;
  image?: string;
  rooms?: number;
  area?: number;
  operation: "venta" | "alquiler";
};

type Contenido =
  | { tipo: "prop"; titulo: string; prop: PropAdviento }
  | { tipo: "dato"; titulo: string; texto: string; cta?: { label: string; href: string } }
  | { tipo: "fiesta"; titulo: string; texto: string };

/**
 * Orden "salteado" de los números en la fachada, como en los calendarios de
 * Adviento de verdad (si no, es una grilla aburrida del 1 al 24).
 */
const FACHADA = [17, 3, 22, 9, 12, 6, 1, 19, 24, 14, 8, 20, 5, 11, 16, 2, 21, 7, 13, 23, 10, 18, 4, 15];

const DATOS: Record<number, Contenido> = {
  1: { tipo: "fiesta", titulo: "Arrancó diciembre", texto: "Cada día hasta Nochebuena se prende una ventana de este edificio: una propiedad elegida por el equipo, un dato útil o un saludo. Volvé mañana." },
  5: { tipo: "dato", titulo: "¿Te mudás en enero?", texto: "Pedí la mudanza de luz, gas e internet con un par de semanas de anticipación: en enero las empresas se atrasan y nadie quiere arrancar el año sin wifi.", cta: { label: "Ver alquileres", href: "/alquileres" } },
  8: { tipo: "fiesta", titulo: "Hoy se arma el arbolito 🎄", texto: "Feriado del 8: el día en que todo el país saca las cajas del placard. Que el del año que viene lo armes en casa nueva." },
  10: { tipo: "dato", titulo: "¿Vendés para comprar?", texto: "Muchas propiedades aceptan permuta: tu casa puede ser parte del pago de la próxima. Consultalo con el equipo.", cta: { label: "Hablar con el equipo", href: "/contacto" } },
  14: { tipo: "dato", titulo: "Apto crédito", texto: "Marcamos las propiedades que cumplen los requisitos del banco (escritura, planos y demás), así no perdés tiempo con las que no califican.", cta: { label: "Ver créditos", href: "/creditos" } },
  18: { tipo: "dato", titulo: "¿Cuánto vale tu casa?", texto: "Te la tasa una persona del equipo, que conoce la cuadra. Sin formularios eternos ni números inventados.", cta: { label: "Pedir tasación", href: "/tasaciones" } },
  20: { tipo: "dato", titulo: "Preguntale a Russia", texto: "Nuestra asistente conoce todas las propiedades publicadas. Probá: \"casa con patio en Ramos, hasta 3 ambientes\".", cta: { label: "Abrir Russia", href: "/russia" } },
  22: { tipo: "dato", titulo: "Alertas para las vacaciones", texto: "Guardá tu búsqueda y te avisamos por mail cuando entre algo que te sirva. Vos descansá.", cta: { label: "Crear alerta", href: "/alertas" } },
  24: { tipo: "fiesta", titulo: "¡Feliz Nochebuena!", texto: "Gracias por buscar casa con nosotros este año. Desde la oficina de Russo, que esta noche brindes rodeado de los tuyos. 🥂" },
};

function contenidoDelDia(dia: number, props: PropAdviento[]): Contenido {
  if (DATOS[dia]) return DATOS[dia];
  const diasProp = Array.from({ length: 24 }, (_, i) => i + 1).filter((d) => !DATOS[d]);
  const k = diasProp.indexOf(dia);
  const prop = props.length ? props[k % props.length] : undefined;
  if (prop) return { tipo: "prop", titulo: "La elegida de hoy", prop };
  return { tipo: "dato", titulo: "Ventana sorpresa", texto: "Acá va la propiedad del día que elige el equipo desde el admin." };
}

function IconoDia({ c, className }: { c: Contenido; className?: string }) {
  if (c.tipo === "prop") return <Home className={className} />;
  if (c.tipo === "fiesta") return <Gift className={className} />;
  return <Lightbulb className={className} />;
}

function Arbolito({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 52" className={className} aria-hidden="true">
      <path d="M20 4 L 31 20 L 26 20 L 35 33 L 28 33 L 38 46 L 2 46 L 12 33 L 5 33 L 14 20 L 9 20 Z" fill="#0f5132" />
      <rect x="17" y="46" width="6" height="5" fill="#7c4a1e" />
      <circle cx="15" cy="27" r="1.6" fill="#ff3fa4" /><circle cx="24" cy="31" r="1.6" fill="#fcd34d" />
      <circle cx="12" cy="40" r="1.6" fill="#fcd34d" /><circle cx="27" cy="41" r="1.6" fill="#ff3fa4" />
      <circle cx="20" cy="37" r="1.4" fill="#fff" />
      <path d="M20 0 L 21.4 3 L 24.6 3.3 L 22.2 5.4 L 22.9 8.5 L 20 6.9 L 17.1 8.5 L 17.8 5.4 L 15.4 3.3 L 18.6 3 Z" fill="#fcd34d" />
    </svg>
  );
}

/**
 * "El edificio de Adviento": una fachada de noche con 24 ventanas. Cada día
 * de diciembre se prende una; la de hoy late hasta que la abrís. Detrás de
 * cada ventana hay una propiedad elegida por el equipo (real, del feed), un
 * dato útil o un saludo. Ventanas futuras: cerradas, con el día en que se
 * abren. No hay otra inmobiliaria con algo así, y le da a la gente una
 * razón para volver todos los días de diciembre.
 */
export default function EdificioAdviento({ props, diaInicial }: { props: PropAdviento[]; diaInicial: number }) {
  const [hoy, setHoy] = useState(diaInicial);
  const [abiertas, setAbiertas] = useState<Set<number>>(() => new Set(Array.from({ length: diaInicial - 1 }, (_, i) => i + 1)));
  const [elegida, setElegida] = useState<number | null>(null);
  const [sacudida, setSacudida] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAbiertas(new Set(Array.from({ length: hoy - 1 }, (_, i) => i + 1)));
    setElegida(null);
  }, [hoy]);

  const abrir = (dia: number) => {
    if (dia > hoy) {
      setSacudida(dia);
      setTimeout(() => setSacudida(null), 600);
      return;
    }
    setAbiertas((s) => new Set(s).add(dia));
    setElegida(dia);
    if (window.innerWidth < 1024) setTimeout(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const c = elegida ? contenidoDelDia(elegida, props) : null;
  const estrellas = useMemo(
    () => Array.from({ length: 40 }, (_, i) => {
      const r = (n: number) => Math.abs(Math.sin(i * 91.7 + n) * 1e4) % 1;
      const f = (n: number) => Math.round(n * 100) / 100;
      return { l: f(r(1) * 100), t: f(r(2) * 60), s: f(1 + r(3) * 1.6), d: f(r(4) * 4) };
    }),
    [],
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-800 via-navy-700 to-navy-600 py-16 sm:py-20 text-white">
      {estrellas.map((e, i) => (
        <span key={i} aria-hidden="true" className="adv-estrella absolute rounded-full bg-white" style={{ left: `${e.l}%`, top: `${e.t}%`, width: e.s, height: e.s, animationDelay: `${e.d}s` }} />
      ))}
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16">
        {/* Copy + panel de la ventana abierta */}
        <div className="order-2 lg:order-1">
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            <span className="h-px w-8 bg-amber-300" aria-hidden="true" /> Calendario de Adviento
          </p>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Cada día de diciembre<br />se prende <span className="italic text-amber-300">una ventana.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
            Detrás de cada una hay una propiedad elegida por el equipo, un dato para tu mudanza o un saludo de la oficina. Hasta Nochebuena.
          </p>

          <div ref={panel} className="mt-8 min-h-[188px] max-w-md scroll-mt-32">
            {!c && (
              <button type="button" onClick={() => abrir(hoy)} className="group inline-flex items-center gap-3 rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-navy shadow-[0_10px_30px_-8px_rgba(252,211,77,0.6)] transition-transform hover:scale-[1.03]">
                <Sparkles className="h-4 w-4" /> Abrí la ventana de hoy · {hoy}/12
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {c && elegida && (
              <div key={elegida} className="adv-panel rounded-2xl bg-white p-4 text-navy shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-magenta">
                    <IconoDia c={c} className="h-3.5 w-3.5" /> {elegida} de diciembre · {c.titulo}
                  </p>
                  {elegida === hoy && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Hoy</span>}
                </div>
                {c.tipo === "prop" ? (
                  <Link href={`/propiedad/${c.prop.id}`} className="group flex gap-4">
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {c.prop.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.prop.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold capitalize text-navy">{c.prop.operation}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold leading-snug group-hover:text-magenta">{c.prop.title}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{c.prop.locality}</p>
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        {c.prop.rooms ? <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3" />{c.prop.rooms} amb.</span> : null}
                        {c.prop.area ? <span className="inline-flex items-center gap-1"><Ruler className="h-3 w-3" />{c.prop.area} m²</span> : null}
                      </div>
                      <p className="mt-1.5 font-display text-lg font-bold">{c.prop.price}</p>
                    </div>
                  </Link>
                ) : (
                  <>
                    <p className="text-[15px] leading-relaxed text-gray-600">{c.texto}</p>
                    {c.tipo === "dato" && c.cta && (
                      <Link href={c.cta.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-magenta hover:underline">
                        {c.cta.label} <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* El edificio */}
        <div className="order-1 mx-auto w-full max-w-[380px] lg:order-2">
          <div className="relative">
            {/* arbolito en la terraza */}
            <Arbolito className="absolute -top-[52px] right-8 h-[56px] w-[44px] drop-shadow-[0_0_12px_rgba(252,211,77,0.35)]" />
            {/* cornisa con lucecitas */}
            <div className="relative h-5 rounded-t-md bg-[#2a3466] shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]">
              <div className="absolute inset-x-2 -bottom-1.5 flex justify-between">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className="adv-luz block h-2 w-2 rounded-full" style={{ background: ["#fff4cf", "#fbbf24", "#ff3fa4"][i % 3], color: ["#fff4cf", "#fbbf24", "#ff3fa4"][i % 3], animationDelay: `${(i % 5) * 0.4}s` }} />
                ))}
              </div>
            </div>
            {/* fachada */}
            <div className="grid grid-cols-4 gap-3 border-x-4 border-[#2a3466] bg-[#202a5a] bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:12px_100%] px-4 pb-4 pt-6 sm:gap-4">
              {FACHADA.map((dia) => {
                const abierta = abiertas.has(dia);
                const esHoy = dia === hoy;
                const futura = dia > hoy;
                const cont = contenidoDelDia(dia, props);
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => abrir(dia)}
                    aria-label={futura ? `Ventana del ${dia}, se abre el ${dia} de diciembre` : `Abrir la ventana del ${dia} de diciembre`}
                    title={futura ? `Se abre el ${dia}/12` : undefined}
                    className={`adv-ventana group relative aspect-[3/4] rounded-t-[10px] border-[3px] border-[#3a4680] ${elegida === dia ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-[#202a5a]" : ""} ${sacudida === dia ? "adv-sacude" : ""} ${esHoy && !abierta ? "adv-hoy" : ""}`}
                  >
                    {/* interior */}
                    <span className={`absolute inset-0 overflow-hidden rounded-t-[7px] ${abierta || esHoy ? "bg-gradient-to-b from-amber-200 via-amber-300 to-orange-400" : "bg-[#141b3f]"}`}>
                      {abierta && <IconoDia c={cont} className="absolute bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 text-orange-900/60" />}
                    </span>
                    {/* postigos: se abren hacia los costados */}
                    {!abierta && (
                      <>
                        <span className={`adv-postigo left-0 origin-left rounded-tl-[7px] ${esHoy ? "bg-magenta" : "bg-[#2e3a75]"}`} />
                        <span className={`adv-postigo right-0 origin-right rounded-tr-[7px] ${esHoy ? "bg-magenta" : "bg-[#2e3a75]"}`} />
                      </>
                    )}
                    {abierta && (
                      <>
                        <span className="adv-postigo adv-abierto-i left-0 origin-left rounded-tl-[7px] bg-[#2e3a75]" />
                        <span className="adv-postigo adv-abierto-d right-0 origin-right rounded-tr-[7px] bg-[#2e3a75]" />
                      </>
                    )}
                    {/* número */}
                    <span className={`absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-lg font-bold sm:text-xl ${abierta ? "text-orange-950/80" : esHoy ? "text-white" : "text-white/45"}`}>{dia}</span>
                    {futura && <Lock className="absolute bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 text-white/25" />}
                    {/* repisa */}
                    <span className="absolute -bottom-[7px] -left-[5px] -right-[5px] h-[5px] rounded-sm bg-[#3a4680]" />
                  </button>
                );
              })}
            </div>
            {/* planta baja */}
            <div className="flex items-end justify-center gap-6 border-x-4 border-b-4 border-[#2a3466] bg-[#1b2350] px-4 pt-3">
              <span className="mb-3 hidden h-12 w-20 rounded-t-md bg-gradient-to-b from-amber-200/90 to-amber-400/80 sm:block" />
              <span className="relative h-[72px] w-16 rounded-t-[32px] border-[3px] border-[#3a4680] bg-[#7a1d3a]">
                {/* corona */}
                <span className="absolute left-1/2 top-3 h-7 w-7 -translate-x-1/2 rounded-full border-[5px] border-emerald-700 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
                  <span className="absolute -bottom-1.5 left-1/2 h-2 w-3 -translate-x-1/2 rounded-sm bg-magenta" />
                </span>
                <span className="absolute right-2 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-300" />
              </span>
              <span className="mb-3 hidden h-12 w-20 rounded-t-md bg-gradient-to-b from-amber-200/90 to-amber-400/80 sm:block" />
            </div>
            <div className="mx-auto h-2 w-[110%] -translate-x-[4.5%] rounded-full bg-black/30 blur-[2px]" />
          </div>
        </div>
      </div>

      {/* Control del lab: simular el día (no va en producción) */}
      <div className="relative mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-white/25 bg-white/5 px-4 py-3 text-xs text-white/70">
          <span className="font-bold uppercase tracking-widest text-amber-300">Solo en el lab</span>
          <label htmlFor="adv-dia">Simular que hoy es el</label>
          <input id="adv-dia" type="range" min={1} max={24} value={hoy} onChange={(e) => setHoy(Number(e.target.value))} className="w-40 accent-amber-300" />
          <span className="font-semibold tabular-nums text-white">{hoy} de diciembre</span>
        </div>
      </div>

      <style jsx>{`
        .adv-estrella { opacity: 0.6; animation: adv-titila 3.5s ease-in-out infinite; }
        @keyframes adv-titila { 0%, 100% { opacity: 0.7; } 50% { opacity: 0.15; } }
        .adv-luz { box-shadow: 0 0 8px 2px currentColor; animation: adv-luz 2.2s ease-in-out infinite; }
        @keyframes adv-luz { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        :global(.adv-postigo) { position: absolute; top: 0; bottom: 0; width: 50%; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); transition: transform 0.7s cubic-bezier(0.3, 1.3, 0.5, 1); }
        :global(.adv-abierto-i) { transform: perspective(200px) rotateY(-115deg); }
        :global(.adv-abierto-d) { transform: perspective(200px) rotateY(115deg); }
        .adv-ventana:hover :global(.adv-postigo:not(.adv-abierto-i):not(.adv-abierto-d)) { filter: brightness(1.2); }
        .adv-hoy { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0.7); animation: adv-late 1.8s ease-out infinite; }
        @keyframes adv-late { 0% { box-shadow: 0 0 0 0 rgba(252,211,77,0.75); } 100% { box-shadow: 0 0 0 14px rgba(252,211,77,0); } }
        .adv-sacude { animation: adv-sacude 0.5s ease-in-out; }
        @keyframes adv-sacude { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-4px); } 40%,80% { transform: translateX(4px); } }
        .adv-panel { animation: adv-panel 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
        @keyframes adv-panel { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .adv-estrella, .adv-luz, .adv-hoy, .adv-sacude, .adv-panel { animation: none; }
          :global(.adv-postigo) { transition: none; }
        }
      `}</style>
    </section>
  );
}

