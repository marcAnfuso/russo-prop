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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Russo Propiedades",
              url: "https://russopropiedades.com.ar",
              telephone: "+54 11 4651 4024",
              email: "info@russopropiedades.com.ar",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Av. Pte J. D. Perón 3501",
                addressLocality: "San Justo",
                addressRegion: "Buenos Aires",
                addressCountry: "AR",
              },
              description:
                "Servicios inmobiliarios en San Justo, La Matanza y zona oeste. Más de 30 años de experiencia.",
              sameAs: [
                "https://www.instagram.com/russopropiedades",
                "https://www.facebook.com/russopropiedades",
              ],
            }),
          }}
        />
        <Navbar />
        <div className="pt-[72px]">{children}</div>
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
