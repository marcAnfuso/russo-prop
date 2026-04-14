"use client";

import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";

type Barrio = "San Justo" | "Ramos Mejía" | "Haedo" | "Morón" | "Villa Luzuriaga";
type Tipo = "Casa" | "Departamento" | "PH";
type Ambientes = 1 | 2 | 3 | 4;

interface MarketData {
  priceFrom: string;
  priceTo: string;
  pricePerSqM: string;
  daysToSell: number;
  activeListings: number;
  trendPct: number;
  trendSeries: number[]; // 12 points, normalized heights for sparkline
}

// Mock data — in Fase B this comes from aggregated Xintel snapshots
const mockData: Record<Barrio, Record<Tipo, Record<Ambientes, MarketData>>> = {
  "San Justo": {
    Casa: {
      1: { priceFrom: "45K", priceTo: "65K", pricePerSqM: "1.600", daysToSell: 38, activeListings: 12, trendPct: 5.1, trendSeries: [130, 128, 125, 120, 115, 110, 108, 100, 95, 88, 78, 70] },
      2: { priceFrom: "60K", priceTo: "95K", pricePerSqM: "1.720", daysToSell: 42, activeListings: 18, trendPct: 6.8, trendSeries: [135, 130, 125, 118, 112, 105, 100, 92, 85, 78, 68, 60] },
      3: { priceFrom: "80K", priceTo: "140K", pricePerSqM: "1.850", daysToSell: 47, activeListings: 23, trendPct: 8.4, trendSeries: [140, 135, 120, 130, 110, 100, 105, 85, 75, 70, 60, 55] },
      4: { priceFrom: "120K", priceTo: "220K", pricePerSqM: "2.050", daysToSell: 62, activeListings: 8, trendPct: 4.2, trendSeries: [130, 128, 122, 118, 115, 110, 105, 100, 92, 88, 82, 75] },
    },
    Departamento: {
      1: { priceFrom: "38K", priceTo: "55K", pricePerSqM: "1.900", daysToSell: 30, activeListings: 15, trendPct: 7.2, trendSeries: [132, 128, 122, 115, 108, 100, 95, 85, 80, 72, 65, 58] },
      2: { priceFrom: "55K", priceTo: "85K", pricePerSqM: "2.100", daysToSell: 35, activeListings: 22, trendPct: 9.1, trendSeries: [140, 132, 125, 118, 108, 98, 92, 82, 72, 65, 58, 50] },
      3: { priceFrom: "75K", priceTo: "125K", pricePerSqM: "2.250", daysToSell: 40, activeListings: 19, trendPct: 8.8, trendSeries: [138, 130, 122, 118, 110, 102, 92, 85, 75, 68, 60, 52] },
      4: { priceFrom: "110K", priceTo: "180K", pricePerSqM: "2.400", daysToSell: 55, activeListings: 6, trendPct: 5.5, trendSeries: [132, 128, 120, 115, 108, 102, 98, 92, 85, 78, 72, 65] },
    },
    PH: {
      1: { priceFrom: "50K", priceTo: "75K", pricePerSqM: "1.700", daysToSell: 44, activeListings: 9, trendPct: 4.8, trendSeries: [128, 125, 120, 115, 110, 105, 100, 95, 88, 82, 75, 70] },
      2: { priceFrom: "68K", priceTo: "105K", pricePerSqM: "1.820", daysToSell: 50, activeListings: 14, trendPct: 6.2, trendSeries: [130, 128, 122, 118, 112, 105, 98, 92, 85, 78, 72, 65] },
      3: { priceFrom: "85K", priceTo: "145K", pricePerSqM: "1.900", daysToSell: 55, activeListings: 11, trendPct: 5.5, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 82, 76, 70, 65] },
      4: { priceFrom: "125K", priceTo: "200K", pricePerSqM: "2.000", daysToSell: 68, activeListings: 4, trendPct: 3.8, trendSeries: [125, 123, 120, 115, 112, 108, 103, 100, 95, 90, 85, 80] },
    },
  },
  "Ramos Mejía": {
    Casa: {
      1: { priceFrom: "55K", priceTo: "80K", pricePerSqM: "2.100", daysToSell: 35, activeListings: 10, trendPct: 6.5, trendSeries: [132, 128, 122, 115, 108, 102, 95, 88, 80, 72, 65, 58] },
      2: { priceFrom: "75K", priceTo: "120K", pricePerSqM: "2.250", daysToSell: 40, activeListings: 16, trendPct: 7.8, trendSeries: [138, 130, 122, 115, 108, 100, 92, 85, 75, 68, 60, 52] },
      3: { priceFrom: "100K", priceTo: "180K", pricePerSqM: "2.400", daysToSell: 45, activeListings: 21, trendPct: 9.2, trendSeries: [140, 132, 122, 115, 105, 98, 88, 80, 72, 65, 55, 48] },
      4: { priceFrom: "150K", priceTo: "280K", pricePerSqM: "2.650", daysToSell: 58, activeListings: 9, trendPct: 5.8, trendSeries: [132, 128, 120, 115, 108, 102, 95, 88, 82, 75, 68, 62] },
    },
    Departamento: {
      1: { priceFrom: "45K", priceTo: "68K", pricePerSqM: "2.400", daysToSell: 28, activeListings: 18, trendPct: 8.5, trendSeries: [135, 128, 120, 112, 102, 92, 85, 75, 68, 58, 50, 45] },
      2: { priceFrom: "68K", priceTo: "100K", pricePerSqM: "2.600", daysToSell: 32, activeListings: 25, trendPct: 10.2, trendSeries: [142, 132, 122, 112, 102, 92, 82, 72, 62, 55, 48, 42] },
      3: { priceFrom: "90K", priceTo: "150K", pricePerSqM: "2.800", daysToSell: 38, activeListings: 22, trendPct: 9.8, trendSeries: [140, 130, 120, 110, 100, 90, 82, 74, 65, 58, 52, 45] },
      4: { priceFrom: "130K", priceTo: "220K", pricePerSqM: "2.950", daysToSell: 50, activeListings: 8, trendPct: 6.5, trendSeries: [132, 126, 118, 110, 102, 95, 88, 82, 75, 68, 62, 58] },
    },
    PH: {
      1: { priceFrom: "55K", priceTo: "80K", pricePerSqM: "2.000", daysToSell: 42, activeListings: 8, trendPct: 5.2, trendSeries: [128, 125, 120, 115, 108, 102, 96, 90, 85, 78, 72, 68] },
      2: { priceFrom: "78K", priceTo: "115K", pricePerSqM: "2.150", daysToSell: 48, activeListings: 12, trendPct: 6.8, trendSeries: [132, 128, 122, 115, 108, 100, 94, 86, 78, 70, 65, 58] },
      3: { priceFrom: "105K", priceTo: "165K", pricePerSqM: "2.250", daysToSell: 52, activeListings: 9, trendPct: 6.2, trendSeries: [130, 125, 118, 112, 105, 98, 92, 85, 78, 72, 66, 60] },
      4: { priceFrom: "145K", priceTo: "230K", pricePerSqM: "2.400", daysToSell: 65, activeListings: 3, trendPct: 4.5, trendSeries: [126, 124, 120, 116, 112, 108, 102, 98, 92, 88, 82, 78] },
    },
  },
  Haedo: {
    Casa: {
      1: { priceFrom: "48K", priceTo: "72K", pricePerSqM: "1.850", daysToSell: 40, activeListings: 8, trendPct: 5.5, trendSeries: [130, 128, 122, 118, 110, 105, 98, 92, 85, 78, 72, 65] },
      2: { priceFrom: "65K", priceTo: "105K", pricePerSqM: "1.950", daysToSell: 45, activeListings: 14, trendPct: 7.0, trendSeries: [135, 128, 122, 115, 108, 100, 92, 85, 78, 70, 62, 55] },
      3: { priceFrom: "90K", priceTo: "155K", pricePerSqM: "2.100", daysToSell: 50, activeListings: 18, trendPct: 8.2, trendSeries: [138, 130, 120, 112, 105, 95, 88, 80, 72, 65, 58, 52] },
      4: { priceFrom: "130K", priceTo: "240K", pricePerSqM: "2.300", daysToSell: 60, activeListings: 6, trendPct: 5.0, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 84, 78, 72, 68] },
    },
    Departamento: {
      1: { priceFrom: "40K", priceTo: "62K", pricePerSqM: "2.100", daysToSell: 32, activeListings: 13, trendPct: 7.5, trendSeries: [132, 126, 120, 112, 105, 95, 88, 80, 72, 65, 58, 52] },
      2: { priceFrom: "60K", priceTo: "92K", pricePerSqM: "2.300", daysToSell: 36, activeListings: 20, trendPct: 9.0, trendSeries: [138, 130, 122, 115, 105, 95, 88, 80, 70, 62, 55, 48] },
      3: { priceFrom: "80K", priceTo: "135K", pricePerSqM: "2.450", daysToSell: 42, activeListings: 16, trendPct: 8.5, trendSeries: [136, 128, 120, 112, 105, 96, 90, 82, 75, 68, 60, 54] },
      4: { priceFrom: "115K", priceTo: "195K", pricePerSqM: "2.600", daysToSell: 55, activeListings: 5, trendPct: 5.8, trendSeries: [130, 126, 120, 114, 108, 102, 96, 90, 84, 78, 72, 68] },
    },
    PH: {
      1: { priceFrom: "52K", priceTo: "78K", pricePerSqM: "1.800", daysToSell: 42, activeListings: 7, trendPct: 4.8, trendSeries: [128, 125, 120, 115, 110, 105, 100, 95, 90, 85, 80, 75] },
      2: { priceFrom: "72K", priceTo: "110K", pricePerSqM: "1.900", daysToSell: 48, activeListings: 10, trendPct: 6.0, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 84, 78, 72, 68] },
      3: { priceFrom: "95K", priceTo: "155K", pricePerSqM: "2.000", daysToSell: 54, activeListings: 8, trendPct: 5.5, trendSeries: [128, 125, 120, 115, 110, 104, 98, 92, 86, 80, 74, 68] },
      4: { priceFrom: "135K", priceTo: "215K", pricePerSqM: "2.100", daysToSell: 68, activeListings: 3, trendPct: 3.5, trendSeries: [125, 123, 120, 116, 113, 110, 106, 102, 98, 94, 90, 86] },
    },
  },
  Morón: {
    Casa: {
      1: { priceFrom: "50K", priceTo: "75K", pricePerSqM: "1.950", daysToSell: 38, activeListings: 9, trendPct: 6.0, trendSeries: [130, 126, 120, 112, 105, 98, 92, 85, 78, 70, 64, 58] },
      2: { priceFrom: "70K", priceTo: "115K", pricePerSqM: "2.100", daysToSell: 42, activeListings: 15, trendPct: 7.5, trendSeries: [135, 128, 122, 115, 108, 100, 92, 85, 76, 68, 60, 52] },
      3: { priceFrom: "95K", priceTo: "165K", pricePerSqM: "2.250", daysToSell: 47, activeListings: 20, trendPct: 8.8, trendSeries: [140, 130, 120, 112, 105, 95, 88, 80, 72, 65, 58, 50] },
      4: { priceFrom: "140K", priceTo: "260K", pricePerSqM: "2.450", daysToSell: 58, activeListings: 7, trendPct: 5.2, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 84, 78, 72, 68] },
    },
    Departamento: {
      1: { priceFrom: "42K", priceTo: "65K", pricePerSqM: "2.200", daysToSell: 30, activeListings: 14, trendPct: 7.8, trendSeries: [132, 126, 120, 112, 102, 92, 85, 75, 68, 60, 52, 45] },
      2: { priceFrom: "62K", priceTo: "95K", pricePerSqM: "2.400", daysToSell: 34, activeListings: 22, trendPct: 9.2, trendSeries: [138, 130, 122, 112, 102, 92, 82, 74, 65, 58, 50, 44] },
      3: { priceFrom: "82K", priceTo: "140K", pricePerSqM: "2.550", daysToSell: 40, activeListings: 18, trendPct: 9.0, trendSeries: [138, 128, 120, 110, 100, 92, 85, 77, 70, 62, 55, 48] },
      4: { priceFrom: "120K", priceTo: "205K", pricePerSqM: "2.700", daysToSell: 52, activeListings: 6, trendPct: 6.0, trendSeries: [130, 126, 118, 112, 105, 98, 92, 85, 78, 72, 66, 60] },
    },
    PH: {
      1: { priceFrom: "55K", priceTo: "80K", pricePerSqM: "1.850", daysToSell: 44, activeListings: 7, trendPct: 4.8, trendSeries: [128, 125, 120, 115, 110, 105, 100, 95, 90, 84, 78, 72] },
      2: { priceFrom: "75K", priceTo: "115K", pricePerSqM: "1.950", daysToSell: 50, activeListings: 11, trendPct: 6.2, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 84, 76, 70, 64] },
      3: { priceFrom: "100K", priceTo: "165K", pricePerSqM: "2.050", daysToSell: 55, activeListings: 8, trendPct: 5.8, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 84, 78, 72, 66] },
      4: { priceFrom: "140K", priceTo: "225K", pricePerSqM: "2.150", daysToSell: 68, activeListings: 3, trendPct: 3.8, trendSeries: [126, 124, 120, 117, 113, 110, 106, 102, 98, 94, 90, 86] },
    },
  },
  "Villa Luzuriaga": {
    Casa: {
      1: { priceFrom: "42K", priceTo: "62K", pricePerSqM: "1.550", daysToSell: 42, activeListings: 6, trendPct: 4.5, trendSeries: [128, 125, 120, 116, 112, 106, 100, 94, 88, 82, 78, 72] },
      2: { priceFrom: "58K", priceTo: "90K", pricePerSqM: "1.680", daysToSell: 48, activeListings: 11, trendPct: 5.8, trendSeries: [130, 128, 122, 116, 110, 104, 98, 92, 85, 78, 72, 66] },
      3: { priceFrom: "78K", priceTo: "135K", pricePerSqM: "1.800", daysToSell: 52, activeListings: 15, trendPct: 7.2, trendSeries: [135, 128, 120, 114, 108, 100, 92, 85, 78, 70, 64, 58] },
      4: { priceFrom: "115K", priceTo: "215K", pricePerSqM: "2.000", daysToSell: 65, activeListings: 5, trendPct: 4.5, trendSeries: [128, 126, 122, 116, 112, 106, 102, 96, 90, 85, 80, 76] },
    },
    Departamento: {
      1: { priceFrom: "35K", priceTo: "52K", pricePerSqM: "1.850", daysToSell: 34, activeListings: 9, trendPct: 6.5, trendSeries: [130, 126, 120, 112, 105, 96, 90, 82, 75, 68, 62, 55] },
      2: { priceFrom: "52K", priceTo: "80K", pricePerSqM: "2.000", daysToSell: 38, activeListings: 14, trendPct: 8.0, trendSeries: [136, 130, 120, 112, 102, 92, 85, 75, 68, 60, 52, 48] },
      3: { priceFrom: "72K", priceTo: "120K", pricePerSqM: "2.150", daysToSell: 44, activeListings: 12, trendPct: 7.5, trendSeries: [134, 128, 120, 112, 105, 95, 88, 80, 72, 65, 58, 52] },
      4: { priceFrom: "105K", priceTo: "175K", pricePerSqM: "2.300", daysToSell: 56, activeListings: 4, trendPct: 5.2, trendSeries: [130, 126, 120, 115, 108, 102, 96, 90, 84, 78, 72, 68] },
    },
    PH: {
      1: { priceFrom: "48K", priceTo: "72K", pricePerSqM: "1.600", daysToSell: 46, activeListings: 5, trendPct: 4.2, trendSeries: [126, 124, 120, 115, 112, 108, 104, 98, 94, 88, 84, 80] },
      2: { priceFrom: "68K", priceTo: "102K", pricePerSqM: "1.720", daysToSell: 52, activeListings: 9, trendPct: 5.5, trendSeries: [128, 126, 120, 115, 110, 105, 100, 94, 88, 82, 76, 70] },
      3: { priceFrom: "90K", priceTo: "148K", pricePerSqM: "1.830", daysToSell: 58, activeListings: 7, trendPct: 5.0, trendSeries: [128, 125, 120, 116, 110, 105, 100, 95, 90, 84, 78, 72] },
      4: { priceFrom: "125K", priceTo: "205K", pricePerSqM: "1.950", daysToSell: 72, activeListings: 2, trendPct: 3.2, trendSeries: [125, 123, 120, 117, 114, 110, 107, 104, 100, 97, 93, 90] },
    },
  },
};

const BARRIOS: Barrio[] = ["San Justo", "Ramos Mejía", "Haedo", "Morón", "Villa Luzuriaga"];
const TIPOS: Tipo[] = ["Casa", "Departamento", "PH"];
const AMBIENTES: Ambientes[] = [1, 2, 3, 4];

export default function MarketExplorer() {
  const [barrio, setBarrio] = useState<Barrio>("San Justo");
  const [tipo, setTipo] = useState<Tipo>("Casa");
  const [ambientes, setAmbientes] = useState<Ambientes>(3);

  const data = mockData[barrio][tipo][ambientes];

  // Build sparkline path from normalized values (0-150, higher value = lower y visually)
  const sparkPath = useMemo(() => {
    const points = data.trendSeries;
    const w = 600;
    const h = 180;
    const padY = 10;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const coords = points.map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = padY + ((v - min) / range) * (h - padY * 2);
      return [x, y] as [number, number];
    });
    const line = coords
      .map((c, i) => (i === 0 ? `M ${c[0]} ${c[1]}` : `L ${c[0]} ${c[1]}`))
      .join(" ");
    const area = `${line} L ${w} ${h} L 0 ${h} Z`;
    const endPoint = coords[coords.length - 1];
    return { line, area, endX: endPoint[0], endY: endPoint[1], w, h };
  }, [data.trendSeries]);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-magenta mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta" />
            Market explorer
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-navy max-w-2xl">
            ¿Cuánto sale vivir acá?
            <br />
            <span className="italic text-gray-400">Preguntale al explorador.</span>
          </h2>
        </div>

        <div className="rounded-3xl bg-white shadow-[0_20px_60px_-20px_rgba(26,34,81,0.15)] overflow-hidden border border-gray-100">
          {/* Widget header */}
          <div className="bg-navy text-white p-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mb-1">
                Data agregada · Xintel
              </p>
              <h3 className="font-display text-2xl font-semibold">
                Explorá precios reales en zona oeste
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Actualizado hoy
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                Barrio
              </span>
              <select
                value={barrio}
                onChange={(e) => setBarrio(e.target.value as Barrio)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta transition-colors"
              >
                {BARRIOS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                Tipo
              </span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Tipo)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta transition-colors"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                Ambientes
              </span>
              <div className="flex gap-1.5">
                {AMBIENTES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmbientes(a)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-all duration-150 active:scale-[0.97] ${
                      a === ambientes
                        ? "border-magenta bg-magenta-50 text-magenta font-semibold shadow-sm"
                        : "border-gray-200 text-navy hover:border-navy-300 hover:bg-gray-50"
                    }`}
                  >
                    {a === 4 ? "4+" : a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="p-8 grid lg:grid-cols-3 gap-8">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2 font-medium">
                Rango · {tipo} {ambientes}
                {ambientes === 4 ? "+" : ""} amb. · {barrio}
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">desde</p>
                  <p className="font-mono-price text-4xl lg:text-5xl font-bold text-navy">
                    USD <span className="text-magenta">{data.priceFrom}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">hasta</p>
                  <p className="font-mono-price text-4xl lg:text-5xl font-bold text-navy">
                    USD <span className="text-magenta">{data.priceTo}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  Tendencia · últimos 12 meses
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />+{data.trendPct}%
                </span>
              </div>
              <svg
                viewBox={`0 0 ${sparkPath.w} ${sparkPath.h}`}
                className="w-full h-40 lg:h-48"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="mkt-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e6007e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#e6007e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* horizontal guides */}
                {[45, 90, 135].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2={sparkPath.w}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                <path d={sparkPath.area} fill="url(#mkt-grad)" />
                <path
                  d={sparkPath.line}
                  fill="none"
                  stroke="#e6007e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx={sparkPath.endX} cy={sparkPath.endY} r="6" fill="#e6007e" />
                <circle
                  cx={sparkPath.endX}
                  cy={sparkPath.endY}
                  r="12"
                  fill="#e6007e"
                  opacity="0.2"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                <span>Abr 25</span>
                <span>Jul</span>
                <span>Oct</span>
                <span>Ene 26</span>
                <span>Abr</span>
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-100 divide-x divide-gray-100">
            <div className="p-5 text-center">
              <p className="font-mono-price text-2xl font-bold text-navy">
                {data.daysToSell}
              </p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                días venta prom.
              </p>
            </div>
            <div className="p-5 text-center">
              <p className="font-mono-price text-2xl font-bold text-navy">
                USD {data.pricePerSqM}
              </p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                por m²
              </p>
            </div>
            <div className="p-5 text-center">
              <p className="font-mono-price text-2xl font-bold text-navy">
                {data.activeListings}
              </p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                en venta hoy
              </p>
            </div>
            <div className="p-5 text-center">
              <p className="font-mono-price text-2xl font-bold text-emerald-600">
                +{data.trendPct}%
              </p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                últimos 12m
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 max-w-xl mx-auto">
          Data preliminar. Los valores reales se alimentan de snapshots diarios
          de Xintel — en desarrollo.
        </p>
      </div>
    </section>
  );
}
