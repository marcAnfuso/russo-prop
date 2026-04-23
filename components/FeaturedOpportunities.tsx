"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingDown, Flame } from "lucide-react";
import type { Property } from "@/data/types";
import { formatPrice } from "@/lib/utils";

interface FeaturedOpportunitiesProps {
  properties: Property[];
}

function getDrop(property: Property) {
  const history = property.priceHistory;
  if (!history || history.length < 2) return null;
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const current = sorted[0];
  const original = sorted[sorted.length - 1];
  const diff = current.price - original.price;
  const pct = Math.round((diff / original.price) * 100);
  return { current, original, diff, pct };
}

export default function FeaturedOpportunities({
  properties,
}: FeaturedOpportunitiesProps) {
  if (properties.length === 0) return null;

  // El de mayor baja va de protagonista (las props vienen ordenadas por
  // magnitud del drop desde fetchOpportunityPropertiesReal).
  const [hero, ...rest] = properties;
  const heroDrop = getDrop(hero);
  if (!heroDrop) return null;

  const secondaries = rest
    .map((p) => ({ property: p, drop: getDrop(p) }))
    .filter((x): x is { property: Property; drop: NonNullable<ReturnType<typeof getDrop>> } => x.drop !== null)
    .slice(0, 2);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-magenta mb-3">
            <Flame className="w-3.5 h-3.5" /> Oportunidades
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">
            Bajas de precio recientes
          </h2>
          <p className="mt-3 text-navy-500 text-base max-w-md mx-auto">
            Propiedades con rebajas que no podés dejar pasar
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* Protagonista — 3 de 5 cols (antes era 2/3, ahora 3/5 = ~60%) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
            }}
            className="lg:col-span-3"
          >
            <Link
              href={`/propiedad/${hero.id}`}
              className="relative group block rounded-2xl overflow-hidden bg-gray-900 aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[380px] shadow-card hover:shadow-[0_30px_60px_-15px_rgba(230,0,126,0.35)] transition-all duration-300"
            >
              {hero.images[0] && (
                <Image
                  src={hero.images[0]}
                  alt={hero.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-magenta px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                  <Flame className="w-3.5 h-3.5" /> Mayor baja
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm opacity-80 mb-1">
                  {hero.locality}
                  {hero.district && hero.district !== hero.locality ? `, ${hero.district}` : ""}
                </p>
                <h3 className="text-xl lg:text-2xl font-bold mb-4 line-clamp-2">
                  {hero.title}
                </h3>
                <div className="flex items-end gap-4 flex-wrap">
                  <div>
                    <p className="text-xs opacity-70 line-through font-mono-price">
                      {heroDrop.original.currency === "ARS" ? "$" : "USD"}{" "}
                      {formatPrice(heroDrop.original.price)}
                    </p>
                    <p className="text-3xl lg:text-4xl font-bold tracking-tight font-mono-price">
                      {heroDrop.current.currency === "ARS" ? "$" : "USD"}{" "}
                      {formatPrice(heroDrop.current.price)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold">
                    <TrendingDown className="w-4 h-4" />
                    {heroDrop.pct}%
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Secundarias — 2 de 5 cols, apiladas estirando al alto de la protagonista */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full">
            {secondaries.map(({ property: p, drop }) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
                }}
                className="flex-1 min-h-[180px]"
              >
                <Link
                  href={`/propiedad/${p.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-card hover:shadow-[0_20px_40px_-12px_rgba(230,0,126,0.25)] hover:-translate-y-0.5 transition-all duration-300 flex h-full"
                >
                  <div className="relative w-[45%] flex-shrink-0 overflow-hidden">
                    {p.images[0] && (
                      <Image
                        src={p.images[0]}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                        sizes="200px"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">
                        {p.locality}
                      </p>
                      <h4 className="text-sm font-semibold text-navy line-clamp-2 mt-1">
                        {p.title}
                      </h4>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 line-through font-mono-price">
                        {drop.original.currency === "ARS" ? "$" : "USD"}{" "}
                        {formatPrice(drop.original.price)}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold text-navy font-mono-price">
                          {drop.current.currency === "ARS" ? "$" : "USD"}{" "}
                          {formatPrice(drop.current.price)}
                        </p>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                          <TrendingDown className="w-3 h-3" />
                          {drop.pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
