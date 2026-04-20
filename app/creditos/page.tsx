import type { Metadata } from "next";
import { neighborhoods } from "@/data/neighborhoods";

export const metadata: Metadata = {
  title: "Créditos de imágenes",
  description:
    "Atribución de fotos de barrios bajo licencias Creative Commons de Wikimedia Commons.",
};

export default function CreditosPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-wide mb-4">
        Créditos de imágenes
      </h1>
      <p className="text-navy-500 mb-8">
        Las fotografías de los barrios que aparecen en este sitio provienen de{" "}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-magenta hover:underline"
        >
          Wikimedia Commons
        </a>{" "}
        y están publicadas bajo licencias Creative Commons. Agradecemos a los
        siguientes autores:
      </p>

      <ul className="space-y-3">
        {neighborhoods.map((n) => (
          <li
            key={n.slug}
            className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-gray-100 pb-3 text-sm"
          >
            <span className="font-semibold text-navy">{n.name}</span>
            <span className="text-navy-500">
              {n.credit.author} ·{" "}
              <a
                href={n.credit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-magenta hover:underline"
              >
                {n.credit.license}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
