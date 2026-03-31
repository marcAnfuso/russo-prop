# Russo Propiedades — Premium Upgrade Design

**Date:** 2026-03-31
**Status:** Approved
**Approach:** Upgrade Integral — elevar la web existente a nivel premium sin romper lo que funciona

## Context

El dueño (Franco) aprobó la demo actual y pidió "lo mejor de lo mejor". Se analizaron 4 sitios de referencia:
- **mirandabosch.com** — estética limpia, búsqueda por keywords, poco texto
- **kelsieblevinsrealestate.com** — foco en servicio, fotos reales, TikToks, moderno
- **valentinoragolia.com** — mapa interactivo con propiedades activas
- **inevita.mx** — animaciones, video content

El equipo de Russo tiene un filmmaker (Nico) que va a generar fotos y videos profesionales. El contenido se irá actualizando progresivamente.

## Decisions

- **Chat IA:** Backlog, no es prioridad
- **Mapa:** Mantener como está, mejorar incrementalmente (recargar al mover/zoom)
- **Favoritos:** localStorage por ahora, login se evalúa después
- **Colores:** Navy + Magenta se mantienen (identidad de marca)
- **Tipografía:** Libre Baskerville (serif) para títulos + Inter para cuerpo
- **Oficina Ramos:** Backlog, sin fecha

---

## 1. Typography & Design System

### Fonts
- **Títulos (h1-h3):** Libre Baskerville (serif, Google Fonts, gratuita)
- **Cuerpo y UI:** Inter (se mantiene)

### Visual Rhythm
- Secciones alternadas: `bg-white` → `bg-navy` → `bg-white` → `bg-gray-50`
- Crea cadencia visual como Kelsie Blevins

### Property Cards — Mejoras
- **Badges:** "Venta"/"Alquiler" (ya existe) + "Nuevo" (magenta, últimos 15 días) + "Reservado" (amber)
- **Hover:** imagen zoom suave + overlay con "Ver propiedad →"
- **Favoritos:** botón corazón en esquina superior derecha (localStorage)

### Buttons
- Se mantienen como están

---

## 2. Home Page — Estructura

Orden de secciones:

1. **Hero** — video de fondo + buscador + pills (existe)
2. **Propiedades destacadas** — elegidas desde CRM (existe, 3 cards)
3. **Nuevos ingresos** — últimas propiedades ingresadas, badge "Nuevo" (nuevo)
4. **Barrios** — grid visual con foto de cada zona + cantidad de propiedades, clickeable (nuevo)
5. **Emprendimientos** — grid de cards (ya rediseñado)
6. **¿Por qué elegirnos?** — 4 valores (existe, título actualizado)
7. **Nuestro equipo** — fotos reales con nombre y rol (nuevo, placeholder hasta fotos de Nico)
8. **Google Reviews** — (existe)
9. **Footer** — (existe)

---

## 3. Property Listing & Detail

### Listado (/ventas, /alquileres)
- Split list + mapa (se mantiene)
- FilterBar: evaluar agregar "Apto crédito" si la API lo soporta
- Contador "Mostrando X de Y propiedades" (ya existe)

### Detalle (/propiedad/[id])
- Galería: grid asimétrico (1 grande + 4 chicas) en vez de carrusel lineal
- Open Graph dinámico (preview al compartir en WhatsApp con foto y precio)
- Breadcrumb completo: Inicio > Ventas > San Justo > Propiedad
- Formularios que realmente envíen (API route → email/WhatsApp)
- Propiedades similares al final (ya existe)

---

## 4. Performance & SEO

### Performance
- Hero video: comprimir, poster WebP, `preload="none"` en mobile
- Imágenes: blur placeholder (`blurDataURL`)
- Suspense en nuevos ingresos (además de featured)
- Fonts: `display=swap` + preconnect a Google Fonts

### SEO
- JSON-LD: `RealEstateAgent` en layout, `RealEstateListing` por propiedad
- Open Graph meta tags dinámicos por propiedad
- Sitemap automático con todas las propiedades
- Meta descriptions por página

### Formularios
- API route `/api/contact` — envío a email o WhatsApp Business API
- Sirve para: contacto, tasaciones, consulta desde detalle
- Validación server-side

---

## Backlog (no incluido en esta iteración)

- Chat con IA (conversacional, búsqueda natural)
- Login de usuarios + favoritos persistentes
- Oficina Ramos Mejía (sin fecha)
- Mapa "buscar en esta zona" (mejora incremental)
- Virtual tours / 360°
- Embeds de Instagram/TikTok (cuando haya contenido)
