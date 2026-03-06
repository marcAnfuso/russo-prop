# Russo Propiedades - Website Redesign (Demo)

## Objetivo

Demo estatica para presentar al dueño de Russo Propiedades. Sitio moderno estilo RE/MAX 2026, con identidad de marca Russo. Datos reales de sus propiedades, mockeados en el frontend.

## Stack

- **Framework**: Next.js 14+ (App Router, static export)
- **Estilos**: Tailwind CSS con paleta custom
- **Mapa**: Leaflet (open source)
- **Animaciones**: Framer Motion (sutiles)
- **Iconos**: Lucide Icons
- **Datos**: Mock en `/data/properties.ts`
- **Deploy**: Vercel (static)

## Paleta de colores

| Token | Color | Uso |
|-------|-------|-----|
| `navy` | `#1a2251` (aprox) | Fondo navbar, textos, footer, secciones oscuras |
| `magenta` | `#e6007e` | CTAs, botones, acentos, badges |
| `white` | `#ffffff` | Fondos principales, textos sobre oscuro |
| `gray-50` | `#f8f9fa` | Fondos alternados de secciones |

## Estructura de paginas

| Ruta | Descripcion |
|------|-------------|
| `/` | Home |
| `/ventas` | Listado ventas con filtros + mapa |
| `/alquileres` | Listado alquileres con filtros + mapa |
| `/emprendimientos` | Listado emprendimientos con filtros por estado |
| `/propiedad/[id]` | Detalle de propiedad |
| `/emprendimiento/[id]` | Detalle de emprendimiento |
| `/tasaciones` | Formulario "Quiero vender" |
| `/contacto` | Contacto + mapa oficina |

## Componentes compartidos

- `Navbar` — Logo + nav + tel/email. Sticky, se achica al scrollear.
- `Footer` — Contacto, links utiles, ultimas propiedades, redes sociales.
- `WhatsAppFAB` — Boton flotante verde, siempre visible. Chat directo a +54 11 4651 4024.
- `PropertyCard` — Card reutilizable horizontal: foto, precio, iconos caracteristicas, botones WhatsApp/tel/email.
- `DevelopmentCard` — Card emprendimiento: foto, badge estado, fecha entrega, rango precios, unidades, ambientes.
- `SearchBar` — Busqueda progresiva: operacion (pills) -> zona (autocomplete con chips) -> tipo propiedad.
- `FilterBar` — Filtros sticky: zona chips, tipo, operacion, precio, boton "Filtros" expandible.
- `MapView` — Mapa Leaflet con markers. Hover en card resalta marker. Click en marker muestra popup.
- `Gallery` — Imagen principal + thumbnails lateral. Tabs: Fotos/Video/Mapa. Lightbox fullscreen.
- `ContactSidebar` — Sidebar sticky: botones WhatsApp/tel/email, datos Russo, formulario contacto.
- `GoogleReviews` — Seccion de reseñas mock con estrellas y testimonios.

## Paginas - Detalle

### Home (`/`)

1. **Hero** (full viewport)
   - Imagen lifestyle de fondo
   - Slogan
   - 4 botones pill: Quiero comprar | Quiero alquilar | Quiero vender | Emprendimientos
   - Seleccionado = magenta filled, resto = borde blanco
   - Barra busqueda: input zona + dropdown tipo + lupa magenta
   - Zona como chip removible

2. **Propiedades Destacadas**
   - Grid 3 cards con propiedades reales de Russo
   - PropertyCard: foto, precio USD, direccion, iconos, boton WhatsApp

3. **Emprendimientos Destacados**
   - Layout alternado imagen/texto (estilo RE/MAX Collection)
   - Vico Park, Av. Santamaria, Mendoza 2263
   - CTA "Ver emprendimiento" magenta

4. **Por que Russo?**
   - 3-4 cards con iconos: experiencia, tecnologia, equipo joven, honestidad

5. **Reseñas Google** (mock)
   - Rating promedio 4.8 estrellas
   - 3 testimonios con nombre, foto placeholder, texto, estrellas

6. **Footer**

### Busqueda / Resultados (`/ventas`, `/alquileres`)

- **FilterBar** sticky arriba
- **Split-view**: listado 60% izquierda + mapa 40% derecha
- Cards horizontales: foto izquierda, datos derecha (precio USD, direccion, iconos m2/ambientes/baños, botones contacto)
- Contador: "X propiedades en [zona]"
- Ordenar por: relevancia, precio, mas recientes
- Mobile: mapa oculto, boton flotante "Ver mapa" -> fullscreen

### Emprendimientos (`/emprendimientos`)

- FilterBar con filtros por estado (Pre Venta / Pozo / En Construccion / Terminado) como toggles
- Cards horizontales: foto, badge estado + fecha entrega, rango precios "Desde X / Hasta Y" USD, direccion, rango ambientes, unidades disponibles, botones contacto

### Detalle propiedad (`/propiedad/[id]`)

- Breadcrumb
- Titulo + favorito + compartir
- Gallery: imagen principal + thumbnails derecha, tabs Fotos/Video/Mapa, lightbox
- Sidebar derecha sticky: botones WhatsApp/tel/email, datos Russo, formulario contacto
- Badge operacion (Venta/Alquiler)
- Precio grande USD
- Grid caracteristicas con iconos: m2 totales, cubiertos, terreno, ambientes, baños, cochera, dormitorios, antiguedad
- Descripcion expandible
- Caracteristicas detalladas (piscina, agua corriente, gas, etc.)
- Seccion ubicacion con mapa Leaflet
- Propiedades similares: 3 cards abajo

### Detalle emprendimiento (`/emprendimiento/[id]`)

- Igual que propiedad pero con:
  - Badge estado + fecha entrega
  - Rango precios "Desde X hasta Y" USD
  - Datos en rangos: unidades, m2, ambientes, baños
  - Amenities del edificio

### Tasaciones (`/tasaciones`)

- Split-screen: formulario izquierda + imagen derecha
- Campos: nombre, email, telefono, direccion propiedad, tipo, comentarios
- CTA "Solicitar tasacion gratuita" magenta

### Contacto (`/contacto`)

- Split-screen: formulario izquierda + mapa oficina (Leaflet) derecha
- 3 cards arriba: ubicacion, email, telefono
- Campos: nombre, email, telefono, direccion, categoria "como nos conociste", mensaje

## Mejoras sobre RE/MAX

- **WhatsApp directo en TODAS las vistas** (cards de listado + detalle + FAB global), no solo en detalle
- **Mapa en contacto**: RE/MAX solo pone branding, nosotros ponemos mapa real de la oficina
- **Reseñas Google en Home**: RE/MAX no las muestra, nosotros si para generar confianza
- **Seccion "Por que Russo?"**: diferenciador que RE/MAX no tiene a nivel sucursal
- **Emprendimientos como seccion premium** en el home con layout editorial
- **Animaciones sutiles** con Framer Motion en scroll (RE/MAX es bastante estatico)

## Datos de contacto

- Telefono/WhatsApp: +54 11 4651 4024
- Email: info@russopropiedades.com.ar
- Direccion: Av. Pte J. D. Peron 3501, San Justo, Buenos Aires
- Logo: placeholder (pendiente de diseño)
