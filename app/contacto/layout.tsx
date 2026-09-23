import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Hablá con Russo Propiedades. Oficina en el centro de San Justo, teléfono, email y WhatsApp. Atención directa, sin intermediarios.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
