"use client";

import Link from "next/link";
import Image from "next/image";
import { TrendingDown, Flame } from "lucide-react";
import type { Property, PriceHistoryEntry } from "@/data/types";

interface OpportunityCardProps {
  property: Property;
}

function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.round((now - then) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;
  const months = Math.round(days / 30);
  return `Hace ${months} mes${months > 1 ? "es" : ""}`;
}

export default function OpportunityCard({ property }: OpportunityCardProps) {
  const history = property.priceHistory;
  if (!history || history.length < 2) return null;

  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const current = sorted[0];
  const original = sorted[sorted.length - 1];
  const diff = current.price - original.price;
  const pct = Math.round((diff / original.price) * 100);
  const currencyLabel = current.currency === "ARS" ? "$" : "USD";
  const imageSrc = property.images[0] ?? null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ease-out">
      <Link
        href={`/propiedad/${property.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Ver propiedad ${property.code}`}
      />

      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-full bg-magenta px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
          <Flame className="w-3 h-3" /> Oportunidad
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-bold text-navy line-clamp-2 min-h-[3em]">
            {property.title}
          </h3>
          <p className="text-xs text-navy-500 line-clamp-1 mt-1">
            {property.locality}
            {property.district && property.district !== property.locality
              ? `, ${property.district}`
              : ""}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-navy">
            {currencyLabel} {formatPrice(current.price)}
          </span>
          <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-emerald-600">
            <TrendingDown className="w-3.5 h-3.5" />
            {pct}% ({currencyLabel} {formatPrice(Math.abs(diff))})
          </span>
        </div>

        <ol className="relative border-l-2 border-gray-200 ml-1.5 pl-4 space-y-1.5">
          {sorted.map((entry: PriceHistoryEntry, idx) => (
            <li key={entry.date} className="relative text-xs">
              <span
                className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                  idx === 0
                    ? "bg-magenta border-magenta"
                    : "bg-white border-gray-300"
                }`}
              />
              <span
                className={
                  idx === 0
                    ? "font-semibold text-navy"
                    : "text-navy-500"
                }
              >
                {formatRelativeDate(entry.date)}:
              </span>{" "}
              <span
                className={
                  idx === 0 ? "text-navy" : "text-navy-400 line-through"
                }
              >
                {entry.currency === "ARS" ? "$" : "USD"} {formatPrice(entry.price)}
              </span>
            </li>
          ))}
        </ol>

        <span className="relative z-20 mt-1 text-sm font-semibold text-magenta group-hover:underline">
          Ver propiedad →
        </span>
      </div>
    </article>
  );
}
