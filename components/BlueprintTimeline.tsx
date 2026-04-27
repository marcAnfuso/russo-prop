"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export type TimelineCity = "sj" | "rm";

export interface TimelineItem {
  year: string;
  title: string;
  text: string;
  city: TimelineCity;
}

interface Props {
  items: TimelineItem[];
}

const CITY_LABEL: Record<TimelineCity, string> = {
  sj: "San Justo",
  rm: "Ramos Mejía",
};
const CITY_COLOR: Record<TimelineCity, string> = {
  sj: "#e6007e",
  rm: "#3b82f6",
};

/**
 * Timeline tipo "blueprint arquitectónico" — fondo azul papel con grid,
 * edificios técnicos blancos que se dibujan on-scroll. Cada hito tiene
 * su altura creciente (monotónica, metáfora de crecimiento) y su tag
 * de barrio arriba.
 */
export default function BlueprintTimeline({ items }: Props) {
  // Alturas estrictamente crecientes: cada hito más alto que el anterior.
  const baseHeight = 90;
  const stepHeight = (260 - baseHeight) / Math.max(1, items.length - 1);
  const heights = items.map((_, i) => Math.round(baseHeight + i * stepHeight));

  const slotWidth = 150;
  const totalWidth = 80 + items.length * slotWidth;

  // Puntos del "top" de cada edificio, donde vive el año. Se conectan
  // con una línea magenta que se va dibujando on-scroll.
  const topPoints = items.map((_, i) => ({
    x: 60 + i * slotWidth,
    y: 300 - heights[i],
  }));
  const pinOffset = 12; // px por encima de la cima del edificio
  const journeyD = topPoints.reduce(
    (acc, p, i) =>
      acc + (i === 0 ? `M ${p.x} ${p.y - pinOffset}` : ` L ${p.x} ${p.y - pinOffset}`),
    ""
  );

  return (
    <section className="relative overflow-hidden py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      {/* Grid pattern — sutil sobre fondo claro */}
      <div
        className="absolute inset-0 opacity-100 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,34,81,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(26,34,81,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Nuestra historia
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy">
            Más de 30 años{" "}
            <span className="italic text-magenta">construyendo confianza</span>.
          </h2>
        </div>

        {/* Skyline SVG · sólo desktop. En mobile lo reemplazamos por un
            stack vertical de cards (más legible y la animación on-scroll
            funciona bien en Safari iOS sin overflow horizontal). */}
        <div className="hidden md:block overflow-x-auto pb-2">
          <svg
            viewBox={`0 -60 ${totalWidth} 400`}
            className="w-full"
            style={{ minWidth: Math.max(totalWidth * 0.8, 600) }}
          >
            {/* Ground line — línea sólida gruesa que ancla los edificios */}
            <line
              x1="0"
              y1="300"
              x2={totalWidth}
              y2="300"
              stroke="#1a2251"
              strokeWidth="2.5"
            />
            {/* Hatching fino debajo del suelo — apenas 6px de alto, no
                invade la zona de labels. Típico del tipo arquitectónico. */}
            <g stroke="rgba(26,34,81,0.4)" strokeWidth="0.5">
              {Array.from({ length: Math.ceil(totalWidth / 8) }).map((_, i) => (
                <line
                  key={i}
                  x1={i * 8}
                  y1="301"
                  x2={i * 8 - 5}
                  y2="307"
                />
              ))}
            </g>
            {/* Ticks de medición */}
            <g stroke="rgba(26,34,81,0.35)" strokeWidth="0.6" fill="none">
              {items.map((_, i) => {
                const x = 60 + i * slotWidth;
                return (
                  <g key={i}>
                    <line x1={x - 40} y1="296" x2={x - 40} y2="300" />
                    <line x1={x + 40} y1="296" x2={x + 40} y2="300" />
                  </g>
                );
              })}
            </g>


            {items.map((t, i) => {
              const h = heights[i];
              const x = 60 + i * slotWidth;
              return (
                <g key={t.year}>
                  {/* Rectángulo edificio */}
                  <motion.rect
                    x={x - 35}
                    y={300 - h}
                    width={70}
                    height={h}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, delay: i * 0.15 }}
                    fill="transparent"
                    stroke="#1a2251"
                    strokeWidth="2"
                  />
                  {/* Líneas de pisos (horizontales) */}
                  {Array.from({ length: Math.floor(h / 22) }).map((_, f) => (
                    <motion.line
                      key={`hf-${f}`}
                      x1={x - 32}
                      y1={300 - (f + 1) * 22}
                      x2={x + 32}
                      y2={300 - (f + 1) * 22}
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.15 + 0.4 + f * 0.04,
                      }}
                      stroke="rgba(26,34,81,0.35)"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                  ))}
                  {/* Divisores verticales — arma grilla de ventanas */}
                  <motion.line
                    x1={x - 11}
                    y1={300 - h + 6}
                    x2={x - 11}
                    y2={300 - 28}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: i * 0.15 + 0.65 }}
                    stroke="rgba(26,34,81,0.35)"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                  <motion.line
                    x1={x + 11}
                    y1={300 - h + 6}
                    x2={x + 11}
                    y2={300 - 28}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: i * 0.15 + 0.7 }}
                    stroke="rgba(26,34,81,0.35)"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                  {/* Ventana destacada en el primer piso (más visible) —
                      rellena con el color del barrio, sutil */}
                  <motion.rect
                    x={x - 8}
                    y={300 - 22}
                    width={16}
                    height={14}
                    fill={CITY_COLOR[t.city]}
                    fillOpacity={0.12}
                    stroke={CITY_COLOR[t.city]}
                    strokeWidth="1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: i * 0.15 + 0.75 }}
                  />
                  {/* Puerta / entrada planta baja */}
                  <motion.rect
                    x={x - 6}
                    y={300 - 20}
                    width={12}
                    height={20}
                    fill="#1a2251"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: i * 0.15 + 0.8 }}
                  />
                  {/* Tag barrio (arriba del todo) */}
                  <motion.text
                    x={x}
                    y={300 - h - 42}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.15 + 0.9 }}
                    fill={CITY_COLOR[t.city]}
                    opacity={0.85}
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                    letterSpacing="1"
                  >
                    {t.city === "sj" ? "· SAN JUSTO ·" : "· RAMOS MEJÍA ·"}
                  </motion.text>
                  {/* Año (debajo del barrio, arriba del pin) */}
                  <motion.text
                    x={x}
                    y={300 - h - 26}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.15 + 0.95 }}
                    fill={CITY_COLOR[t.city]}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {t.year}
                  </motion.text>
                  {/* Label debajo */}
                  <motion.text
                    x={x}
                    y="326"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.15 + 1.05 }}
                    fill="rgba(26,34,81,0.6)"
                    fontSize="9"
                    fontWeight="bold"
                    letterSpacing="1"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {t.title.toUpperCase()}
                  </motion.text>
                </g>
              );
            })}

          </svg>
        </div>

        {/* Cards debajo con descripción completa · sólo desktop */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {items.map((t) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4 }}
              className="bg-gray-50 border border-gray-200 rounded-sm p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono-price font-bold text-sm" style={{ color: CITY_COLOR[t.city] }}>
                  {t.year}
                </p>
                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                  · {CITY_LABEL[t.city]}
                </span>
              </div>
              <h3 className="font-display text-base font-semibold text-navy">
                {t.title}
              </h3>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                {t.text}
              </p>
            </motion.div>
          ))}
        </div>

        <MobileTimeline items={items} heights={heights} />
      </div>
    </section>
  );
}

// ── MOBILE TIMELINE ──────────────────────────────────────────────────────
// Stack vertical con: línea de "construcción" continua a la izquierda
// que se va dibujando con el scroll, y mini-blueprint por hito que se
// arma por capas (contorno → pisos top-down → ventana → puerta).
function MobileTimeline({
  items,
  heights,
}: {
  items: TimelineItem[];
  heights: number[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 30%"],
  });
  const trackHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="md:hidden relative">
      {/* Track vertical · línea navy que se "construye" con el scroll */}
      <div className="absolute left-3 top-4 bottom-4 w-px bg-gray-200" aria-hidden="true">
        <motion.div
          style={{ height: trackHeight }}
          className="absolute inset-x-0 top-0 bg-navy"
        />
      </div>

      <div className="flex flex-col gap-4 pl-8">
        {items.map((t, i) => {
          const h = heights[i];
          const maxH = heights[heights.length - 1];
          const canvasH = 140;
          const buildingH = Math.round((h / maxH) * (canvasH - 24));
          const cx = 60;

          return (
            <MobileTimelineCard
              key={t.year}
              item={t}
              canvasH={canvasH}
              buildingH={buildingH}
              cx={cx}
            />
          );
        })}
      </div>
    </div>
  );
}

function MobileTimelineCard({
  item: t,
  canvasH,
  buildingH,
  cx,
}: {
  item: TimelineItem;
  canvasH: number;
  buildingH: number;
  cx: number;
}) {
  // Stagger interno: contorno → pisos → divisores → ventana → puerta.
  const STEP = 0.12;
  const D_BASE = 0.1;
  const floors = Array.from({ length: Math.floor(buildingH / 18) });

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="relative overflow-hidden bg-white border border-gray-200 rounded-lg"
    >
      {/* Dot del año pegado al track · al entrar en viewport "se enciende" */}
      <motion.span
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 260, damping: 18 },
          },
        }}
        aria-hidden="true"
        className="absolute -left-[22px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-[3px] z-10"
        style={{ borderColor: CITY_COLOR[t.city] }}
      />

      {/* Grid pattern interno · "blueprint feel" */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,34,81,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,34,81,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative flex gap-4 p-4">
        {/* Mini-blueprint del edificio · construcción por capas */}
        <div className="flex-shrink-0 w-[120px]">
          <svg viewBox={`0 0 ${cx * 2} ${canvasH}`} className="w-full h-auto">
            {/* Ground + hatching · ya está cuando aparece la card */}
            <line
              x1="0"
              y1={canvasH - 8}
              x2={cx * 2}
              y2={canvasH - 8}
              stroke="#1a2251"
              strokeWidth="1.5"
            />
            <g stroke="rgba(26,34,81,0.4)" strokeWidth="0.5">
              {Array.from({ length: Math.ceil((cx * 2) / 6) }).map((_, k) => (
                <line
                  key={k}
                  x1={k * 6}
                  y1={canvasH - 7}
                  x2={k * 6 - 4}
                  y2={canvasH - 1}
                />
              ))}
            </g>

            {/* 1. Contorno del edificio (path drawing — strokeDashoffset) */}
            <motion.rect
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: { duration: 0.6, delay: D_BASE },
                },
              }}
              x={cx - 28}
              y={canvasH - 8 - buildingH}
              width="56"
              height={buildingH}
              fill="white"
              stroke="#1a2251"
              strokeWidth="1.5"
            />

            {/* 2. Pisos top-down (como si el edificio se fuera "armando" desde arriba) */}
            {floors.map((_, f) => (
              <motion.line
                key={f}
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: {
                      duration: 0.25,
                      delay: D_BASE + 0.6 + f * 0.04,
                    },
                  },
                }}
                x1={cx - 25}
                y1={canvasH - 8 - (floors.length - f) * 18}
                x2={cx + 25}
                y2={canvasH - 8 - (floors.length - f) * 18}
                stroke="rgba(26,34,81,0.35)"
                strokeWidth="0.6"
                strokeDasharray="2 2"
              />
            ))}

            {/* 3. Divisores verticales */}
            <motion.line
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.4,
                    delay: D_BASE + 0.6 + floors.length * 0.04 + STEP,
                  },
                },
              }}
              x1={cx - 9}
              y1={canvasH - 8 - buildingH + 4}
              x2={cx - 9}
              y2={canvasH - 8 - 22}
              stroke="rgba(26,34,81,0.35)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
            />
            <motion.line
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.4,
                    delay: D_BASE + 0.6 + floors.length * 0.04 + STEP + 0.05,
                  },
                },
              }}
              x1={cx + 9}
              y1={canvasH - 8 - buildingH + 4}
              x2={cx + 9}
              y2={canvasH - 8 - 22}
              stroke="rgba(26,34,81,0.35)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
            />

            {/* 4. Ventana destacada · "se enciende" con fade del color */}
            <motion.rect
              variants={{
                hidden: { opacity: 0, scale: 0.7 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.4,
                    delay: D_BASE + 0.6 + floors.length * 0.04 + STEP * 2,
                  },
                },
              }}
              x={cx - 6}
              y={canvasH - 8 - 18}
              width="12"
              height="11"
              fill={CITY_COLOR[t.city]}
              fillOpacity={0.12}
              stroke={CITY_COLOR[t.city]}
              strokeWidth="0.8"
              style={{ transformOrigin: `${cx}px ${canvasH - 12}px` }}
            />

            {/* 5. Puerta · último elemento (la "inauguración" del edificio) */}
            <motion.rect
              variants={{
                hidden: { scaleY: 0, opacity: 0 },
                visible: {
                  scaleY: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.4,
                    delay: D_BASE + 0.6 + floors.length * 0.04 + STEP * 3,
                    ease: [0.34, 1.3, 0.64, 1],
                  },
                },
              }}
              x={cx - 5}
              y={canvasH - 8 - 16}
              width="10"
              height="16"
              fill="#1a2251"
              style={{ transformOrigin: `${cx}px ${canvasH - 8}px` }}
            />
          </svg>
        </div>

        {/* Texto del hito */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <p
              className="font-mono-price font-bold text-sm"
              style={{ color: CITY_COLOR[t.city] }}
            >
              {t.year}
            </p>
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: CITY_COLOR[t.city],
                backgroundColor: `${CITY_COLOR[t.city]}1a`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: CITY_COLOR[t.city] }}
              />
              {CITY_LABEL[t.city]}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-navy leading-tight">
            {t.title}
          </h3>
          <p className="text-gray-600 text-xs mt-1.5 leading-relaxed">
            {t.text}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
