"use client";

import { useState, FormEvent } from "react";

/** Mismo número que usan el FAB, la ficha y el resto del sitio. */
const WHATSAPP_NUMBER = "5491150187340";

/**
 * Arma el mensaje que el vecino le manda a la oficina.
 *
 * El punto de todo esto: los chicos querían que el botón fuera derecho a
 * WhatsApp (la data les da la razón — en la ficha, donde conviven los dos
 * botones, WhatsApp le gana al formulario 6-7 a 1). Pero una tasación sin
 * dirección no sirve, y un lead que sólo existe en un chat no queda en
 * /admin/leads. Así que el formulario se queda y lo que cambia es a dónde
 * va: junta los datos, los guarda, y abre WhatsApp con todo ya escrito.
 */
function buildWhatsAppMessage(data: {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo: string;
  comentarios: string;
}): string {
  // Ojo con el filter: los renglones en blanco son a propósito (separan
  // el saludo de los datos), así que se arman después de filtrar los
  // campos opcionales vacíos, no antes.
  const datos = [
    `Dirección: ${data.direccion}`,
    data.tipo ? `Tipo: ${data.tipo}` : "",
    `Nombre: ${data.nombre}`,
    `Teléfono: ${data.telefono}`,
    `Email: ${data.email}`,
  ].filter(Boolean);

  const bloques = [
    "Hola! Quiero tasar mi propiedad.",
    datos.join("\n"),
    data.comentarios ? `Comentarios: ${data.comentarios}` : "",
  ].filter(Boolean);

  return bloques.join("\n\n");
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

const PROPERTY_TYPES = [
  "Casa",
  "Departamento",
  "PH",
  "Terreno",
  "Local",
  "Oficina",
  "Otro",
];

export default function TasacionesPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    tipo: "",
    comentarios: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!formData.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!formData.email.trim()) {
      errs.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Ingresá un email válido.";
    }
    if (!formData.telefono.trim()) {
      errs.telefono = "El teléfono es obligatorio.";
    }
    if (!formData.direccion.trim()) {
      errs.direccion = "La dirección es obligatoria.";
    }
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      buildWhatsAppMessage(formData)
    )}`;
    setWhatsappUrl(url);

    // WhatsApp se abre ACÁ, sincrónico, todavía dentro del click del
    // usuario. Si esperáramos al fetch, el browser ya no lo considera
    // parte del gesto y lo bloquea como popup. Si igual lo bloquea, la
    // pantalla de éxito siempre muestra el botón para abrirlo a mano.
    window.open(url, "_blank");

    setSending(true);

    // El lead se guarda igual · si esto falla, el mensaje ya se mandó y
    // el pedido no se pierde: lo peor que pasa es que no quede en el
    // admin. Por eso no bloqueamos la pantalla de éxito con el error.
    try {
      await fetch("/api/contact", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nombre,
          email: formData.email,
          phone: formData.telefono,
          message: [
            formData.comentarios,
            `Dirección: ${formData.direccion}`,
            formData.tipo ? `Tipo: ${formData.tipo}` : "",
          ].filter(Boolean).join("\n"),
          type: "tasacion",
        }),
      });
    } catch {
      // sin red o API caída · seguimos, WhatsApp ya está abierto
    } finally {
      setSending(false);
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile banner */}
      <div className="block lg:hidden h-32 bg-gradient-to-br from-navy via-navy-600 to-magenta relative overflow-hidden">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-extrabold text-white/10 tracking-widest select-none">
          RUSSO
        </span>
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium tracking-wide whitespace-nowrap">
          Servicios Inmobiliarios
        </p>
      </div>

      {/* Left column — Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:py-20">
        <div className="w-full max-w-lg">
          {submitted ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">
                Te abrimos WhatsApp con el mensaje listo
              </h2>
              <p className="text-navy-400">
                Sólo tenés que enviarlo. Si no se abrió solo, usá el botón de
                acá abajo — tus datos ya están cargados.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
                >
                  <WhatsAppIcon />
                  Abrir WhatsApp
                </a>
              )}
              <p className="mt-6 text-xs text-navy-300">
                También nos queda registrado el pedido, así que si preferís
                esperar, un asesor te va a contactar igual.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-3">
                Vendé tu propiedad
              </h1>
              <p className="text-navy-400 mb-8 leading-relaxed">
                Completá estos datos y te abrimos WhatsApp con el mensaje ya
                escrito. Un asesor de Russo Propiedades te responde por ahí
                mismo.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Nombre y apellido{" "}
                    <span className="text-magenta font-medium" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-magenta/30 focus:border-magenta ${
                      errors.nombre ? "border-red-500" : "border-navy-200"
                    }`}
                    aria-invalid={!!errors.nombre}
                    aria-describedby={
                      errors.nombre ? "nombre-error" : undefined
                    }
                  />
                  {errors.nombre && (
                    <p id="nombre-error" className="mt-1 text-xs text-red-600">
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Email{" "}
                    <span className="text-magenta font-medium" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-magenta/30 focus:border-magenta ${
                      errors.email ? "border-red-500" : "border-navy-200"
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Telefono */}
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Teléfono{" "}
                    <span className="text-magenta font-medium" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-magenta/30 focus:border-magenta ${
                      errors.telefono ? "border-red-500" : "border-navy-200"
                    }`}
                    aria-invalid={!!errors.telefono}
                    aria-describedby="telefono-helper telefono-error"
                  />
                  <p
                    id="telefono-helper"
                    className="mt-1 text-xs text-navy-300"
                  >
                    N° con código de área. Ej: 1123456789
                  </p>
                  {errors.telefono && (
                    <p
                      id="telefono-error"
                      className="mt-0.5 text-xs text-red-600"
                    >
                      {errors.telefono}
                    </p>
                  )}
                </div>

                {/* Direccion */}
                <div>
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Dirección de la propiedad{" "}
                    <span className="text-magenta font-medium" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    required
                    value={formData.direccion}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-magenta/30 focus:border-magenta ${
                      errors.direccion ? "border-red-500" : "border-navy-200"
                    }`}
                    aria-invalid={!!errors.direccion}
                    aria-describedby={
                      errors.direccion ? "direccion-error" : undefined
                    }
                  />
                  {errors.direccion && (
                    <p
                      id="direccion-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.direccion}
                    </p>
                  )}
                </div>

                {/* Tipo de propiedad */}
                <div>
                  <label
                    htmlFor="tipo"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Tipo de propiedad
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-magenta/30 focus:border-magenta bg-white"
                  >
                    <option value="">Seleccioná una opción</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comentarios */}
                <div>
                  <label
                    htmlFor="comentarios"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Comentarios
                  </label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    rows={4}
                    value={formData.comentarios}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-navy-200 px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-magenta/30 focus:border-magenta resize-y"
                  />
                </div>

                {/* Submit · verde de WhatsApp, que es a dónde lleva */}
                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5a] disabled:opacity-50"
                >
                  <WhatsAppIcon />
                  {sending ? "Abriendo WhatsApp…" : "Pedir tasación por WhatsApp"}
                </button>

                <p className="text-xs text-navy-300 text-center">
                  Al enviar estás aceptando nuestros Términos y Condiciones
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Right column — Hero gradient (hidden on mobile, shown on lg+) */}
      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-navy via-navy-600 to-magenta relative items-center justify-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-magenta/10" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/5" />

        <div className="relative text-center select-none">
          <span className="block text-[8rem] font-extrabold leading-none text-white/10 tracking-[0.2em]">
            RUSSO
          </span>
          <span className="block mt-2 text-2xl font-light text-white/70 tracking-widest">
            Servicios Inmobiliarios
          </span>
        </div>
      </section>
    </main>
  );
}
