# Russo Propiedades Website - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static demo website for Russo Propiedades, modern RE/MAX-style, with Next.js + Tailwind.

**Architecture:** Next.js 14 App Router with static export. All data lives in TypeScript files under `/data/`. Leaflet for maps, Framer Motion for animations. Pages use shared components (Navbar, Footer, WhatsAppFAB, PropertyCard, etc.).

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript, Leaflet, Framer Motion, Lucide Icons

---

## Phase 1: Project Setup & Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/globals.css`

**Step 1: Create Next.js app**

Run:
```bash
cd /home/marc/russo-prop
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

**Step 2: Install dependencies**

Run:
```bash
npm install framer-motion lucide-react leaflet react-leaflet
npm install -D @types/leaflet
```

**Step 3: Configure Tailwind custom palette**

Edit `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a2251",
          50: "#f0f1f8",
          100: "#d4d7eb",
          200: "#a9afd7",
          300: "#7e87c3",
          400: "#535faf",
          500: "#2d3a8c",
          600: "#1a2251",
          700: "#141a3d",
          800: "#0e1229",
          900: "#070914",
        },
        magenta: {
          DEFAULT: "#e6007e",
          50: "#fef0f7",
          100: "#fdd1e8",
          200: "#fba3d1",
          300: "#f975ba",
          400: "#f247a3",
          500: "#e6007e",
          600: "#b80065",
          700: "#8a004c",
          800: "#5c0032",
          900: "#2e0019",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 4: Set up global styles in `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@layer base {
  body {
    @apply text-navy font-sans antialiased;
  }
}

@layer components {
  .btn-magenta {
    @apply bg-magenta text-white font-semibold px-6 py-3 rounded-full hover:bg-magenta-600 transition-colors duration-200;
  }
  .btn-outline-white {
    @apply border-2 border-white text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors duration-200;
  }
  .btn-outline-magenta {
    @apply border-2 border-magenta text-magenta font-semibold px-6 py-3 rounded-full hover:bg-magenta hover:text-white transition-colors duration-200;
  }
}
```

**Step 5: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Next.js project with Tailwind custom palette"
```

---

### Task 2: Mock data layer

**Files:**
- Create: `data/properties.ts`
- Create: `data/developments.ts`
- Create: `data/reviews.ts`
- Create: `data/types.ts`

**Step 1: Create types**

Create `data/types.ts`:
```ts
export type OperationType = "venta" | "alquiler";
export type PropertyType = "casa" | "departamento" | "ph" | "terreno" | "cochera" | "local" | "oficina" | "edificio";
export type DevelopmentStatus = "pre-venta" | "pozo" | "en-construccion" | "terminado";

export interface Property {
  id: string;
  code: string; // e.g. "RUS10073"
  title: string;
  operation: OperationType;
  type: PropertyType;
  price: number; // USD
  address: string;
  locality: string; // e.g. "San Justo"
  district: string; // e.g. "La Matanza"
  description: string;
  features: {
    totalArea?: number;
    coveredArea?: number;
    landArea?: number;
    rooms?: number;
    bathrooms?: number;
    bedrooms?: number;
    garage?: number;
    age?: number;
  };
  amenities: string[];
  images: string[];
  videoUrl?: string;
  location: { lat: number; lng: number };
  featured: boolean;
}

export interface Development {
  id: string;
  code: string;
  name: string;
  address: string;
  locality: string;
  district: string;
  description: string;
  status: DevelopmentStatus;
  deliveryDate: string; // e.g. "12/2025"
  category: string; // e.g. "Premium"
  priceFrom: number;
  priceTo: number;
  totalUnits: number;
  availableUnits: number;
  roomsRange: string; // e.g. "1 a 4"
  areaRange: string; // e.g. "37 a 51 m2"
  coveredAreaRange: string;
  bathrooms: number;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  location: { lat: number; lng: number };
  elevators?: number;
  featured: boolean;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}
```

**Step 2: Create properties mock data**

Create `data/properties.ts` with real Russo property data from screenshots:
```ts
import { Property } from "./types";

export const properties: Property[] = [
  {
    id: "rus10073",
    code: "RUS10073",
    title: "Casa en Venta",
    operation: "venta",
    type: "casa",
    price: 120000,
    address: "Ciudadela",
    locality: "Ciudadela",
    district: "Tres de Febrero",
    description: "Hermosa casa en Ciudadela, Tres de Febrero. Excelente ubicacion, cerca de todos los servicios.",
    features: { totalArea: 180, coveredArea: 140, rooms: 4, bathrooms: 2, bedrooms: 3, garage: 1 },
    amenities: ["Gas natural", "Agua corriente", "Cloaca"],
    images: ["/images/properties/rus10073-1.jpg", "/images/properties/rus10073-2.jpg"],
    location: { lat: -34.6382, lng: -58.5269 },
    featured: true,
  },
  {
    id: "rus9707",
    code: "RUS9707",
    title: "Casa en Venta",
    operation: "venta",
    type: "casa",
    price: 95000,
    address: "San Justo",
    locality: "San Justo",
    district: "La Matanza",
    description: "Casa en San Justo, La Matanza. Ideal para familia. Ambientes amplios y luminosos.",
    features: { totalArea: 150, coveredArea: 120, rooms: 3, bathrooms: 1, bedrooms: 2, garage: 1 },
    amenities: ["Gas natural", "Agua corriente", "Cloaca"],
    images: ["/images/properties/rus9707-1.jpg", "/images/properties/rus9707-2.jpg"],
    location: { lat: -34.6833, lng: -58.5500 },
    featured: true,
  },
  {
    id: "rus9836",
    code: "RUS9836",
    title: "Casa en Venta",
    operation: "venta",
    type: "casa",
    price: 110000,
    address: "San Justo",
    locality: "San Justo",
    district: "La Matanza",
    description: "Casa en San Justo, La Matanza. Muy buena ubicacion, a pasos del centro comercial.",
    features: { totalArea: 200, coveredArea: 160, rooms: 4, bathrooms: 2, bedrooms: 3, garage: 1 },
    amenities: ["Gas natural", "Agua corriente", "Cloaca", "Calles pavimentadas"],
    images: ["/images/properties/rus9836-1.jpg", "/images/properties/rus9836-2.jpg"],
    location: { lat: -34.6850, lng: -58.5550 },
    featured: true,
  },
  {
    id: "rus-oficinas-villegas",
    code: "RUS5001",
    title: "Oficinas en Venta",
    operation: "venta",
    type: "oficina",
    price: 45000,
    address: "Villegas 2749",
    locality: "San Justo",
    district: "La Matanza",
    description: "Oficinas en venta en Villegas 2749, San Justo. 1 ambiente, frente o contrafrente, baño, 32.50 m2 a 41 m2. Excelente ubicacion.",
    features: { totalArea: 41, coveredArea: 41, rooms: 1, bathrooms: 1 },
    amenities: ["Ascensor", "Seguridad"],
    images: ["/images/properties/oficinas-villegas-1.jpg"],
    location: { lat: -34.6840, lng: -58.5580 },
    featured: false,
  },
  {
    id: "rus-depto-credito",
    code: "RUS5567",
    title: "Departamento - Apto Credito Hipotecario",
    operation: "venta",
    type: "departamento",
    price: 78000,
    address: "San Justo",
    locality: "San Justo",
    district: "La Matanza",
    description: "Departamento 2 ambientes apto credito hipotecario. 1 baño, balcon al frente, 55.50 m2.",
    features: { totalArea: 55.5, coveredArea: 55.5, rooms: 2, bathrooms: 1 },
    amenities: ["Balcon", "Apto credito"],
    images: ["/images/properties/depto-credito-1.jpg"],
    location: { lat: -34.6860, lng: -58.5520 },
    featured: false,
  },
  {
    id: "rus3372",
    code: "RUS3372",
    title: "Casa en Venta",
    operation: "venta",
    type: "casa",
    price: 250000,
    address: "San Justo",
    locality: "San Justo",
    district: "La Matanza",
    description: "Imponente casa de 4 ambientes, 5 baños, cochera, 763 m2. Propiedad premium.",
    features: { totalArea: 763, coveredArea: 400, rooms: 4, bathrooms: 5, garage: 1 },
    amenities: ["Piscina", "Jardin", "Gas natural", "Cochera"],
    images: ["/images/properties/rus3372-1.jpg"],
    location: { lat: -34.6820, lng: -58.5490 },
    featured: false,
  },
  {
    id: "rus-alq-1",
    code: "RUS8001",
    title: "Departamento en Alquiler",
    operation: "alquiler",
    type: "departamento",
    price: 450,
    address: "Av. Peron 3200",
    locality: "San Justo",
    district: "La Matanza",
    description: "Departamento 2 ambientes en alquiler. Excelente ubicacion sobre Av. Peron.",
    features: { totalArea: 48, coveredArea: 48, rooms: 2, bathrooms: 1, bedrooms: 1 },
    amenities: ["Balcon", "Agua corriente"],
    images: ["/images/properties/alq-1.jpg"],
    location: { lat: -34.6845, lng: -58.5510 },
    featured: false,
  },
  {
    id: "rus-alq-2",
    code: "RUS8002",
    title: "Casa en Alquiler",
    operation: "alquiler",
    type: "casa",
    price: 800,
    address: "Mendoza 1800",
    locality: "San Justo",
    district: "La Matanza",
    description: "Casa 3 ambientes en alquiler. Patio, cochera, excelente estado.",
    features: { totalArea: 120, coveredArea: 90, rooms: 3, bathrooms: 1, bedrooms: 2, garage: 1 },
    amenities: ["Patio", "Cochera", "Gas natural"],
    images: ["/images/properties/alq-2.jpg"],
    location: { lat: -34.6870, lng: -58.5530 },
    featured: false,
  },
];
```

**Step 3: Create developments mock data**

Create `data/developments.ts`:
```ts
import { Development } from "./types";

export const developments: Development[] = [
  {
    id: "rus19",
    code: "RUS19",
    name: "AV. SANTAMARIA 3257",
    address: "Av. Santamaria 3257",
    locality: "San Justo",
    district: "La Matanza",
    description: "Venta de Departamento 2 AMBIENTES en San Justo, La Matanza. Cuenta con cocina-comedor, baño, 1 dormitorio y balcon.",
    status: "en-construccion",
    deliveryDate: "06/2026",
    category: "Standard",
    priceFrom: 65000,
    priceTo: 95000,
    totalUnits: 24,
    availableUnits: 1,
    roomsRange: "1 a 2",
    areaRange: "35 a 55 m2",
    coveredAreaRange: "35 a 55 m2",
    bathrooms: 1,
    amenities: ["Ascensor", "Balcon", "Agua corriente", "Gas natural"],
    images: ["/images/developments/santamaria-1.jpg", "/images/developments/santamaria-2.jpg"],
    location: { lat: -34.6835, lng: -58.5545 },
    featured: true,
  },
  {
    id: "rus20",
    code: "RUS20",
    name: "VICO PARK",
    address: "Av. Rivadavia 15556",
    locality: "Haedo",
    district: "Moron",
    description: "Edificio premium en Haedo. Departamentos de 1 a 4 ambientes con amenities de primera categoria.",
    status: "terminado",
    deliveryDate: "12/2025",
    category: "Premium",
    priceFrom: 106978,
    priceTo: 178241,
    totalUnits: 19,
    availableUnits: 19,
    roomsRange: "1 a 4",
    areaRange: "37 a 80 m2",
    coveredAreaRange: "32 a 70 m2",
    bathrooms: 1,
    amenities: [
      "Area comercial", "Acceso controlado", "Cloaca", "Terraza",
      "Piscina", "Agua corriente", "Gas natural", "Porton automatico",
      "Parrilla", "Calles pavimentadas", "Vigilancia", "Ascensor",
    ],
    images: ["/images/developments/vico-park-1.jpg", "/images/developments/vico-park-2.jpg"],
    location: { lat: -34.6447, lng: -58.5920 },
    elevators: 2,
    featured: true,
  },
  {
    id: "rus14",
    code: "RUS14",
    name: "MENDOZA 2263",
    address: "Mendoza 2263",
    locality: "San Justo",
    district: "La Matanza",
    description: "Se trata de un edificio ubicado aledaño al centro comercial de San Justo, el mismo consta de planta baja y 5 pisos, con 16 departamentos distribuidos.",
    status: "en-construccion",
    deliveryDate: "03/2027",
    category: "Standard",
    priceFrom: 55000,
    priceTo: 120000,
    totalUnits: 16,
    availableUnits: 8,
    roomsRange: "1 a 3",
    areaRange: "30 a 65 m2",
    coveredAreaRange: "30 a 65 m2",
    bathrooms: 1,
    amenities: ["Ascensor", "Agua corriente", "Gas natural", "Cloaca"],
    images: ["/images/developments/mendoza-1.jpg", "/images/developments/mendoza-2.jpg"],
    location: { lat: -34.6855, lng: -58.5565 },
    featured: true,
  },
];
```

**Step 4: Create reviews mock data**

Create `data/reviews.ts`:
```ts
import { Review } from "./types";

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Maria Garcia",
    rating: 5,
    text: "Excelente atencion y profesionalismo. Nos ayudaron a encontrar nuestra casa ideal en San Justo. Muy recomendable.",
    date: "2025-11-15",
  },
  {
    id: "r2",
    name: "Carlos Rodriguez",
    rating: 5,
    text: "Vendimos nuestro departamento en tiempo record. El equipo de Russo es muy eficiente y transparente en todo el proceso.",
    date: "2025-10-22",
  },
  {
    id: "r3",
    name: "Laura Fernandez",
    rating: 4,
    text: "Muy buena experiencia comprando en el emprendimiento Vico Park. Nos asesoraron en cada paso y cumplieron con los plazos.",
    date: "2025-09-08",
  },
];

export const averageRating = 4.8;
export const totalReviews = 127;
```

**Step 5: Commit**

```bash
git add data/ && git commit -m "feat: add mock data layer with types, properties, developments, reviews"
```

---

### Task 3: Placeholder images

**Files:**
- Create: `public/images/` directories
- Create: `public/images/logo-placeholder.svg`

**Step 1: Create image directories and placeholder**

```bash
mkdir -p public/images/{properties,developments,hero}
```

Create `public/images/logo-placeholder.svg`:
```svg
<svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="60" rx="4" fill="#1a2251"/>
  <text x="100" y="28" text-anchor="middle" fill="#e6007e" font-family="Arial" font-weight="800" font-size="22">RUSSO</text>
  <text x="100" y="46" text-anchor="middle" fill="white" font-family="Arial" font-weight="400" font-size="10">Servicios Inmobiliarios</text>
</svg>
```

**Step 2: Generate placeholder property images using colored divs (handled in components)**

We'll use `https://placehold.co` URLs as image sources for the demo. No need to download.

**Step 3: Commit**

```bash
git add public/ && git commit -m "feat: add image directory structure and logo placeholder"
```

---

## Phase 2: Shared Components

### Task 4: Layout - Navbar

**Files:**
- Create: `components/Navbar.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create Navbar component**

Create `components/Navbar.tsx` — sticky navbar with logo, nav links, contact info. Shrinks on scroll. Mobile hamburger menu.

Key elements:
- Logo left
- Nav center: Inicio, Ventas, Alquileres, Emprendimientos, Tasaciones, Contacto
- Right: phone icon + number, email
- On scroll: reduce height, add shadow
- Mobile: hamburger -> slide-out menu

**Step 2: Wire into layout**

Update `app/layout.tsx` to include Navbar and set up base HTML structure.

**Step 3: Verify** — `npm run dev`, check navbar renders and scroll shrink works.

**Step 4: Commit**

```bash
git add components/Navbar.tsx app/layout.tsx && git commit -m "feat: add sticky Navbar with scroll shrink and mobile menu"
```

---

### Task 5: Layout - Footer

**Files:**
- Create: `components/Footer.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create Footer**

4-column layout:
1. Logo + description
2. Contacto (address, phone, email with icons)
3. De Utilidad (nav links: Ventas, Alquileres, Edificios, Casas, Departamentos, Locales, Oficinas)
4. Ultimas Propiedades (3 mini cards)

Bottom bar: social icons + copyright.

**Step 2: Wire into layout**

**Step 3: Verify and commit**

```bash
git add components/Footer.tsx app/layout.tsx && git commit -m "feat: add Footer with 4-column layout"
```

---

### Task 6: WhatsApp FAB

**Files:**
- Create: `components/WhatsAppFAB.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create floating WhatsApp button**

Green circle, bottom-right, fixed position, z-50. WhatsApp icon. Links to `https://wa.me/5411465140​24`. Pulse animation on idle. Tooltip on hover.

**Step 2: Wire into layout, verify, commit**

```bash
git add components/WhatsAppFAB.tsx app/layout.tsx && git commit -m "feat: add WhatsApp floating action button"
```

---

### Task 7: PropertyCard component

**Files:**
- Create: `components/PropertyCard.tsx`
- Create: `components/ContactButtons.tsx`

**Step 1: Create ContactButtons** — WhatsApp (green), phone (navy), email (gray) circular icon buttons.

**Step 2: Create PropertyCard** — Horizontal card: image left (with Next.js Image, fallback to placeholder), right side: price USD bold, address, feature icons row (m2, rooms, bathrooms, garage using Lucide icons), contact buttons.

**Step 3: Verify with a test page, commit**

```bash
git add components/PropertyCard.tsx components/ContactButtons.tsx && git commit -m "feat: add PropertyCard and ContactButtons components"
```

---

### Task 8: DevelopmentCard component

**Files:**
- Create: `components/DevelopmentCard.tsx`

**Step 1: Create DevelopmentCard** — Similar to PropertyCard but with: status badge (colored by status), delivery date badge, price range "Desde X / Hasta Y", units count, rooms range. Contact buttons.

**Step 2: Verify and commit**

```bash
git add components/DevelopmentCard.tsx && git commit -m "feat: add DevelopmentCard component"
```

---

### Task 9: SearchBar component

**Files:**
- Create: `components/SearchBar.tsx`

**Step 1: Create SearchBar** — 4 pill buttons (Quiero comprar/alquilar/vender/Emprendimientos), selected = magenta filled. Below: input "Donde queres mudarte?" with autocomplete from mock localities + dropdown "Tipo de propiedad" + magenta search button. Zone chips with X to remove.

**Step 2: Verify and commit**

```bash
git add components/SearchBar.tsx && git commit -m "feat: add SearchBar with operation pills and zone chips"
```

---

### Task 10: FilterBar component

**Files:**
- Create: `components/FilterBar.tsx`

**Step 1: Create FilterBar** — Sticky bar with: zone chips, dropdown tipo, dropdown operacion, dropdown precio (ranges), expandable "Filtros (n)" button that reveals: ambientes, baños, m2 range, cochera, antiguedad.

**Step 2: Verify and commit**

```bash
git add components/FilterBar.tsx && git commit -m "feat: add FilterBar with expandable filters"
```

---

### Task 11: MapView component

**Files:**
- Create: `components/MapView.tsx`

**Step 1: Create MapView** — Leaflet map (dynamic import with ssr: false). Accepts array of properties/developments. Custom magenta markers. Popup on click showing mini property info (image, price, address). Highlight marker on external hover event via props.

**Step 2: Verify and commit**

```bash
git add components/MapView.tsx && git commit -m "feat: add MapView component with Leaflet"
```

---

### Task 12: Gallery component

**Files:**
- Create: `components/Gallery.tsx`

**Step 1: Create Gallery** — Main image large left + thumbnail column right. Tabs: Fotos | Video | Mapa. Click thumbnail changes main. Click main opens lightbox fullscreen with prev/next arrows. Counter "1/N".

**Step 2: Verify and commit**

```bash
git add components/Gallery.tsx && git commit -m "feat: add Gallery with lightbox and tabs"
```

---

### Task 13: ContactSidebar component

**Files:**
- Create: `components/ContactSidebar.tsx`

**Step 1: Create ContactSidebar** — Sticky sidebar: ContactButtons row, Russo logo + address + phone, form (nombre, telefono, email, mensaje), CTA "Contactarse" magenta button.

**Step 2: Verify and commit**

```bash
git add components/ContactSidebar.tsx && git commit -m "feat: add ContactSidebar with form"
```

---

### Task 14: GoogleReviews component

**Files:**
- Create: `components/GoogleReviews.tsx`

**Step 1: Create GoogleReviews** — Section with Google icon, "4.8" large, star icons, "127 opiniones". 3 review cards: avatar circle placeholder, name, stars, text, date. Framer Motion fade-in on scroll.

**Step 2: Verify and commit**

```bash
git add components/GoogleReviews.tsx && git commit -m "feat: add GoogleReviews section with mock data"
```

---

## Phase 3: Pages

### Task 15: Home page

**Files:**
- Create: `app/page.tsx`
- Create: `components/Hero.tsx`
- Create: `components/FeaturedProperties.tsx`
- Create: `components/FeaturedDevelopments.tsx`
- Create: `components/WhyRusso.tsx`

**Step 1: Create Hero** — Full viewport, background image (use placeholder URL), overlay, slogan, SearchBar component.

**Step 2: Create FeaturedProperties** — "PROPIEDADES DESTACADAS" heading, grid of 3 PropertyCards (filtered by `featured: true`).

**Step 3: Create FeaturedDevelopments** — "EMPRENDIMIENTOS DESTACADOS" heading on navy background, alternating image/text layout for each featured development. CTA buttons.

**Step 4: Create WhyRusso** — "POR QUE RUSSO?" heading, 4 cards: Experiencia (Building icon), Tecnologia (Monitor icon), Equipo Joven (Users icon), Honestidad (Shield icon). Framer Motion stagger.

**Step 5: Assemble Home page** — Hero, FeaturedProperties, FeaturedDevelopments, WhyRusso, GoogleReviews.

**Step 6: Verify and commit**

```bash
git add app/page.tsx components/Hero.tsx components/FeaturedProperties.tsx components/FeaturedDevelopments.tsx components/WhyRusso.tsx && git commit -m "feat: build Home page with all sections"
```

---

### Task 16: Search results page (Ventas / Alquileres)

**Files:**
- Create: `app/ventas/page.tsx`
- Create: `app/alquileres/page.tsx`
- Create: `components/PropertyListWithMap.tsx`

**Step 1: Create PropertyListWithMap** — Shared component. FilterBar on top. Split view: left 60% scrollable list of PropertyCards, right 40% sticky MapView. Counter + sort dropdown. Filtering logic on mock data. Mobile: map hidden, "Ver mapa" FAB.

**Step 2: Create ventas page** — Uses PropertyListWithMap filtered to `operation: "venta"`.

**Step 3: Create alquileres page** — Same, filtered to `operation: "alquiler"`.

**Step 4: Verify and commit**

```bash
git add app/ventas/ app/alquileres/ components/PropertyListWithMap.tsx && git commit -m "feat: add Ventas and Alquileres pages with split-view map"
```

---

### Task 17: Emprendimientos listing page

**Files:**
- Create: `app/emprendimientos/page.tsx`

**Step 1: Create emprendimientos page** — FilterBar with status toggles (Pre Venta / Pozo / En Construccion / Terminado). List of DevelopmentCards. Filter by status client-side.

**Step 2: Verify and commit**

```bash
git add app/emprendimientos/ && git commit -m "feat: add Emprendimientos listing page with status filters"
```

---

### Task 18: Property detail page

**Files:**
- Create: `app/propiedad/[id]/page.tsx`
- Create: `components/Breadcrumb.tsx`
- Create: `components/SimilarProperties.tsx`

**Step 1: Create Breadcrumb** — Comprar > Casa > San Justo > RUS10073. Auto-generated from property data.

**Step 2: Create SimilarProperties** — "Propiedades similares" heading + 3 PropertyCards (same locality or type).

**Step 3: Create property detail page** — Breadcrumb, title + share/fav, Gallery, badge + price + features grid, description expandable, amenities grid, location MapView (single marker), ContactSidebar, SimilarProperties.

**Step 4: Verify and commit**

```bash
git add app/propiedad/ components/Breadcrumb.tsx components/SimilarProperties.tsx && git commit -m "feat: add property detail page"
```

---

### Task 19: Development detail page

**Files:**
- Create: `app/emprendimiento/[id]/page.tsx`

**Step 1: Create development detail page** — Similar to property but with: status + delivery date badges, price range, units/area/rooms in ranges, amenities grid with icons, single-marker map, ContactSidebar.

**Step 2: Verify and commit**

```bash
git add app/emprendimiento/ && git commit -m "feat: add development detail page"
```

---

### Task 20: Tasaciones page

**Files:**
- Create: `app/tasaciones/page.tsx`

**Step 1: Create tasaciones page** — Split-screen. Left: heading "Vende tu propiedad", subtitle, form (nombre, email, telefono, direccion, tipo dropdown, comentarios), CTA "Solicitar tasacion gratuita" magenta. Right: large property image placeholder.

**Step 2: Verify and commit**

```bash
git add app/tasaciones/ && git commit -m "feat: add Tasaciones page with split-screen form"
```

---

### Task 21: Contacto page

**Files:**
- Create: `app/contacto/page.tsx`

**Step 1: Create contacto page** — Top: 3 icon cards (location, email, phone). Split-screen: form left (nombre, email, telefono, direccion, "como nos conociste" dropdown, mensaje), Leaflet map right centered on Av. Pte J. D. Peron 3501 San Justo.

**Step 2: Verify and commit**

```bash
git add app/contacto/ && git commit -m "feat: add Contacto page with form and office map"
```

---

## Phase 4: Polish & Responsive

### Task 22: Responsive design pass

**Step 1:** Test all pages at mobile (375px), tablet (768px), desktop (1280px+).

**Step 2:** Fix any responsive issues: stack columns on mobile, hide map on mobile search, adjust font sizes, ensure touch targets are 44px+.

**Step 3: Commit**

```bash
git add -A && git commit -m "fix: responsive design pass for mobile/tablet/desktop"
```

---

### Task 23: Framer Motion animations

**Step 1:** Add scroll-triggered fade-in animations to: FeaturedProperties, FeaturedDevelopments, WhyRusso, GoogleReviews sections. Page transition fade. Navbar shrink animation. Card hover scale.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Framer Motion scroll animations and transitions"
```

---

### Task 24: Final build & verify

**Step 1:** Run `npm run build` and fix any errors.

**Step 2:** Run `npm run start` and do a full walkthrough of all pages.

**Step 3:** Verify Lighthouse score (aim for 90+ performance).

**Step 4: Commit**

```bash
git add -A && git commit -m "chore: final build verification and fixes"
```
