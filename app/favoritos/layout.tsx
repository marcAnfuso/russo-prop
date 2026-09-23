import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis favoritos",
  description:
    "Las propiedades que marcaste para revisar más tarde. Guardadas en tu navegador.",
  alternates: { canonical: "/favoritos" },
  // Página personal · el contenido vive en el localStorage del visitante,
  // no hay nada que indexar y para Google es siempre una lista vacía.
  robots: { index: false, follow: true },
};

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
