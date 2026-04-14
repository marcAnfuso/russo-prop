# Opportunity Cards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a UI prototype showing a "Oportunidades" home page section with property cards that display a price-drop timeline, using mock data.

**Architecture:** New `OpportunityCard` component (timeline variant of PropertyCard) + `FeaturedOpportunities` section. Data is hardcoded in `data/mock-opportunities.ts` (Fase A). No DB or tracking yet. Inserted in home page between `NewListings` and `NeighborhoodGrid`.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, lucide-react icons.

**Reference:** [docs/plans/2026-04-12-opportunity-cards-design.md](2026-04-12-opportunity-cards-design.md)

---

## Task 1: Extend Property type with price history

**Files:**
- Modify: `data/types.ts:5-32`

**Step 1: Add `PriceHistoryEntry` type and optional field on `Property`**

In [data/types.ts](data/types.ts), add after the `PropertyType` union (line 2) and before `Property` interface:

```ts
export interface PriceHistoryEntry {
  price: number;
  currency: "USD" | "ARS";
  date: string; // ISO 8601
}
```

Then add the optional field inside `Property` (after line 31, before the closing brace):

```ts
  priceHistory?: PriceHistoryEntry[];
```

**Step 2: Verify TypeScript compiles**

Run: `cd /home/marc/russo-prop && npx tsc --noEmit`
Expected: no errors (optional field is non-breaking)

**Step 3: Commit**

```bash
git add data/types.ts
git commit -m "feat(types): add PriceHistoryEntry and optional priceHistory field"
```

---

## Task 2: Create mock opportunities data

**Files:**
- Create: `data/mock-opportunities.ts`

**Step 1: Write the mock data file**

Create [data/mock-opportunities.ts](data/mock-opportunities.ts) with 4 mock opportunities. Each entry has the Xintel property `id` (to look up the real property) and a synthetic `priceHistory` showing a declining trend:

```ts
import type { PriceHistoryEntry } from "./types";

export interface MockOpportunity {
  propertyId: string;
  priceHistory: PriceHistoryEntry[];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockOpportunities: MockOpportunity[] = [
  {
    propertyId: "1",
    priceHistory: [
      { price: 120000, currency: "USD", date: daysAgo(18) },
      { price: 115000, currency: "USD", date: daysAgo(10) },
      { price: 112000, currency: "USD", date: daysAgo(3) },
    ],
  },
  {
    propertyId: "2",
    priceHistory: [
      { price: 95000, currency: "USD", date: daysAgo(22) },
      { price: 88000, currency: "USD", date: daysAgo(5) },
    ],
  },
  {
    propertyId: "3",
    priceHistory: [
      { price: 180000, currency: "USD", date: daysAgo(30) },
      { price: 170000, currency: "USD", date: daysAgo(14) },
      { price: 165000, currency: "USD", date: daysAgo(1) },
    ],
  },
  {
    propertyId: "4",
    priceHistory: [
      { price: 75000, currency: "USD", date: daysAgo(12) },
      { price: 69500, currency: "USD", date: daysAgo(2) },
    ],
  },
];
```

**Step 2: Commit**

```bash
git add data/mock-opportunities.ts
git commit -m "feat(data): add mock opportunities for Fase A prototype"
```

---

## Task 3: Create OpportunityCard component

**Files:**
- Create: `components/OpportunityCard.tsx`

**Step 1: Write the component**

This is a card with an image, a "OPORTUNIDAD" badge, property info, and a price-drop timeline. Reuses styling from `PropertyCard` but is simpler and standalone (not a fork).

Create [components/OpportunityCard.tsx](components/OpportunityCard.tsx):

```tsx
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
          <h3 className="text-base font-bold text-navy line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-navy-500 line-clamp-1">
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
```

**Step 2: Verify it compiles**

Run: `cd /home/marc/russo-prop && npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add components/OpportunityCard.tsx
git commit -m "feat(ui): OpportunityCard with price-drop timeline"
```

---

## Task 4: Create FeaturedOpportunities section

**Files:**
- Create: `components/FeaturedOpportunities.tsx`

**Step 1: Write the section component**

Create [components/FeaturedOpportunities.tsx](components/FeaturedOpportunities.tsx). This takes an array of `Property` (already merged with `priceHistory`) and renders the grid:

```tsx
"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { Property } from "@/data/types";
import OpportunityCard from "./OpportunityCard";

interface FeaturedOpportunitiesProps {
  properties: Property[];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FeaturedOpportunities({
  properties,
}: FeaturedOpportunitiesProps) {
  if (properties.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-magenta mb-3">
            <Flame className="w-3.5 h-3.5" /> Oportunidades
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">
            Bajas de precio recientes
          </h2>
          <p className="mt-3 text-navy-500 text-base max-w-md mx-auto">
            Propiedades con rebajas que no podés dejar pasar
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {properties.map((property) => (
            <motion.div key={property.id} variants={cardVariants}>
              <OpportunityCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd /home/marc/russo-prop && npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add components/FeaturedOpportunities.tsx
git commit -m "feat(ui): FeaturedOpportunities section wrapper"
```

---

## Task 5: Create data loader that merges mock history with Xintel properties

**Files:**
- Create: `lib/opportunities.ts`

**Step 1: Write the loader**

Create [lib/opportunities.ts](lib/opportunities.ts). This fetches properties from Xintel page 1, filters to the ones matching `mockOpportunities.propertyId`, and attaches `priceHistory`. Falls back to the first 4 properties if no IDs match (useful while we don't know real Xintel IDs).

```ts
import { fetchProperties } from "./xintel";
import { mockOpportunities } from "@/data/mock-opportunities";
import type { Property } from "@/data/types";

export async function fetchOpportunityProperties(): Promise<Property[]> {
  const { properties } = await fetchProperties({ page: 1 });
  if (properties.length === 0) return [];

  const mockById = new Map(
    mockOpportunities.map((m) => [m.propertyId, m.priceHistory])
  );

  const matched = properties
    .filter((p) => mockById.has(p.id))
    .map((p) => ({ ...p, priceHistory: mockById.get(p.id) }));

  if (matched.length >= 4) return matched.slice(0, 4);

  // Fallback: take first N real properties and attach mock histories round-robin
  const histories = mockOpportunities.map((m) => m.priceHistory);
  return properties.slice(0, 4).map((p, i) => ({
    ...p,
    priceHistory: histories[i % histories.length],
  }));
}
```

**Step 2: Verify it compiles**

Run: `cd /home/marc/russo-prop && npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add lib/opportunities.ts
git commit -m "feat(lib): opportunity loader merges mock history with Xintel data"
```

---

## Task 6: Integrate into home page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add imports at top of file**

In [app/page.tsx:1-10](app/page.tsx#L1-L10), add after existing imports:

```tsx
import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import { fetchOpportunityProperties } from "@/lib/opportunities";
```

**Step 2: Add loader + skeleton components**

After `NewListingsSkeleton` (around line 56), add:

```tsx
async function FeaturedOpportunitiesLoader() {
  const properties = await fetchOpportunityProperties();
  return <FeaturedOpportunities properties={properties} />;
}

function FeaturedOpportunitiesSkeleton() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-3">
          <div className="h-4 w-40 bg-gray-200 rounded-full mx-auto animate-pulse" />
          <div className="h-8 w-72 bg-gray-200 rounded-full mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Insert section in `Home()` JSX**

In [app/page.tsx:58-75](app/page.tsx#L58-L75), add a new `<Suspense>` block between the `NewListings` suspense and `<NeighborhoodGrid />`:

```tsx
<Suspense fallback={<FeaturedOpportunitiesSkeleton />}>
  <FeaturedOpportunitiesLoader />
</Suspense>
```

The final order should be:
```
Hero
FeaturedProperties
NewListings
FeaturedOpportunities  ← new
NeighborhoodGrid
FeaturedDevelopments
WhyRusso
TeamSection
GoogleReviews
```

**Step 4: Verify it compiles**

Run: `cd /home/marc/russo-prop && npx tsc --noEmit`
Expected: no errors

**Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat(home): add Oportunidades section to home page"
```

---

## Task 7: Visual verification in browser

**Step 1: Start dev server**

Run: `cd /home/marc/russo-prop && npm run dev`
Expected: server starts on port 3003 (or similar)

**Step 2: Open home page**

Navigate to `http://localhost:3003/` and scroll to the new "Oportunidades" section (between "Nuevas propiedades" and "Zonas").

**Checklist:**
- [ ] Section title "Bajas de precio recientes" visible
- [ ] 3-4 opportunity cards rendering with real Xintel images
- [ ] "OPORTUNIDAD" magenta badge on top-left of each image
- [ ] Current price in large navy text
- [ ] Green TrendingDown badge with % and $ diff
- [ ] Timeline shows 2-3 entries per card, most recent first
- [ ] Most recent entry has magenta dot + bold text
- [ ] Older entries have struck-through prices
- [ ] Card is clickable → navigates to `/propiedad/:id`
- [ ] Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Hover: card lifts, image zooms

**Step 3: Test with `priceHistory` absent**

Temporarily edit `data/mock-opportunities.ts` to export `[]` and reload. Expected: section does not render (returns `null`). Revert the change.

**Step 4: If everything looks good, no commit needed — just report to user**

If visual issues found, fix them in a follow-up commit.

---

## Notes for the executor

- **No unit tests:** this is a UI prototype. Visual check only. The repo has Playwright E2E but adding tests for mock data is not valuable.
- **No new dependencies:** uses existing lucide-react, framer-motion, next/image.
- **Currency:** mock data is all USD for now. The component handles ARS via `currencyLabel`.
- **Brand colors:** `magenta` and `navy*` are Tailwind tokens defined in the project.
- **Dev server port:** repo uses 3003 per previous sessions. If busy: `pkill -f "next dev"` then retry.
- **Design doc reference:** [docs/plans/2026-04-12-opportunity-cards-design.md](2026-04-12-opportunity-cards-design.md) has the full context. Read it if confused about intent.
