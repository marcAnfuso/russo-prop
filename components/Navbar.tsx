"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Mail, Menu, X, Heart, Instagram } from "lucide-react";
import NavbarContactPopover from "./NavbarContactPopover";

const navLinks = [
  { href: "/ventas", label: "Ventas" },
  { href: "/alquileres", label: "Alquileres" },
  { href: "/emprendimientos", label: "Emprendimientos" },
  { href: "/barrios", label: "Barrios" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/tasaciones", label: "Tasaciones" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(26,34,81,0.08)] border-b border-gray-100"
          : "py-4 bg-white/95 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Russo Propiedades"
              width={160}
              height={48}
              priority
              className={`transition-all duration-300 ${
                scrolled ? "h-10 w-auto" : "h-12 w-auto"
              }`}
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative px-2 xl:px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors group/nav ${
                      isActive
                        ? "text-magenta"
                        : "text-navy hover:text-magenta"
                    }`}
                  >
                    {label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-magenta rounded-full transition-all duration-200 ${
                        isActive
                          ? "w-4"
                          : "w-0 group-hover/nav:w-4"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop contact info */}
          <div className="hidden lg:flex items-center gap-1 text-sm text-navy">
            <Link
              href="/favoritos"
              className="flex items-center p-1.5 rounded-md hover:text-magenta hover:bg-navy-50 transition-colors"
              aria-label="Favoritos"
              title="Favoritos"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <NavbarContactPopover
              icon={Phone}
              label="Teléfono"
              value="+541146514024"
              displayValue="+54 11 4651 4024"
              href="tel:+541146514024"
              actionLabel="Llamar"
            />
            <NavbarContactPopover
              icon={Mail}
              label="Email"
              value="info@russopropiedades.com.ar"
              href="mailto:info@russopropiedades.com.ar"
              actionLabel="Escribir"
            />
            <a
              href="https://instagram.com/russopropiedadesok"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-1.5 rounded-md hover:text-magenta hover:bg-navy-50 transition-colors"
              aria-label="Instagram de Russo Propiedades"
              title="@russopropiedadesok"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-navy hover:text-magenta transition-colors"
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      </nav>

      {/*
       * Mobile slide-in menu lives OUTSIDE the <nav> wrapper on purpose.
       * The nav has backdrop-blur-*, which creates a new containing block
       * for fixed descendants — so `h-full` on the panel resolved to the
       * nav's height (≈72px) instead of the viewport, and the menu
       * rendered as a thin white strip with items bleeding over the page.
       */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`fixed inset-y-0 right-0 z-[61] w-72 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegación"
      >
        <div className="flex items-center justify-between p-4 border-b border-navy-100">
          <span className="text-navy font-semibold text-lg">Menu</span>
          <button
            type="button"
            className="rounded-md p-2 text-navy hover:text-magenta transition-colors"
            aria-label="Cerrar menu"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <ul className="flex flex-col p-4 gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "text-magenta bg-magenta-50"
                      : "text-navy hover:text-magenta hover:bg-navy-50"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-navy-100 p-4">
          <Link
            href="/favoritos"
            className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-navy hover:text-magenta hover:bg-navy-50 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <Heart className="h-4 w-4" />
            Favoritos
          </Link>
        </div>

        <div className="border-t border-navy-100 p-4 flex flex-col gap-3 text-sm text-navy">
          <a
            href="tel:+541146514024"
            className="flex items-center gap-2 hover:text-magenta transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>+54 11 4651 4024</span>
          </a>
          <a
            href="mailto:info@russopropiedades.com.ar"
            className="flex items-center gap-2 hover:text-magenta transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>info@russopropiedades.com.ar</span>
          </a>
          <a
            href="https://instagram.com/russopropiedadesok"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-magenta transition-colors"
          >
            <Instagram className="h-4 w-4" />
            <span>@russopropiedadesok</span>
          </a>
        </div>
      </div>
    </>
  );
}
