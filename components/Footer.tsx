import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import { properties } from "@/data/properties";

const utilityLinks = [
  { label: "Ventas", href: "/ventas" },
  { label: "Alquileres", href: "/alquileres" },
  { label: "Edificios", href: "/ventas" },
  { label: "Casas", href: "/ventas" },
  { label: "Departamentos", href: "/ventas" },
  { label: "Locales", href: "/ventas" },
  { label: "Oficinas", href: "/ventas" },
];

export default function Footer() {
  const latestProperties = properties.slice(-3);

  return (
    <footer className="border-t-4 border-navy bg-gray-50 text-gray-700">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 - Brand */}
          <div>
            <Link href="/" aria-label="Russo Propiedades - Inicio">
              <Image
                src="/images/logo-full.webp"
                alt="Russo Propiedades"
                width={1000}
                height={1200}
                className="mb-4 h-32 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Hemos agregado a nuestra amplia experiencia, toda la tecnología
              hoy disponible, sumada a nuestro más importante capital, que es
              la gente joven, rigurosamente seleccionada por su capacidad,
              idoneidad y honestidad.
            </p>
          </div>

          {/* Column 2 - Contacto */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-navy">Contacto</h3>
            <address className="not-italic space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-magenta" aria-hidden="true" />
                <span>Av. Pte J. D. Peron 3501, San Justo</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-magenta" aria-hidden="true" />
                <a
                  href="tel:+541150187340"
                  className="hover:text-magenta transition-colors"
                  aria-label="Llamar al +54 11 5018 7340"
                >
                  +54 11 5018 7340
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-magenta" aria-hidden="true" />
                <a
                  href="mailto:info@russopropiedades.com.ar"
                  className="hover:text-magenta transition-colors"
                  aria-label="Enviar email a info@russopropiedades.com.ar"
                >
                  info@russopropiedades.com.ar
                </a>
              </div>
            </address>
          </div>

          {/* Column 3 - De Utilidad */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-navy">
              De Utilidad
            </h3>
            <nav aria-label="Enlaces de utilidad">
              <ul className="space-y-2 text-sm">
                {utilityLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 hover:text-magenta hover:translate-x-1 transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 4 - Últimas Propiedades */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-navy">
              Últimas Propiedades
            </h3>
            <ul className="space-y-3">
              {latestProperties.map((property) => (
                <li key={property.id}>
                  <Link
                    href={`/propiedad/${property.id}`}
                    className="flex items-start gap-3 group"
                    aria-label={`Ver propiedad: ${property.title}`}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-200">
                      <Image
                        src={property.images[0] ?? "/images/logo-placeholder.svg"}
                        alt={property.title}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold leading-tight group-hover:text-magenta transition-colors">
                        {property.title}
                      </p>
                      <p className="text-gray-500">{property.locality}</p>
                      <p className="text-xs text-gray-400">{property.code}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">
            &copy; 2026 Russo Propiedades. Todos los derechos reservados. ·{" "}
            <Link
              href="/creditos"
              className="hover:text-magenta transition-colors"
            >
              Créditos
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/russopropiedadesok"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguinos en Facebook — Russo Propiedades"
              title="Russo Propiedades en Facebook"
              className="text-gray-400 hover:text-magenta transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com/russopropiedadesok"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguinos en Instagram — @russopropiedadesok"
              title="@russopropiedadesok"
              className="text-gray-400 hover:text-magenta transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
