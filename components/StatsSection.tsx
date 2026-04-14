"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  decimal?: number;
  label: string;
  color: "magenta" | "navy";
}

const stats: Stat[] = [
  { target: 30, label: "años en zona oeste", color: "magenta" },
  { target: 2000, prefix: "+", label: "operaciones cerradas", color: "navy" },
  { target: 8, label: "barrios que conocemos", color: "magenta" },
  { target: 4.8, decimal: 1, label: "★ Google · 127 opiniones", color: "navy" },
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

  const colorClass = stat.color === "magenta" ? "text-magenta" : "text-navy";

  return (
    <span
      ref={ref}
      className={`font-display text-6xl lg:text-7xl font-semibold tabular-nums ${colorClass}`}
    >
      {stat.prefix ?? ""}
      {formatted}
      {stat.suffix ?? ""}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-gray-100 bg-gradient-to-b from-white via-gray-50/80 to-white py-24 px-4 sm:px-6 lg:px-8">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-magenta/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-navy/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Nuestros números
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy">
            Conocemos cada cuadra
            <br />
            <span className="italic text-gray-400">desde 1995</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 text-center">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 rounded-2xl p-6 transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(26,34,81,0.12)] hover:-translate-y-1"
            >
              <AnimatedNumber stat={stat} />
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
