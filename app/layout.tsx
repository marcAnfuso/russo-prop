import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";

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
      <body>
        <Navbar />
        {children}
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
