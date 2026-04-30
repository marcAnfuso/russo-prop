import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const SITE_URL = "https://russo-prop.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Russo Propiedades — Inmobiliaria en zona oeste",
    template: "%s · Russo Propiedades",
  },
  description:
    "Inmobiliaria familiar de zona oeste. Propiedades en venta y alquiler en San Justo, Ramos Mejía, Villa Luzuriaga, Haedo, Morón y más. Desde 1994.",
  keywords: [
    "Russo Propiedades",
    "inmobiliaria zona oeste",
    "propiedades San Justo",
    "propiedades La Matanza",
    "casas en venta zona oeste",
    "alquileres zona oeste",
    "tasación gratuita",
  ],
  icons: {
    icon: "/images/logo-icon.webp",
    apple: "/images/logo-icon.webp",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "Russo Propiedades",
    title: "Russo Propiedades — Inmobiliaria en zona oeste",
    description:
      "Propiedades en venta y alquiler en San Justo y zona oeste. 30 años acompañando familias.",
    images: [
      {
        url: "/images/logo.webp",
        width: 1200,
        height: 630,
        alt: "Russo Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Russo Propiedades — Inmobiliaria en zona oeste",
    description:
      "Propiedades en venta y alquiler en San Justo y zona oeste. 30 años acompañando familias.",
    images: ["/images/logo.webp"],
  },
  alternates: { canonical: SITE_URL },
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

        {/* Google Analytics - Replace GA_ID with actual ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <NextTopLoader
          color="#e6007e"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #e6007e, 0 0 5px #e6007e"
          speed={250}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Russo Propiedades",
              url: "https://russopropiedades.com.ar",
              telephone: "+54 11 5018 7340",
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
                "https://www.instagram.com/russopropiedadesok",
                "https://www.facebook.com/russopropiedadesok",
              ],
            }),
          }}
        />
        <Navbar />
        <div className="pt-[72px]">{children}</div>
        <Footer />
        <WhatsAppFAB />
        {/* Tracker propio · pageviews + base para fases siguientes */}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
