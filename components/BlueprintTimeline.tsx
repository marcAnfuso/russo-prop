"use client";

import { motion } from "framer-motion";

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

        {/* Skyline SVG */}
        <div className="overflow-x-auto pb-2">
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

        {/* Cards debajo con descripción completa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
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
      </div>
    </section>
  );
}
