import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasación gratuita",
  description:
    "Tasamos tu propiedad sin costo, con datos reales de zona oeste. Russo Propiedades — 30 años conociendo cada cuadra.",
  alternates: { canonical: "/tasaciones" },
};

export default function TasacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
