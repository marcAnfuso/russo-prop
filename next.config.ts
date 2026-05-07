import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
