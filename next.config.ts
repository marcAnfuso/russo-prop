import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * El deploy de Vercel (russo-prop.vercel.app) respondía 200 y servía una
   * copia entera del sitio: un duplicado indexable compitiendo con el
   * dominio real. Encima, hasta 2026-09 el canonical de todas las páginas
   * apuntaba ahí, o sea que le señalábamos a Google que el sitio bueno era
   * ese.
   *
   * Va acá y no en un middleware a propósito: Vercel resuelve los redirects
   * del config en la capa de routing, sin invocar una función por request
   * (el middleware se factura por invocación y esto pega en TODO el tráfico).
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "russo-prop.vercel.app" }],
        destination: "https://www.russopropiedades.com.ar/:path*",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-images.xintelweb.com",
        pathname: "/upload/**",
      },
    ],
    // Reducimos las variantes que genera Next/Image para no inflar
    // el consumo de Image Optimization (era el 83% de la factura
    // de Vercel en mayo 2026).
    //
    // Defaults eran 8 deviceSizes + 8 imageSizes = hasta 16 variantes
    // por imagen. Cubrimos mobile, tablet y desktop común con menos
    // tamaños y dejamos solo webp (avif duplicaba el cost por imagen).
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/webp"],
    qualities: [75],
    // Cache de 1 año en el CDN · evita re-transformations innecesarias
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
};

export default nextConfig;
