import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emprendimientos",
  description:
    "Emprendimientos inmobiliarios en zona oeste: pre-venta, pozo, en construcción y listos para mudarse. Oportunidades con Russo Propiedades.",
  alternates: { canonical: "https://russo-prop.vercel.app/emprendimientos" },
};

export default function EmprendimientosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
