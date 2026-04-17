"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Facebook, Linkedin, Printer, Share2, Mail } from "lucide-react";
import ContactButtons from "@/components/ContactButtons";

interface ContactSidebarProps {
  propertyCode: string;
  propertyTitle?: string;
}

export default function ContactSidebar({
  propertyCode,
  propertyTitle,
}: ContactSidebarProps) {
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message:
      "Vi esta propiedad y me gustaría que me contacten…",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Campo requerido";
    if (!formData.phone.trim()) newErrors.phone = "Campo requerido";
    if (!formData.email.trim()) {
      newErrors.email = "Campo requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          propertyCode,
          type: "consulta",
        }),
      });

      if (!res.ok) throw new Error("Error al enviar");
      setSuccess(true);
    } catch {
      setSubmitError("No se pudo enviar el mensaje. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const shareTitle = propertyTitle ?? `Propiedad ${propertyCode}`;

  return (
    <aside className="lg:sticky lg:top-24 rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Contact buttons */}
      <div className="flex justify-center p-5">
        <ContactButtons propertyCode={propertyCode} size="md" />
      </div>

      <hr className="border-gray-200" />

      {/* Agent / Company info */}
      <div className="flex flex-col items-center gap-2 p-5 text-center">
        <Image
          src="/images/logo-icon.webp"
          alt="Russo Propiedades"
          width={80}
          height={80}
          className="mb-1"
        />
        <p className="text-sm font-semibold text-navy">Russo Propiedades</p>
        <p className="text-xs text-gray-500">Pte J D Peron 3501</p>
        <a
          href="mailto:info@russopropiedades.com.ar"
          className="text-xs text-gray-500 hover:text-magenta transition-colors"
        >
          info@russopropiedades.com.ar
        </a>
        <a
          href="tel:+541146514024"
          className="text-xs text-gray-500 hover:text-magenta transition-colors"
        >
          011 4651-4024
        </a>
      </div>

      <hr className="border-gray-200" />

      {/* Contact form */}
      <div className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-navy">
          Envianos un mensaje
        </h3>
        {success ? (
          <div className="text-center py-4">
            <p className="text-sm text-green-600 font-medium mb-2">¡Mensaje enviado con éxito!</p>
            <p className="text-xs text-gray-500">Nos comunicaremos a la brevedad.</p>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ name: "", phone: "", email: "", message: "Vi esta propiedad y me gustaría que me contacten…" });
              }}
              className="mt-3 text-xs text-magenta underline"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div>
            <label htmlFor="sidebar-name" className="sr-only">
              Nombre y apellido
            </label>
            <input
              id="sidebar-name"
              name="name"
              type="text"
              required
              placeholder="Nombre y apellido *"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/30 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="sidebar-phone" className="sr-only">
              Teléfono
            </label>
            <input
              id="sidebar-phone"
              name="phone"
              type="tel"
              required
              placeholder="Teléfono *"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/30 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="sidebar-email" className="sr-only">
              Email
            </label>
            <input
              id="sidebar-email"
              name="email"
              type="email"
              required
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/30 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="sidebar-message" className="sr-only">
              Mensaje
            </label>
            <textarea
              id="sidebar-message"
              name="message"
              rows={4}
              placeholder="Mensaje"
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-magenta"
            />
          </div>

          {submitError && (
            <p className="text-xs text-red-500">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-magenta py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-magenta-600 disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Contactarse"}
          </button>
        </form>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Share section */}
      <div className="p-5">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-navy">
          <Share2 className="h-4 w-4" />
          Compartir
        </h3>
        <div className="flex items-center gap-2">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Facebook"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-navy hover:text-white hover:border-navy"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en LinkedIn"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-navy hover:text-white hover:border-navy"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir por WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`}
            aria-label="Compartir por Email"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-navy hover:text-white hover:border-navy"
          >
            <Mail className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Imprimir"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:bg-navy hover:text-white hover:border-navy"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
