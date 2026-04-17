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
        serif: ["Libre Baskerville", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.12)",
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
