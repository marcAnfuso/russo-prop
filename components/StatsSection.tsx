"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  decimal?: number;
  label: string;
}

const stats: Stat[] = [
  { target: 30, label: "años en zona oeste" },
  { target: 2000, prefix: "+", label: "operaciones cerradas" },
  { target: 8, label: "barrios que conocemos" },
  { target: 4.8, decimal: 1, label: "★ Google · 127 opiniones" },
];

function AnimatedNumber({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const duration = 1600;
            const start = performance.now();
            const step = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(stat.target * eased);
              if (t < 1) requestAnimationFrame(step);
              else setValue(stat.target);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [stat.target]);

  const formatted = (() => {
    if (stat.decimal && stat.decimal > 0) return value.toFixed(stat.decimal);
    if (stat.target >= 1000) return Math.floor(value).toLocaleString("es-AR");
    return Math.floor(value).toString();
  })();

  return (
    <span
      ref={ref}
      className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tabular-nums text-white"
    >
      {stat.prefix ?? ""}
      {formatted}
      {stat.suffix ?? ""}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-navy text-white py-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative gradient accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,126,0.18),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Nuestros números
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-white">
            Conocemos cada cuadra
            <br />
            <span className="italic text-white/50">desde 1995</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-3 text-center px-4 py-6 lg:px-8"
            >
              <AnimatedNumber stat={stat} />
              <span className="text-sm font-medium text-white/60">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="mt-14 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-white/20" />
          <span className="text-xs text-white/40 uppercase tracking-widest">
            Russo Propiedades
          </span>
          <span className="h-px w-12 bg-white/20" />
        </div>
      </div>
    </section>
  );
}
