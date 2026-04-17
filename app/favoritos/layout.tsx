import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis favoritos",
  description:
    "Las propiedades que marcaste para revisar más tarde. Guardadas en tu navegador.",
  alternates: { canonical: "https://russo-prop.vercel.app/favoritos" },
};

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
