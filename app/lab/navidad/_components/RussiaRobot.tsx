"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cascabeles, joJoJo, melodia } from "./sonidos";
import { EVENTO_TRINEO } from "./Trineo";
import RenoSvg from "./RenoSvg";
import { useArranque } from "./useArranque";

export const EVENTO_BOLITA = "russo:bolita";

type Gesto = "quieto" | "salta" | "baila" | "habla";

/**
 * Russia, versión robot navideño: cabeza de robot con pantalla, ojos LED
 * que pestañean, gorro de Papá Noel con pompón, bufanda a rayas y una
 * antena con lucecita roja (como la nariz de un reno). Reemplaza al FAB.
 *
 * - Entra saltando desde abajo y dice "¡Jo, jo, jo!" en el globito.
 * - Si lo tocás: salta, suenan cascabeles y dice "¡Jo, jo, jo!" con voz.
 * - Lleva la cuenta de la búsqueda de bolitas doradas escondidas en la
 *   página (escucha el evento `russo:bolita`) y festeja al completarla.
 */
function Robot({ gesto, feliz }: { gesto: Gesto; feliz: boolean }) {
  return (
    <svg viewBox="0 0 120 150" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="rb-cabeza" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9dcef" />
        </linearGradient>
        <linearGradient id="rb-pantalla" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#25306e" />
          <stop offset="1" stopColor="#0e1229" />
        </linearGradient>
        <radialGradient id="rb-luz" cx="40%" cy="35%" r="60%">
          <stop offset="0" stopColor="#fecaca" />
          <stop offset="0.5" stopColor="#ef4444" />
          <stop offset="1" stopColor="#991b1b" />
        </radialGradient>
        <filter id="rb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* sombra en el piso */}
      <ellipse cx="60" cy="146" rx="30" ry="4" fill="#000" opacity="0.18" className="rb-sombra" />

      {/* cuerpo */}
      <g className="rb-cuerpo">
        {/* brazo izquierdo con campanita */}
        <g className="rb-brazo-i">
          <path d="M36 112 C 26 114, 22 120, 22 127" stroke="#c7cbe4" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="129" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="22" cy="132.5" r="1.4" fill="#92400e" />
        </g>
        {/* brazo derecho: saluda */}
        <g className="rb-brazo-d">
          <path d="M84 112 C 94 108, 99 100, 100 92" stroke="#c7cbe4" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="100" cy="89" r="5.5" fill="#fff" stroke="#c7cbe4" strokeWidth="1.5" />
        </g>
        <rect x="34" y="102" width="52" height="38" rx="14" fill="url(#rb-cabeza)" stroke="#c7cbe4" strokeWidth="1.5" />
        {/* corazón magenta en el pecho */}
        <path className="rb-corazon" d="M60 128 C 50 121, 51 113, 56 113 C 58.5 113, 60 115, 60 116.5 C 60 115, 61.5 113, 64 113 C 69 113, 70 121, 60 128 Z" fill="#e6007e" filter="url(#rb-glow)" />
        {/* bufanda a rayas */}
        <g>
          <rect x="30" y="97" width="60" height="10" rx="5" fill="#dc2626" />
          <path d="M38 97 l-4 10 M48 97 l-4 10 M58 97 l-4 10 M68 97 l-4 10 M78 97 l-4 10 M88 97 l-4 10" stroke="#fff" strokeWidth="3" />
          <g className="rb-bufanda">
            <path d="M74 104 L 80 124 L 72 125 L 68 106 Z" fill="#dc2626" />
            <path d="M71 110 l7 -1 M72.5 116 l7 -1" stroke="#fff" strokeWidth="2.5" />
            <path d="M72 125 l1 4 M75 125 l1 4 M78 124.5 l1 4" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* cabeza */}
      <g className="rb-cabeza">
        {/* antena con luz roja */}
        <path d="M12 70 C 4 69, 0 64, 1 58" stroke="#9aa0c8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle className="rb-antena" cx="1" cy="55" r="5.5" fill="url(#rb-luz)" filter="url(#rb-glow)" />
        {/* orejas */}
        <rect x="12" y="58" width="10" height="20" rx="4" fill="#c7cbe4" />
        <rect x="98" y="58" width="10" height="20" rx="4" fill="#c7cbe4" />
        <rect x="18" y="36" width="84" height="66" rx="24" fill="url(#rb-cabeza)" stroke="#c7cbe4" strokeWidth="1.5" />
        {/* pantalla */}
        <rect x="27" y="50" width="66" height="42" rx="15" fill="url(#rb-pantalla)" />
        <path d="M33 55 Q 60 50, 86 55" stroke="#fff" strokeOpacity="0.12" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* ojos */}
        {feliz ? (
          <g stroke="#a5f3fc" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#rb-glow)">
            <path d="M40 70 Q 46 62, 52 70" />
            <path d="M68 70 Q 74 62, 80 70" />
          </g>
        ) : (
          <g className="rb-ojos" fill="#a5f3fc" filter="url(#rb-glow)">
            <rect x="40" y="62" width="11" height="13" rx="5.5" />
            <rect x="69" y="62" width="11" height="13" rx="5.5" />
            <circle cx="47.5" cy="65.5" r="2" fill="#fff" />
            <circle cx="76.5" cy="65.5" r="2" fill="#fff" />
          </g>
        )}
        {/* cachetes */}
        <circle cx="35.5" cy="80" r="3.5" fill="#f472b6" opacity="0.7" />
        <circle cx="84.5" cy="80" r="3.5" fill="#f472b6" opacity="0.7" />
        {/* boca: sonrisa, o abierta cuando habla */}
        {gesto === "habla" || feliz ? (
          <ellipse className="rb-boca-habla" cx="60" cy="82" rx="7" ry="4.5" fill="#e6007e" filter="url(#rb-glow)" />
        ) : (
          <path d="M52 80 Q 60 87, 68 80" stroke="#e6007e" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#rb-glow)" />
        )}

        {/* gorro de Papá Noel */}
        <g className="rb-gorro">
          <path d="M20 44 C 22 22, 44 6, 70 8 C 86 9, 96 20, 99 30 C 101 36, 101 41, 100 44 Z" fill="#dc2626" />
          <path d="M70 8 C 86 9, 96 20, 99 30 L 92 40 C 90 26, 82 16, 68 12 Z" fill="#991b1b" opacity="0.35" />
          <g className="rb-punta">
            <path d="M72 9 C 88 4, 104 8, 112 24 L 104 28 C 100 18, 90 14, 78 16 Z" fill="#dc2626" />
            <circle cx="110" cy="29" r="8" fill="#fff" />
            <circle cx="107.5" cy="26.5" r="2.6" fill="#f1f5f9" />
          </g>
          <rect x="13" y="36" width="94" height="15" rx="7.5" fill="#fff" />
          <rect x="13" y="45" width="94" height="6" rx="3" fill="#e2e8f0" />
        </g>
      </g>
    </svg>
  );
}

const CONFETI = ["#e6007e", "#fbbf24", "#ffffff", "#dc2626", "#7dd3fc", "#16a34a"];

type Globo = { titulo: string; texto?: string };
const TEXTOS: Record<"robot" | "reno", { hola: Globo; presenta: Globo | null; trineo: Globo | null; toque: Globo | null; aria: string }> = {
  robot: {
    hola: { titulo: "¡Jo, jo, jo! 🎅" },
    presenta: { titulo: "¡Jo, jo, jo! 🎅", texto: "Soy Russia, versión navideña. ¿Buscamos casa para estrenar en 2027?" },
    trineo: { titulo: "¡Mirá arriba! 🦌", texto: "Está llegando la Navidad…" },
    toque: { titulo: "¡Jo, jo, jo! 🎅", texto: "¿En qué barrio buscás? Preguntame lo que quieras." },
    aria: "Russia navideña: tocala",
  },
  reno: {
    hola: { titulo: "Hola, soy Rudolf 🦌", texto: "El asistente navideño de Russo. Contame qué buscás y te encuentro propiedades." },
    presenta: null,
    trineo: null,
    toque: null,
    aria: "Abrir Rudolf, el asistente navideño de Russo",
  },
};

export default function RussiaRobot({ totalBolitas = 5, variante = "robot", esperar }: { totalBolitas?: number; variante?: "robot" | "reno"; esperar?: string }) {
  const tx = TEXTOS[variante];
  const listo = useArranque(esperar);
  const [visible, setVisible] = useState(false);
  const [gesto, setGesto] = useState<Gesto>("quieto");
  const [feliz, setFeliz] = useState(false);
  const [globo, setGlobo] = useState<{ titulo: string; texto?: string } | null>(null);
  const [encontradas, setEncontradas] = useState<Set<string>>(new Set());
  const [confeti, setConfeti] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const despues = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };
  const gestoBreve = useCallback((g: Gesto, ms = 900) => {
    setGesto(g);
    timers.current.push(setTimeout(() => setGesto("quieto"), ms));
  }, []);

  // Entrada: aparece saltando y saluda; después propone la búsqueda.
  useEffect(() => {
    if (!listo) return;
    despues(900, () => { setVisible(true); gestoBreve("salta", 700); });
    despues(1500, () => { setGlobo(tx.hola); gestoBreve("habla", 1400); });
    if (tx.presenta) { const p = tx.presenta; despues(9500, () => setGlobo(p)); }
    if (variante === "robot") despues(15000, () => setGlobo((g) => g && { titulo: "Psst… 🤫", texto: `Escondí ${totalBolitas} bolitas doradas en esta página. ¿Las encontrás?` }));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [gestoBreve, totalBolitas, listo, tx, variante]);

  // Cuando pasa el trineo, Russia avisa y lo sigue con la mirada.
  useEffect(() => {
    const onTrineo = () => {
      if (tx.trineo) setGlobo(tx.trineo);
      setFeliz(true);
      gestoBreve("salta", 700);
      timers.current.push(setTimeout(() => setFeliz(false), 2500));
    };
    window.addEventListener(EVENTO_TRINEO, onTrineo);
    return () => window.removeEventListener(EVENTO_TRINEO, onTrineo);
  }, [gestoBreve, tx]);

  // Búsqueda de bolitas
  useEffect(() => {
    const onBolita = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setEncontradas((prev) => {
        if (prev.has(id)) return prev;
        const s = new Set(prev).add(id);
        if (s.size >= totalBolitas) {
          setGlobo({ titulo: "¡JO, JO, JO! 🎉", texto: "¡Las encontraste todas! Gracias por jugar, de parte de todo el equipo de Russo." });
          setFeliz(true);
          setGesto("baila");
          setConfeti((n) => n + 1);
          melodia();
          timers.current.push(setTimeout(() => { setGesto("quieto"); setFeliz(false); }, 4200));
        } else {
          setGlobo({ titulo: `¡Bien! ${s.size} de ${totalBolitas} 🎄`, texto: totalBolitas - s.size === 1 ? "¡Te falta una sola!" : "Seguí buscando: hay en las cards y en lugares raros." });
          setGesto("salta");
          timers.current.push(setTimeout(() => setGesto("quieto"), 700));
        }
        return s;
      });
    };
    window.addEventListener(EVENTO_BOLITA, onBolita);
    return () => window.removeEventListener(EVENTO_BOLITA, onBolita);
  }, [totalBolitas]);

  const tocar = () => {
    if (variante === "reno") {
      // Funciona como el botón de Russia de siempre: abre el chat.
      gestoBreve("salta", 700);
      setGlobo(null);
      window.dispatchEvent(new CustomEvent("russia:open", { detail: { persona: "rudolf" } }));
      return;
    }
    cascabeles();
    joJoJo();
    setFeliz(true);
    gestoBreve("salta", 700);
    setGlobo((g) => g ?? tx.toque ?? null);
    timers.current.push(setTimeout(() => setFeliz(false), 1600));
  };

  return (
    <div className={`fixed bottom-3 left-3 z-40 flex items-end gap-2 sm:bottom-5 sm:left-5 ${visible ? "rb-entra" : "translate-y-[140%]"}`}>
      <button type="button" onClick={tocar} aria-label={tx.aria} className={`rb-${gesto} relative h-[100px] w-[80px] shrink-0 cursor-pointer sm:h-[150px] sm:w-[120px]`}>
        {variante === "reno" ? <RenoSvg gesto={gesto} feliz={feliz} /> : <Robot gesto={gesto} feliz={feliz} />}
        {encontradas.size > 0 && (
          <span className="absolute -right-1 top-6 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-navy shadow ring-2 ring-white">
            {encontradas.size}/{totalBolitas}
          </span>
        )}
      </button>
      {variante === "reno" && !globo && (
        <button type="button" onClick={tocar} className="mb-5 hidden items-center gap-1 rounded-full bg-white/95 px-3.5 py-1.5 text-[12px] font-bold text-navy shadow-[0_6px_18px_-6px_rgba(26,34,81,0.25)] ring-1 ring-gray-100 backdrop-blur hover:bg-white md:inline-flex sm:mb-8">
          Rudolf <span className="text-magenta">·</span> <span className="font-semibold text-gray-500">preguntale</span>
        </button>
      )}
      {globo && (
        <div key={globo.titulo + (globo.texto ?? "")} className="rb-globo relative mb-14 max-w-[210px] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-navy shadow-[0_14px_34px_-10px_rgba(26,34,81,0.45)] ring-1 ring-gray-100 sm:mb-24 sm:max-w-[260px]">
          <button type="button" onClick={() => setGlobo(null)} aria-label="Cerrar" className="absolute right-1.5 top-1.5 rounded p-0.5 text-gray-300 hover:text-gray-500"><X className="h-3 w-3" /></button>
          <p className="pr-3 font-display text-[17px] font-bold leading-tight text-magenta">{globo.titulo}</p>
          {globo.texto && <p className="mt-1 text-[12.5px] leading-snug text-gray-600">{globo.texto}</p>}
        </div>
      )}
      {confeti > 0 && (
        <div key={confeti} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 90 }).map((_, i) => {
            const r = (n: number) => Math.abs(Math.sin(i * 77.3 + n * 13.1 + confeti)) % 1;
            return (
              <span
                key={i}
                className="rb-confeti absolute bottom-24 left-16 block"
                style={{
                  background: CONFETI[i % CONFETI.length],
                  width: 6 + r(1) * 6,
                  height: 4 + r(2) * 8,
                  borderRadius: i % 3 === 0 ? 999 : 2,
                  "--dx": `${(r(3) * 2 - 0.3) * 70}vw`,
                  "--dy": `${-40 - r(4) * 55}vh`,
                  "--rot": `${r(5) * 900}deg`,
                  animationDelay: `${r(6) * 0.25}s`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}
      <style jsx global>{`
        /* Solo en el lab: escondemos el FAB real de Russia */
        button[aria-label="Abrir Russia, asistente IA"], div.animate-russia-fade { display: none !important; }

        .rb-entra { animation: rb-entra 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes rb-entra { from { transform: translateY(140%); } to { transform: none; } }

        .rb-ojos { transform-box: fill-box; transform-origin: center; animation: rb-pestanea 4s ease-in-out 1.5s infinite; }
        @keyframes rb-pestanea { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        .rb-antena { animation: rb-antena 1.6s ease-in-out infinite; }
        @keyframes rb-antena { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .rb-corazon { transform-box: fill-box; transform-origin: center; animation: rb-latido 1.4s ease-in-out infinite; }
        @keyframes rb-latido { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.18); } 30% { transform: scale(1); } 45% { transform: scale(1.1); } }
        .rb-brazo-d { transform-box: view-box; transform-origin: 84px 112px; animation: rb-saluda 2.8s ease-in-out infinite; }
        @keyframes rb-saluda { 0%, 55%, 100% { transform: rotate(0); } 65% { transform: rotate(-18deg); } 75% { transform: rotate(8deg); } 85% { transform: rotate(-18deg); } }
        .rb-punta { transform-box: view-box; transform-origin: 76px 12px; animation: rb-punta 3.2s ease-in-out infinite; }
        @keyframes rb-punta { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(10deg); } }
        .rb-bufanda { transform-box: view-box; transform-origin: 72px 104px; animation: rb-punta 2.6s ease-in-out infinite; }
        .rb-cabeza { transform-box: view-box; transform-origin: 60px 100px; animation: rb-cabecea 5s ease-in-out infinite; }
        @keyframes rb-cabecea { 0%, 100% { transform: rotate(0); } 30% { transform: rotate(-4deg); } 60% { transform: rotate(3deg); } }
        .rb-boca-habla { transform-box: fill-box; transform-origin: center; animation: rb-habla 0.22s ease-in-out infinite alternate; }
        @keyframes rb-habla { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }

        .rb-salta { animation: rb-salta 0.7s cubic-bezier(0.3, 0, 0.3, 1); }
        @keyframes rb-salta { 0%, 100% { transform: translateY(0) scale(1, 1); } 15% { transform: translateY(0) scale(1.08, 0.9); } 45% { transform: translateY(-26px) scale(0.95, 1.06); } 75% { transform: translateY(0) scale(1.06, 0.94); } }
        .rb-baila { animation: rb-baila 0.6s ease-in-out infinite; }
        @keyframes rb-baila { 0%, 100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(8deg) translateY(-10px); } }

        .rb-globo { transform-origin: bottom left; animation: rb-globo 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes rb-globo { from { opacity: 0; transform: scale(0.6) translateY(8px); } to { opacity: 1; transform: none; } }

        .rb-confeti { animation: rb-confeti 2.6s cubic-bezier(0.2, 0.6, 0.4, 1) forwards; }
        @keyframes rb-confeti {
          0% { transform: translate(0, 0) rotate(0); opacity: 1; }
          55% { transform: translate(calc(var(--dx) * 0.7), var(--dy)) rotate(calc(var(--rot) * 0.6)); opacity: 1; }
          100% { transform: translate(var(--dx), calc(var(--dy) * 0.2 + 30vh)) rotate(var(--rot)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rb-entra, .rb-ojos, .rb-antena, .rb-corazon, .rb-brazo-d, .rb-punta, .rb-bufanda, .rb-cabeza, .rb-boca-habla, .rb-salta, .rb-baila, .rb-globo, .rb-confeti { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
