"use client";

import { useState, FormEvent } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import MapView from "@/components/MapView";

interface Office {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  /** Si está activa todavía no abrió → mostramos badge "Próxima apertura". */
  comingSoon?: boolean;
}

// TODO: confirmar coords exactas con Marc · pasar links de Google Maps
const OFFICES: Office[] = [
  {
    id: "san-justo",
    name: "San Justo",
    address: "Av. Pte J. D. Perón 3501, San Justo, Buenos Aires",
    location: { lat: -34.6757, lng: -58.5605 },
  },
  {
    id: "ramos-mejia",
    name: "Ramos Mejía",
    address: "Dirección a confirmar, Ramos Mejía",
    location: { lat: -34.6440, lng: -58.5667 },
    comingSoon: true,
  },
];

// Centro del mapa: punto medio entre todas las sedes activas (calculado).
const MAP_CENTER: [number, number] = (() => {
  const lat = OFFICES.reduce((s, o) => s + o.location.lat, 0) / OFFICES.length;
  const lng = OFFICES.reduce((s, o) => s + o.location.lng, 0) / OFFICES.length;
  return [lat, lng];
})();

const HOW_OPTIONS = [
  "Buscador web",
  "Redes sociales",
  "Recomendación",
  "Cartel en la calle",
  "Otro",
];

const infoCards = [
  {
    icon: MapPin,
    heading: "Nuestras sedes",
    text: OFFICES.map((o) => o.name).join(" · "),
    href: undefined as string | undefined,
  },
  {
    icon: Mail,
    heading: "Nuestro correo",
    text: "info@russopropiedades.com.ar",
    href: "mailto:info@russopropiedades.com.ar",
  },
  {
    icon: Phone,
    heading: "Líneas rotativas",
    text: "+54 11 5018 7340",
    href: "tel:+541150187340",
  },
];

export default function ContactoPage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    comoNosConociste: "",
    mensaje: "",
    copiaEmail: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nombre,
          email: form.email,
          phone: form.telefono,
          message: [
            form.mensaje,
            form.direccion ? `Dirección: ${form.direccion}` : "",
            form.comoNosConociste ? `Cómo nos conoció: ${form.comoNosConociste}` : "",
          ].filter(Boolean).join("\n"),
          type: "contacto",
        }),
      });

      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
    } catch {
      setSubmitError("No se pudo enviar el mensaje. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="py-12">
      {/* Info Cards */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoCards.map((card) => {
            const Icon = card.icon;
            const content = (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{card.heading}</h3>
                <p className="text-gray-600 text-sm">{card.text}</p>
              </>
            );

            return (
              <div
                key={card.heading}
                className="rounded-lg bg-white p-6 text-center shadow"
              >
                {card.href ? (
                  <a href={card.href} className="block hover:opacity-80">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Split section: form + map */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="rounded-lg bg-white p-8 shadow">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Mail className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold">Mensaje enviado</h2>
                <p className="text-gray-600">
                  Gracias por contactarnos. Nos comunicaremos a la brevedad.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      nombre: "",
                      email: "",
                      telefono: "",
                      direccion: "",
                      comoNosConociste: "",
                      mensaje: "",
                      copiaEmail: false,
                    });
                  }}
                  className="mt-2 text-sm text-magenta underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  Envianos un mensaje
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Completá el formulario y nos pondremos en contacto con vos
                  a la brevedad.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-sm font-medium mb-1"
                    >
                      Nombre y apellido <span className="text-magenta font-medium" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email <span className="text-magenta font-medium" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
                    />
                  </div>

                  {/* Telefono */}
                  <div>
                    <label
                      htmlFor="telefono"
                      className="block text-sm font-medium mb-1"
                    >
                      Teléfono <span className="text-magenta font-medium" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      required
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
                    />
                  </div>

                  {/* Direccion */}
                  <div>
                    <label
                      htmlFor="direccion"
                      className="block text-sm font-medium mb-1"
                    >
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      name="direccion"
                      type="text"
                      value={form.direccion}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
                    />
                  </div>

                  {/* Como nos conociste */}
                  <div>
                    <label
                      htmlFor="comoNosConociste"
                      className="block text-sm font-medium mb-1"
                    >
                      ¿Cómo nos conociste?
                    </label>
                    <select
                      id="comoNosConociste"
                      name="comoNosConociste"
                      value={form.comoNosConociste}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30"
                    >
                      <option value="">Seleccioná una opción</option>
                      {HOW_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label
                      htmlFor="mensaje"
                      className="block text-sm font-medium mb-1"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      maxLength={250}
                      value={form.mensaje}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-magenta focus:outline-none focus:ring-2 focus:ring-magenta/30 resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">
                      {form.mensaje.length}/250
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      id="copiaEmail"
                      name="copiaEmail"
                      type="checkbox"
                      checked={form.copiaEmail}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-magenta focus:ring-magenta/30"
                    />
                    <label htmlFor="copiaEmail" className="text-sm">
                      Recibir una copia del mensaje en mi email
                    </label>
                  </div>

                  {submitError && (
                    <p className="text-sm text-red-500 text-center">{submitError}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-md bg-magenta px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 btn-magenta"
                  >
                    {sending ? "Enviando…" : "Enviar"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Map + sedes */}
          <div className="flex flex-col gap-4 min-h-[500px]">
            <div className="rounded-lg overflow-hidden shadow flex-1 min-h-[360px]">
              <MapView
                center={MAP_CENTER}
                zoom={13}
                singleMarker={OFFICES.length === 1}
                properties={OFFICES.map((o) => ({
                  id: o.id,
                  title: `Russo Propiedades · ${o.name}`,
                  price: 0,
                  address: o.address,
                  location: o.location,
                  images: [],
                }))}
                className="w-full h-full min-h-[360px]"
              />
            </div>
            <ul className="space-y-2">
              {OFFICES.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg bg-white border border-gray-100 shadow-sm px-4 py-3 flex items-start gap-3"
                >
                  <MapPin className="h-4 w-4 text-magenta flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy flex items-center gap-2">
                      {o.name}
                      {o.comingSoon && (
                        <span className="inline-block rounded-full bg-magenta/10 text-magenta px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                          Próxima apertura
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {o.address}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
