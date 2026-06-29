"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = ["#75AADB", "#FFFFFF", "#75AADB", "#FFFFFF", "#F6B40E"]; // celeste, blanco, sol mayo

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  drift: number;
};

function makePieces(count: number, seed = 0): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const r = Math.sin((i + 1) * 9301 + seed) * 233280;
    const rand = (n: number) => Math.abs((r * (n + 1)) % 1);
    return {
      id: i,
      left: rand(1) * 100,
      delay: rand(2) * 2.5,
      duration: 3.5 + rand(3) * 2.5,
      color: COLORS[i % COLORS.length],
      size: 6 + rand(4) * 8,
      rotate: rand(5) * 360,
      drift: (rand(6) - 0.5) * 200,
    };
  });
}

/**
 * Lluvia sutil de papelitos celeste/blanco. Dispara al montar y se apaga sola
 * tras `duration` ms. Para re-disparar, remontar con una `key` distinta.
 */
export default function MundialConfetti({
  count = 60,
  duration = 6000,
}: {
  count?: number;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);
  const pieces = useMemo(() => makePieces(count), [count]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[55] overflow-hidden"
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="mundial-confetti-piece absolute -top-10 rounded-sm"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.45}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ["--drift" as string]: `${p.drift}px`,
              ["--rot" as string]: `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        @keyframes mundial-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), 110vh, 0) rotate(var(--rot));
            opacity: 0.9;
          }
        }
        :global(.mundial-confetti-piece) {
          animation-name: mundial-fall;
          animation-timing-function: cubic-bezier(0.25, 0.1, 0.4, 1);
          animation-fill-mode: forwards;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.mundial-confetti-piece) {
            animation: none !important;
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
