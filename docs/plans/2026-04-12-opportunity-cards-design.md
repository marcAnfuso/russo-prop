# Opportunity Cards — Design Doc

**Date:** 2026-04-12
**Status:** Approved for prototype
**Owner:** Russo Propiedades

## Context

Russo padre quiere algo "callativo y PRO" para diferenciar el sitio. La idea: mostrar propiedades que bajaron de precio recientemente, posicionando a Russo como asesor que conoce el mercado y ayuda a cazar oportunidades.

El feature completo requiere infraestructura de tracking histórico (snapshots diarios + DB), que hoy no tenemos. Por eso se hace en dos fases:

1. **Fase A (este doc):** Prototipo visual con data simulada para validar UX
2. **Fase B (futuro, si aprueba):** Infraestructura real de tracking

## Goals

- Validar visualmente cómo se ven las "Oportunidades" en el sitio
- Obtener feedback del dueño antes de invertir en infraestructura de tracking
- Reutilizar estilos existentes (navy/magenta brand, PropertyCard layout)

## Non-Goals

- Tracking real de precios (Fase B)
- Base de datos o snapshots (Fase B)
- Cron jobs (Fase B)
- Alertas por email cuando baja una property (separado, discutido antes)

## Design

### Componente: `OpportunityCard`

Variante de `PropertyCard` con timeline de cambios de precio.

```
┌────────────────────────────────────┐
│ [imagen property]                  │
│ 🔥 OPORTUNIDAD                     │
│                                    │
│ Casa en San Justo                  │
│ 3 amb · 120m² · 2 baños            │
│                                    │
│ USD 112.000  ↓ 7% (−$8.000)        │
│ ├─ Hoy: USD 112.000                │
│ ├─ Hace 5 días: USD 115.000        │
│ └─ Hace 12 días: USD 120.000       │
│                                    │
│ [Ver propiedad →]                  │
└────────────────────────────────────┘
```

**Elementos visuales:**
- Badge "🔥 OPORTUNIDAD" en magenta (top-left sobre imagen)
- Flecha ↓ verde para bajas de precio
- Timeline con líneas conectoras (tipo git log)
- Precio actual grande, precios anteriores en gris

### Mock Data

Agregar campo opcional `priceHistory` al tipo `Property`:

```ts
interface PriceHistoryEntry {
  price: number;
  currency: "USD" | "ARS";
  date: string; // ISO
}

interface Property {
  // ... existing fields
  priceHistory?: PriceHistoryEntry[];
}
```

Para el prototipo, se genera mock data hardcodeada seleccionando 4-6 properties reales de Xintel y simulando un historial plausible.

### Ubicación en el Sitio

**Home page** — nueva sección entre "Propiedades destacadas" y "Emprendimientos":

- Título: "🔥 Oportunidades"
- Subtítulo: "Propiedades con bajas de precio recientes"
- Grid: 3 columnas en desktop, 1 en mobile
- Background: sutil diferenciación (gradient o bg-gray-50) para destacar del resto

### Data Flow (Fase A — Mockeado)

```
Home page
  └─ FeaturedOpportunities component
       └─ reads mock data from /data/mock-opportunities.ts
            └─ merges with fetchFeaturedProperties() from Xintel
                 └─ renders OpportunityCard[] with priceHistory
```

### Componentes Nuevos

1. **`components/OpportunityCard.tsx`** — Card variant con timeline
2. **`components/FeaturedOpportunities.tsx`** — Section wrapper (heading + grid)
3. **`data/mock-opportunities.ts`** — Mock price history

### Componentes Modificados

- **`data/types.ts`** — agregar `priceHistory?: PriceHistoryEntry[]`
- **`app/page.tsx`** — insertar `<FeaturedOpportunities />` en el layout

## Testing

- Visual inspection en home page
- Responsive check (mobile/tablet/desktop)
- Verificar que el link a detalle funciona
- Confirmar que el componente NO rompe si `priceHistory` es `undefined`

## Risk & Rollback

- **Risk:** bajo — es solo UI adicional, sin cambios en data layer real
- **Rollback:** remover el import y el component call en `app/page.tsx`

## Fase B (Futuro)

Si se aprueba el prototipo, Fase B incluye:

1. **Storage:** Vercel KV / Upstash Redis / Supabase (free tier)
2. **Snapshot job:** Vercel Cron diario que fetchea todas las properties y guarda precio
3. **Diff logic:** Query que compara snapshots últimos 30 días y detecta bajas
4. **API endpoint:** `/api/opportunities` que devuelve properties con `priceHistory` real
5. **Threshold config:** mínimo de baja para considerar "oportunidad" (ej: >2% o >$1000)
6. **Waiting period:** 2-4 semanas de data antes de launch público

Se necesitan ~4-8 horas de trabajo para Fase B dependiendo del storage elegido.
