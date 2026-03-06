import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Russo Propiedades",
  description: "Tu hogar ideal te espera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
