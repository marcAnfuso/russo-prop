"use client";

import RussiaFabDemo from "./RussiaFabDemo";

/**
 * Russia con cara pintada — dos rayitas celestes "como mejilla" sobre el FAB.
 * El FAB no tiene cara, así que las rayas van como "warrior paint" diagonal
 * sobre el icono central.
 */
export default function RussiaFabPintura() {
  return (
    <RussiaFabDemo>
      <svg
        aria-hidden="true"
        viewBox="0 0 56 56"
        className="absolute inset-0 w-14 h-14 pointer-events-none"
      >
        {/* Rayita izquierda */}
        <rect
          x="8"
          y="32"
          width="14"
          height="3.5"
          rx="2"
          fill="#75AADB"
          transform="rotate(-12 15 33.75)"
          opacity="0.95"
        />
        {/* Rayita derecha */}
        <rect
          x="34"
          y="32"
          width="14"
          height="3.5"
          rx="2"
          fill="#75AADB"
          transform="rotate(12 41 33.75)"
          opacity="0.95"
        />
      </svg>
    </RussiaFabDemo>
  );
}
