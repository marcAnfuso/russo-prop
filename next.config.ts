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
  },
};

export default nextConfig;
