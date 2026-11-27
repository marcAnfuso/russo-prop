/**
 * Rudolf: Russia versión reno. Gorro de Papá Noel entre las astas, bufanda a
 * rayas, cascabel en el collar con la chapita "IA" y la nariz roja que brilla
 * como un LED: la luz que guiaba el trineo de Papá Noel ahora te guía a casa.
 *
 * Usa las mismas clases que el robot (rb-*) para heredar sus animaciones:
 * pestañeo, cabeceo, saludo, punta del gorro y la luz que late (la nariz).
 */
export default function RenoSvg({ gesto, feliz }: { gesto: string; feliz: boolean }) {
  return (
    <svg viewBox="0 0 120 150" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="rn-piel" cx="45%" cy="35%" r="70%">
          <stop offset="0" stopColor="#b9773f" />
          <stop offset="1" stopColor="#7a4520" />
        </radialGradient>
        <radialGradient id="rn-nariz" cx="38%" cy="32%" r="65%">
          <stop offset="0" stopColor="#fecaca" />
          <stop offset="0.45" stopColor="#ef4444" />
          <stop offset="1" stopColor="#991b1b" />
        </radialGradient>
        <radialGradient id="rn-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f87171" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f87171" stopOpacity="0" />
        </radialGradient>
        <filter id="rn-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="60" cy="146" rx="30" ry="4" fill="#000" opacity="0.18" />

      {/* cuerpo */}
      <g className="rb-cuerpo">
        <path d="M44 138 L44 146 M76 138 L76 146" stroke="#7a4520" strokeWidth="8" strokeLinecap="round" />
        <path d="M44 144 L44 147 M76 144 L76 147" stroke="#3b2412" strokeWidth="8" strokeLinecap="round" />
        <g className="rb-brazo-i">
          <path d="M38 116 C 30 120, 27 126, 27 132" stroke="#8b5129" strokeWidth="8" strokeLinecap="round" fill="none" />
          <ellipse cx="27" cy="134" rx="4.5" ry="3.5" fill="#3b2412" />
        </g>
        {/* pata derecha: saluda */}
        <g className="rb-brazo-d">
          <path d="M82 114 C 92 110, 98 102, 100 94" stroke="#8b5129" strokeWidth="8" strokeLinecap="round" fill="none" />
          <ellipse cx="100.5" cy="91" rx="4.5" ry="3.8" fill="#3b2412" />
        </g>
        <ellipse cx="60" cy="122" rx="26" ry="22" fill="url(#rn-piel)" />
        <ellipse cx="60" cy="127" rx="15" ry="14" fill="#f1d6b0" />
        {/* bufanda */}
        <rect x="32" y="97" width="56" height="10" rx="5" fill="#dc2626" />
        <path d="M40 97 l-4 10 M50 97 l-4 10 M60 97 l-4 10 M70 97 l-4 10 M80 97 l-4 10" stroke="#fff" strokeWidth="3" />
        <g className="rb-bufanda">
          <path d="M74 104 L 80 124 L 72 125 L 68 106 Z" fill="#dc2626" />
          <path d="M71 110 l7 -1 M72.5 116 l7 -1" stroke="#fff" strokeWidth="2.5" />
        </g>
        {/* cascabel con chapita IA */}
        <circle cx="52" cy="112" r="5.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        <path d="M48 112 H56" stroke="#b45309" strokeWidth="1" />
        <circle cx="52" cy="115" r="1.2" fill="#92400e" />
        <rect x="58" y="108" width="15" height="10" rx="3" fill="#e6007e" />
        <text x="65.5" y="115.6" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">IA</text>
      </g>

      {/* cabeza */}
      <g className="rb-cabeza">
        {/* astas */}
        <g stroke="#c8914f" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M40 44 C 32 36, 22 30, 12 18" />
          <path d="M28 33 C 26 26, 24 22, 24 14" />
          <path d="M19 26 C 14 26, 9 28, 4 30" />
          <path d="M80 44 C 88 36, 98 30, 108 18" />
          <path d="M92 33 C 94 26, 96 22, 96 14" />
          <path d="M101 26 C 106 26, 111 28, 116 30" />
        </g>
        {/* orejas */}
        <path d="M30 56 C 18 52, 10 56, 6 62 C 14 66, 24 66, 32 62 Z" fill="#8b5129" />
        <path d="M27 58 C 19 56, 14 58, 11 61 C 16 63, 22 63, 27 61 Z" fill="#f5b5c8" />
        <path d="M90 56 C 102 52, 110 56, 114 62 C 106 66, 96 66, 88 62 Z" fill="#8b5129" />
        <path d="M93 58 C 101 56, 106 58, 109 61 C 104 63, 98 63, 93 61 Z" fill="#f5b5c8" />
        {/* cabeza y hocico */}
        <ellipse cx="60" cy="68" rx="32" ry="30" fill="url(#rn-piel)" />
        <ellipse cx="60" cy="86" rx="21" ry="14" fill="#e9c79c" />
        {/* ojos */}
        {feliz ? (
          <g stroke="#1a2251" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M41 63 Q 47 55, 53 63" />
            <path d="M67 63 Q 73 55, 79 63" />
          </g>
        ) : (
          <g className="rb-ojos">
            <ellipse cx="47" cy="61" rx="7" ry="8.5" fill="#fff" />
            <ellipse cx="73" cy="61" rx="7" ry="8.5" fill="#fff" />
            <circle cx="48.5" cy="62.5" r="4.4" fill="#1a2251" />
            <circle cx="71.5" cy="62.5" r="4.4" fill="#1a2251" />
            <circle cx="50" cy="60.5" r="1.6" fill="#fff" />
            <circle cx="73" cy="60.5" r="1.6" fill="#fff" />
          </g>
        )}
        <path d="M40 50 Q 46 47, 52 50 M68 50 Q 74 47, 80 50" stroke="#5c3317" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* cachetes */}
        <circle cx="35" cy="76" r="4" fill="#f472b6" opacity="0.55" />
        <circle cx="85" cy="76" r="4" fill="#f472b6" opacity="0.55" />
        {/* nariz-LED */}
        <circle className="rb-antena" cx="60" cy="79" r="15" fill="url(#rn-halo)" />
        <ellipse cx="60" cy="79" rx="9.5" ry="8" fill="url(#rn-nariz)" filter="url(#rn-glow)" />
        <ellipse cx="57" cy="76" rx="3" ry="2" fill="#fff" opacity="0.75" />
        {/* boca */}
        {gesto === "habla" || feliz ? (
          <ellipse className="rb-boca-habla" cx="60" cy="93" rx="6" ry="4" fill="#7f1d1d" />
        ) : (
          <path d="M52 91 Q 60 97, 68 91" stroke="#5c3317" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        )}

        {/* gorro de Papá Noel, entre las astas */}
        <g className="rb-gorro">
          <path d="M36 44 C 38 26, 52 14, 66 14 C 76 14, 84 24, 86 44 Z" fill="#dc2626" />
          <g className="rb-punta">
            <path d="M62 15 C 72 6, 86 4, 94 12 L 88 18 C 82 12, 74 13, 68 20 Z" fill="#dc2626" />
            <circle cx="93" cy="16" r="7" fill="#fff" />
          </g>
          <rect x="31" y="38" width="58" height="12" rx="6" fill="#fff" />
          <rect x="31" y="45" width="58" height="5" rx="2.5" fill="#e2e8f0" />
        </g>
      </g>
    </svg>
  );
}
