import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";

export const metadata: Metadata = {
  title: "Russo Propiedades",
  description: "Tu hogar ideal te espera",
  icons: { icon: "/images/logo-icon.webp" },
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
        <div className="pt-[72px]">{children}</div>
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
