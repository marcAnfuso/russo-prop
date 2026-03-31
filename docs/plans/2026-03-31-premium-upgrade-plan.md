# Premium Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevar Russo Propiedades a nivel premium: tipografía serif, secciones nuevas en home, cards mejoradas, favoritos, SEO, performance, y formularios funcionales.

**Architecture:** Mejoras incrementales sobre la base existente (Next.js 16 App Router + Xintel API). Cada task es un commit atómico. Branch `feat/premium-upgrade` para no romper master.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Framer Motion, Libre Baskerville (Google Fonts), localStorage (favoritos)

---

## Pre-requisito: Branch

**Step 1: Crear branch**
```bash
git checkout -b feat/premium-upgrade
```

---

### Task 1: Tipografía — Libre Baskerville

**Files:**
- Modify: `app/globals.css:1` (font import)
- Modify: `tailwind.config.ts:38-40` (fontFamily)
- Modify: `app/layout.tsx:19` (body class)

**Step 1: Agregar import de Libre Baskerville en globals.css**

En `app/globals.css`, línea 1, cambiar el import de fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Libre+Baskerville:wght@400;700&display=swap');
```

**Step 2: Agregar fontFamily en tailwind.config.ts**

En `tailwind.config.ts`, dentro de `theme.extend.fontFamily`:
```ts
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  serif: ["Libre Baskerville", "Georgia", "serif"],
},
```

**Step 3: Aplicar font-serif a todos los headings globalmente**

En `app/globals.css`, agregar regla:
```css
h1, h2, h3 {
  font-family: 'Libre Baskerville', Georgia, serif;
}
```

**Step 4: Verificar visualmente**

Abrir localhost y verificar que los títulos usan Libre Baskerville y el cuerpo sigue en Inter.

**Step 5: Commit**
```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: add Libre Baskerville serif font for headings"
```

---

### Task 2: Property Cards — Badges y hover mejorado

**Files:**
- Modify: `components/PropertyCard.tsx`
- Modify: `data/types.ts` (agregar campo `createdAt` si no existe)

**Step 1: Agregar badge "Nuevo" y "Reservado"**

En `components/PropertyCard.tsx`, después del badge de operación (línea ~56), agregar badges condicionales:
- "Nuevo": si la propiedad fue publicada en los últimos 15 días (usar `createdAt` o algún campo de la API)
- "Reservado": si `price === 9999999` (ya se muestra "Reservado" en precio, agregar badge visual también)

```tsx
{price === 9999999 && (
  <span className="absolute top-3 right-3 z-20 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white bg-amber-500 backdrop-blur-sm">
    Reservado
  </span>
)}
```

**Step 2: Mejorar hover de la card**

Agregar overlay en hover sobre la imagen:
```tsx
<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
  <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    Ver propiedad →
  </span>
</div>
```

**Step 3: Verificar visualmente**

Abrir listado de propiedades, verificar badges y hover.

**Step 4: Commit**
```bash
git add components/PropertyCard.tsx
git commit -m "feat: add status badges and improved hover on property cards"
```

---

### Task 3: Favoritos con localStorage

**Files:**
- Create: `lib/favorites.ts`
- Create: `components/FavoriteButton.tsx`
- Modify: `components/PropertyCard.tsx` (agregar botón)
- Create: `app/favoritos/page.tsx` (página de favoritos)

**Step 1: Crear hook de favoritos**

`lib/favorites.ts`:
```ts
"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "russo-favoritos";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
```

**Step 2: Crear componente FavoriteButton**

`components/FavoriteButton.tsx`:
```tsx
"use client";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";

export default function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { toggle, isFavorite } = useFavorites();
  const active = isFavorite(propertyId);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(propertyId); }}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
    >
      <Heart className={`h-4 w-4 transition-colors ${active ? "fill-magenta text-magenta" : "text-navy-300"}`} />
    </button>
  );
}
```

**Step 3: Agregar FavoriteButton en PropertyCard**

En `components/PropertyCard.tsx`, dentro del div de la imagen, agregar `<FavoriteButton propertyId={id} />`.

**Step 4: Crear página /favoritos**

`app/favoritos/page.tsx`: página client-side que lee localStorage, fetchea las propiedades por ID y las muestra en grid.

**Step 5: Verificar**

Clickear corazón, recargar página, verificar que persiste. Ir a /favoritos y ver las guardadas.

**Step 6: Commit**
```bash
git add lib/favorites.ts components/FavoriteButton.tsx components/PropertyCard.tsx app/favoritos/
git commit -m "feat: add favorites with localStorage and favorites page"
```

---

### Task 4: Sección "Nuevos Ingresos" en Home

**Files:**
- Create: `components/NewListings.tsx`
- Modify: `app/page.tsx` (agregar sección)
- Modify: `lib/xintel.ts` (nueva función `fetchLatestProperties`)

**Step 1: Agregar función en xintel.ts**

```ts
export async function fetchLatestProperties(): Promise<Property[]> {
  const { properties } = await fetchProperties({ page: 1 });
  return properties.slice(0, 6);
}
```

Las propiedades de la API ya vienen ordenadas por fecha (las más nuevas primero).

**Step 2: Crear componente NewListings**

`components/NewListings.tsx`: Similar a FeaturedProperties pero con título "Nuevos ingresos" y badge "Nuevo" en cada card. Grid de 3 columnas, sección con fondo `bg-gray-50`.

**Step 3: Agregar en page.tsx con Suspense**

En `app/page.tsx`, entre FeaturedProperties y Barrios:
```tsx
<Suspense fallback={<NewListingsSkeleton />}>
  <NewListingsLoader />
</Suspense>
```

**Step 4: Verificar visualmente**

**Step 5: Commit**
```bash
git add components/NewListings.tsx app/page.tsx lib/xintel.ts
git commit -m "feat: add new listings section to home page"
```

---

### Task 5: Sección "Barrios" en Home

**Files:**
- Create: `components/NeighborhoodGrid.tsx`
- Create: `data/neighborhoods.ts` (datos de barrios con imágenes placeholder)
- Modify: `app/page.tsx`

**Step 1: Crear data de barrios**

`data/neighborhoods.ts`: Array con nombre, slug, imagen placeholder, y descripción corta para cada barrio principal (San Justo, Ramos Mejía, Ciudadela, Haedo, etc.).

**Step 2: Crear componente NeighborhoodGrid**

Grid responsive de cards. Cada card tiene:
- Imagen de fondo (placeholder por ahora, Nico saca fotos después)
- Nombre del barrio
- Overlay oscuro con texto
- Link a `/ventas?zona=NombreBarrio`

Estilo: grid 2x3 o 3x3, sección fondo blanco, título "Explorá por barrio".

**Step 3: Agregar en page.tsx**

Después de NewListings, antes de Emprendimientos.

**Step 4: Verificar**

**Step 5: Commit**
```bash
git add components/NeighborhoodGrid.tsx data/neighborhoods.ts app/page.tsx
git commit -m "feat: add neighborhood grid section to home page"
```

---

### Task 6: Sección "Nuestro Equipo" en Home

**Files:**
- Create: `components/TeamSection.tsx`
- Create: `data/team.ts`
- Modify: `app/page.tsx`

**Step 1: Crear data del equipo**

`data/team.ts`: Array con nombre, rol, foto (placeholder por ahora). Franco como primer miembro.

**Step 2: Crear componente TeamSection**

Sección con fondo `bg-gray-50`. Grid de cards circulares con foto, nombre y rol debajo. Framer Motion stagger animation.

**Step 3: Agregar en page.tsx**

Después de WhyRusso, antes de GoogleReviews.

**Step 4: Commit**
```bash
git add components/TeamSection.tsx data/team.ts app/page.tsx
git commit -m "feat: add team section to home page"
```

---

### Task 7: Galería asimétrica en detalle de propiedad

**Files:**
- Modify: `components/Gallery.tsx`

**Step 1: Rediseñar layout de galería**

Cambiar de carrusel lineal a grid asimétrico:
- Desktop: 1 imagen grande (2/3 ancho) + 2 chicas apiladas (1/3) en primera fila, 2 más abajo
- Mobile: mantener carrusel swipeable
- Click en cualquier imagen abre lightbox (ya existe)

**Step 2: Verificar en detalle de propiedad**

**Step 3: Commit**
```bash
git add components/Gallery.tsx
git commit -m "feat: asymmetric gallery grid on property detail"
```

---

### Task 8: Open Graph dinámico por propiedad

**Files:**
- Modify: `app/propiedad/[id]/page.tsx` (agregar `generateMetadata`)
- Modify: `app/ventas/page.tsx` (mejorar metadata)
- Modify: `app/alquileres/page.tsx` (mejorar metadata)

**Step 1: Agregar generateMetadata en propiedad/[id]**

```ts
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchProperty(id);
  if (!property) return { title: "Propiedad no encontrada" };

  const priceLabel = property.price === 9999999
    ? "Reservado"
    : `${property.currency === "ARS" ? "$" : "USD"} ${property.price.toLocaleString("es-AR")}`;

  return {
    title: `${property.title} | Russo Propiedades`,
    description: `${property.type} en ${property.operation} — ${priceLabel} — ${property.address}, ${property.locality}`,
    openGraph: {
      title: `${priceLabel} — ${property.address}`,
      description: property.description?.slice(0, 160),
      images: property.images[0] ? [{ url: property.images[0] }] : [],
    },
  };
}
```

**Step 2: Verificar con WhatsApp**

Compartir link de una propiedad y verificar que aparece preview con foto y precio.

**Step 3: Commit**
```bash
git add app/propiedad/[id]/page.tsx app/ventas/page.tsx app/alquileres/page.tsx
git commit -m "feat: dynamic Open Graph metadata for property sharing"
```

---

### Task 9: JSON-LD structured data para SEO

**Files:**
- Modify: `app/layout.tsx` (agregar RealEstateAgent schema)
- Modify: `app/propiedad/[id]/page.tsx` (agregar RealEstateListing schema)

**Step 1: Agregar RealEstateAgent en layout.tsx**

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Russo Propiedades",
  url: "https://russopropiedades.com.ar",
  telephone: "+54 11 4651 4024",
  address: { "@type": "PostalAddress", streetAddress: "Av. Pte J. D. Perón 3501", addressLocality: "San Justo", addressRegion: "Buenos Aires", addressCountry: "AR" },
}) }} />
```

**Step 2: Agregar RealEstateListing en detalle**

Schema con precio, dirección, fotos, tipo de propiedad.

**Step 3: Commit**
```bash
git add app/layout.tsx app/propiedad/[id]/page.tsx
git commit -m "feat: add JSON-LD structured data for SEO"
```

---

### Task 10: Formularios funcionales (API route)

**Files:**
- Create: `app/api/contact/route.ts`
- Modify: `components/ContactSidebar.tsx` (wire up form)
- Modify: `app/contacto/page.tsx` (wire up form)
- Modify: `app/tasaciones/page.tsx` (wire up form)

**Step 1: Crear API route /api/contact**

Recibe: nombre, email, teléfono, mensaje, propertyCode (opcional), tipo (contacto/tasacion/consulta).
Envía email vía Resend o similar (o como mínimo guarda en un log y envía notificación por WhatsApp).

**Step 2: Conectar formularios existentes**

Los 3 formularios ya tienen la UI completa. Solo falta el `fetch("/api/contact", { method: "POST", body })` en cada `handleSubmit`.

**Step 3: Verificar envío**

**Step 4: Commit**
```bash
git add app/api/contact/route.ts components/ContactSidebar.tsx app/contacto/page.tsx app/tasaciones/page.tsx
git commit -m "feat: functional contact forms with API route"
```

---

### Task 11: Performance — Hero video y fonts

**Files:**
- Modify: `components/Hero.tsx` (poster, preload=none en mobile)
- Modify: `app/layout.tsx` (preconnect fonts)
- Modify: `app/globals.css` (font-display: swap)

**Step 1: Optimizar Hero video**

```tsx
<video
  autoPlay muted loop playsInline
  poster="/images/hero-poster.webp"
  preload="metadata"
  className="absolute inset-0 w-full h-full object-cover"
>
```

Generar un frame poster en WebP del video para mostrar mientras carga.

**Step 2: Preconnect fonts en layout.tsx**

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

**Step 3: Verificar con Lighthouse**

**Step 4: Commit**
```bash
git add components/Hero.tsx app/layout.tsx app/globals.css
git commit -m "perf: optimize hero video loading and font preconnect"
```

---

### Task 12: Sitemap automático

**Files:**
- Create: `app/sitemap.ts`

**Step 1: Crear sitemap dinámico**

```ts
import { fetchPropertyIds } from "@/lib/xintel";
import type { MetadataRoute } from "next";

const BASE = "https://russopropiedades.com.ar";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await fetchPropertyIds();
  const properties = ids.map((id) => ({
    url: `${BASE}/propiedad/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily" },
    { url: `${BASE}/ventas`, lastModified: new Date(), changeFrequency: "daily" },
    { url: `${BASE}/alquileres`, lastModified: new Date(), changeFrequency: "daily" },
    { url: `${BASE}/emprendimientos`, lastModified: new Date(), changeFrequency: "weekly" },
    { url: `${BASE}/tasaciones`, lastModified: new Date(), changeFrequency: "monthly" },
    { url: `${BASE}/contacto`, lastModified: new Date(), changeFrequency: "monthly" },
    ...properties,
  ];
}
```

**Step 2: Verificar accediendo a /sitemap.xml**

**Step 3: Commit**
```bash
git add app/sitemap.ts
git commit -m "feat: add dynamic sitemap for SEO"
```

---

### Task 13: Limpieza — eliminar font-preview

**Files:**
- Delete: `app/font-preview/` (página temporal de preview de fonts)

**Step 1: Eliminar**
```bash
rm -rf app/font-preview
```

**Step 2: Commit**
```bash
git commit -am "chore: remove font preview page"
```

---

## Orden de ejecución recomendado

| # | Task | Dependencia |
|---|------|-------------|
| 1 | Tipografía | Ninguna — base para todo |
| 2 | Cards badges/hover | Ninguna |
| 3 | Favoritos localStorage | Task 2 (card) |
| 4 | Nuevos ingresos | Task 1 (font) |
| 5 | Barrios | Ninguna |
| 6 | Equipo | Ninguna |
| 7 | Galería asimétrica | Ninguna |
| 8 | Open Graph | Ninguna |
| 9 | JSON-LD SEO | Ninguna |
| 10 | Formularios | Ninguna |
| 11 | Performance | Task 1 (fonts) |
| 12 | Sitemap | Ninguna |
| 13 | Limpieza | Al final |

**Tasks parallelizables:** 2+5+6+7+8+9+10+12 son todas independientes entre sí.
