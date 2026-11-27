"use client";

/**
 * Adornos del título del Hero para la Navidad:
 * - `GuirnaldaPino`: reemplaza el subrayado de "empieza acá" por una tira de
 *   ramitas de pino (como un arbolito, pero en guirnalda) con lucecitas,
 *   bolitas colgando y moños en las puntas. Se "desenrolla" al entrar.
 * - `TituloNavidad`: "Tu próximo hogar" con la botita navideña colgada de
 *   la r de "hogar". Se hamaca sola.
 */

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Guirnalda en un viewBox de 600 x 70; la tira cuelga con una comba suave.
const W = 600;
const yTira = (x: number) => 20 + Math.sin((x / W) * Math.PI) * 9;
const VERDES = ["#0f3d22", "#14532d", "#166534", "#15803d", "#1f9d4c"];
const AGUJAS = (() => {
  const porColor: string[] = VERDES.map(() => "");
  let i = 0;
  for (let x = 6; x <= W - 6; x += 2.2) {
    const y = yTira(x);
    for (let k = 0; k < 3; k++, i++) {
      const ang = (rnd(i, 1) - 0.5) * Math.PI * 1.7 + (k === 1 ? Math.PI : 0) + Math.PI / 2;
      const largo = 7 + rnd(i, 2) * 8;
      const x2 = x + Math.cos(ang) * largo;
      const y2 = y + Math.sin(ang) * largo * 0.9;
      const c = Math.floor(rnd(i, 3) * VERDES.length);
      porColor[c] += `M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
  }
  return porColor;
})();
const LUCES = Array.from({ length: 16 }, (_, i) => {
  const x = 26 + i * 36 + (rnd(i, 4) - 0.5) * 14;
  return { x: Math.round(x), y: Math.round(yTira(x) + (rnd(i, 5) - 0.5) * 10), c: ["#fde68a", "#ef4444", "#ffffff"][i % 3], d: (rnd(i, 6) * 1.6).toFixed(2) };
});
const COLGANTES = [
  { x: 150, largo: 16, c: "#dc2626" },
  { x: 300, largo: 24, c: "#fbbf24" },
  { x: 450, largo: 16, c: "#ffffff" },
];

export function GuirnaldaPino() {
  return (
    <>
      <span aria-hidden="true" className="gp-tira pointer-events-none absolute -bottom-[0.66em] -left-[0.28em] -right-[0.28em] block h-[0.86em]">
        <svg viewBox={`0 0 ${W} 70`} preserveAspectRatio="none" className="h-full w-full overflow-visible drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]">
          <path d={`M6 ${yTira(6)} Q ${W / 2} ${20 + 18}, ${W - 6} ${yTira(W - 6)}`} stroke="#0b2e19" strokeWidth="6" fill="none" strokeLinecap="round" />
          {AGUJAS.map((d, i) => (
            <path key={i} d={d} stroke={VERDES[i]} strokeWidth="2.1" strokeLinecap="round" fill="none" />
          ))}
          {COLGANTES.map((b) => {
            const y = yTira(b.x);
            return (
              <g key={b.x} className="gp-hamaca" style={{ transformOrigin: `${b.x}px ${y}px` }}>
                <line x1={b.x} y1={y} x2={b.x} y2={y + b.largo} stroke="#fcd34d" strokeWidth="1.5" />
                <rect x={b.x - 3} y={y + b.largo - 2} width="6" height="4" rx="1" fill="#d4a017" />
                <circle cx={b.x} cy={y + b.largo + 9} r="9" fill={b.c} stroke={b.c === "#ffffff" ? "#e5e7eb" : "none"} />
                <ellipse cx={b.x - 3} cy={y + b.largo + 6} rx="2.6" ry="2" fill="#fff" opacity="0.8" />
              </g>
            );
          })}
          {LUCES.map((l, i) => (
            <g key={i} className="gp-luz" style={{ animationDelay: `${l.d}s` }}>
              <circle cx={l.x} cy={l.y} r="7" fill={l.c} opacity="0.35" />
              <circle cx={l.x} cy={l.y} r="3" fill={l.c} />
            </g>
          ))}
          {/* moños en las puntas */}
          {[8, W - 8].map((x) => (
            <g key={x} transform={`translate(${x} ${yTira(x)})`}>
              <path d="M0 0 C -9 -12, -22 -9, -18 2 C -15 8, -7 5, 0 0 Z M0 0 C 9 -12, 22 -9, 18 2 C 15 8, 7 5, 0 0 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
              <path d="M-2 2 L-8 18 M2 2 L8 18" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
              <circle r="4.5" fill="#b91c1c" />
            </g>
          ))}
        </svg>
      </span>
      <EstilosAdornosTitulo />
    </>
  );
}

function Botita() {
  return (
    <svg viewBox="0 0 44 60" className="h-full w-full overflow-visible drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)]">
      {/* cordón */}
      <path d="M14 0 C 10 4, 10 8, 14 10" stroke="#fcd34d" strokeWidth="1.6" fill="none" />
      {/* bastón de caramelo que asoma */}
      <path d="M30 18 V4 C 30 -2, 38 -2, 38 4" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M30 18 V4 C 30 -2, 38 -2, 38 4" stroke="#dc2626" strokeWidth="4" fill="none" strokeDasharray="3 3" />
      {/* bota */}
      <path d="M8 14 L30 14 L30 36 C 30 40, 32 42, 36 43 C 42 45, 44 50, 40 55 C 37 58, 30 58, 24 57 L14 55 C 8 54, 6 50, 6 44 Z" fill="#dc2626" />
      <path d="M24 57 C 30 58, 37 58, 40 55 C 43 51, 42 47, 38 44 C 34 47, 30 52, 24 57 Z" fill="#fff" />
      <path d="M6 44 C 6 50, 8 54, 14 55 C 16 50, 14 46, 6 44 Z" fill="#fff" opacity="0.95" />
      <circle cx="18" cy="32" r="2.2" fill="#fbbf24" />
      <circle cx="13" cy="40" r="1.8" fill="#fff" opacity="0.8" />
      <circle cx="23" cy="44" r="1.8" fill="#fbbf24" />
      {/* puño de peluche */}
      <rect x="5" y="9" width="28" height="10" rx="5" fill="#fff" />
      <rect x="5" y="15" width="28" height="4" rx="2" fill="#e2e8f0" />
    </svg>
  );
}

export function TituloNavidad() {
  return (
    <>
      Tu{" "}
      próximo{" "}
      <span className="relative inline-block">
        <span className="relative">hogar</span>
        {/* la botita colgada de la r */}
        <span aria-hidden="true" className="tn-hamaca pointer-events-none absolute right-[-0.7em] top-[0.16em] block h-[0.98em] w-[0.72em]" style={{ animationDelay: "0.5s" }}>
          <Botita />
        </span>
      </span>
      <EstilosAdornosTitulo />
    </>
  );
}

function EstilosAdornosTitulo() {
  return (
    <style jsx global>{`
      .gp-tira { clip-path: inset(-60% 100% -200% 0); animation: gp-desenrolla 1.3s cubic-bezier(0.6, 0, 0.3, 1) 0.5s forwards; }
      @keyframes gp-desenrolla { to { clip-path: inset(-60% -5% -200% -5%); } }
      .gp-luz { animation: gp-titila 1.6s ease-in-out infinite; }
      @keyframes gp-titila { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      .gp-hamaca { transform-box: view-box; animation: gp-hamaca 3s ease-in-out infinite; }
      @keyframes gp-hamaca { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }
      .tn-hamaca { transform-origin: 50% 0; animation: tn-cae 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s both, tn-hamaca 3.2s ease-in-out 1.9s infinite; }
      @keyframes tn-cae { from { transform: translateY(-0.6em); opacity: 0; } to { transform: none; opacity: 1; } }
      @keyframes tn-hamaca { 0%, 100% { transform: rotate(6deg); } 50% { transform: rotate(-6deg); } }
      @media (prefers-reduced-motion: reduce) {
        .gp-tira { animation: none; clip-path: none; }
        .gp-luz, .gp-hamaca, .tn-hamaca { animation: none; }
      }
    `}</style>
  );
}
