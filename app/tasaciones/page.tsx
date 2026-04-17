"use client";

import { useState, FormEvent } from "react";

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
  const [submitError, setSubmitError] = useState<string | null>(null);

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

    setSending(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
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

      if (!res.ok) throw new Error("Error al enviar");
      setSubmitted(true);
    } catch {
      setSubmitError("No se pudo enviar la solicitud. Intentá de nuevo.");
    } finally {
      setSending(false);
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
                ¡Gracias! Nos pondremos en contacto.
              </h2>
              <p className="text-navy-400">
                Un asesor de Russo Propiedades te contactará a la brevedad.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-3">
                Vendé tu propiedad
              </h1>
              <p className="text-navy-400 mb-8 leading-relaxed">
                Completá el formulario y un asesor de Russo Propiedades se
                pondrá en contacto con vos para continuar con el proceso.
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

                {submitError && (
                  <p className="text-sm text-red-500 text-center">{submitError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-magenta w-full text-center disabled:opacity-50"
                >
                  {sending ? "Enviando…" : "Solicitar tasación gratuita"}
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
