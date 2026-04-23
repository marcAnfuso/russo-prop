"use client";

import { useState } from "react";
import { Bot, Sparkles, MessageCircle, X, Send } from "lucide-react";

export default function PreviewRussiaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
      <header className="text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-magenta">
          Preview
        </p>
        <h1 className="text-3xl font-bold text-navy">
          Russia · variantes del pop-up
        </h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          4 formas de invitar al usuario a preguntarle a la IA sobre la
          propiedad que está viendo. Cada variante arriba de una maqueta de
          página de detalle para que se vea en contexto.
        </p>
      </header>

      <Section label="Variante A" title="Chat widget flotante (bottom-right)">
        <VariantA />
      </Section>

      <Section label="Variante B" title="Cartelito arriba del sidebar de contacto">
        <VariantB />
      </Section>

      <Section label="Variante C" title="Burbuja cómic con robot asomándose">
        <VariantC />
      </Section>

      <Section label="Variante D" title="Banner slim inline entre secciones">
        <VariantD />
      </Section>
    </div>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="inline-block rounded-full bg-magenta px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
          {label}
        </span>
        <h2 className="text-xl font-semibold text-navy">{title}</h2>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

// ── Maqueta de página ──────────────────────────────────────────────────────
function PagePreview({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-[520px] p-6 flex gap-6">
      {/* Left col fake */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-3 w-12 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-200" />
        </div>
        <div className="h-7 w-3/4 rounded bg-gray-300" />
        <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-navy-200 to-navy-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent)]" />
        </div>
        <div className="flex gap-3">
          <div className="h-16 w-24 rounded-lg bg-gray-200" />
          <div className="h-16 w-24 rounded-lg bg-gray-200" />
          <div className="h-16 w-24 rounded-lg bg-gray-200" />
          <div className="h-16 w-24 rounded-lg bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-11/12 rounded bg-gray-200" />
          <div className="h-3 w-9/12 rounded bg-gray-200" />
          <div className="h-3 w-10/12 rounded bg-gray-200" />
        </div>
      </div>
      {/* Sidebar fake */}
      <div className="w-80 flex-shrink-0 rounded-xl bg-white border border-gray-200 p-4 space-y-3 h-fit">
        <div className="flex gap-2">
          <div className="h-8 flex-1 rounded bg-emerald-100" />
          <div className="h-8 w-8 rounded bg-gray-100" />
          <div className="h-8 w-8 rounded bg-gray-100" />
        </div>
        <div className="h-14 w-14 rounded bg-navy-100 mx-auto" />
        <div className="h-3 w-32 mx-auto rounded bg-gray-200" />
        <div className="h-3 w-40 mx-auto rounded bg-gray-100" />
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="h-9 w-full rounded bg-gray-100" />
          <div className="h-9 w-full rounded bg-gray-100" />
          <div className="h-9 w-full rounded bg-gray-100" />
          <div className="h-20 w-full rounded bg-gray-100" />
        </div>
        <div className="h-10 w-full rounded bg-magenta/80" />
      </div>
      {children}
    </div>
  );
}

// ── Robot avatar reusable ──────────────────────────────────────────────────
function RobotAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-magenta to-navy shadow-lg flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Bot className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
      <span
        className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center"
        aria-hidden="true"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
    </div>
  );
}

// ── Variante A: chat widget flotante ──────────────────────────────────────
function VariantA() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  return (
    <PagePreview>
      {!dismissed && (
        <div className="absolute right-6 bottom-6 z-10 flex items-end gap-3">
          {!open ? (
            <>
              <div className="relative max-w-[240px] bg-white rounded-2xl rounded-br-md shadow-xl border border-gray-100 px-4 py-3 mb-1">
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="absolute top-1 right-1 p-0.5 text-gray-300 hover:text-gray-500 rounded"
                  aria-label="Cerrar"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="text-sm font-semibold text-navy pr-4">
                  Hola, soy Russia 👋
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ¿Te cuento algo sobre esta propiedad?
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="mt-2 w-full text-xs font-semibold text-magenta hover:underline text-left"
                >
                  Empezar a preguntar →
                </button>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-magenta to-navy shadow-[0_10px_25px_-5px_rgba(230,0,126,0.5)] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Chatear con Russia"
              >
                <Bot className="h-7 w-7 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </span>
              </button>
            </>
          ) : (
            <div className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-magenta to-[#b3006d] text-white px-4 py-3 flex items-center gap-3">
                <RobotAvatar size={36} />
                <div className="flex-1">
                  <p className="text-sm font-bold">Russia</p>
                  <p className="text-[11px] opacity-90">IA de Russo Propiedades</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-white/20"
                  aria-label="Minimizar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-navy max-w-[85%]">
                  ¡Hola! Soy Russia. Preguntame lo que quieras sobre esta
                  propiedad — cuadras al transporte, expensas, barrio, lo que
                  sea.
                </div>
              </div>
              <div className="border-t border-gray-100 p-2 flex gap-2">
                <input
                  placeholder="Escribí tu pregunta…"
                  className="flex-1 text-xs px-3 py-2 rounded-full bg-gray-50 border border-gray-200 outline-none focus:border-magenta"
                />
                <button className="h-8 w-8 rounded-full bg-magenta text-white flex items-center justify-center hover:bg-magenta-600">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {dismissed && (
        <button
          onClick={() => setDismissed(false)}
          className="absolute right-6 bottom-6 text-xs text-gray-400 underline"
        >
          Mostrar de nuevo
        </button>
      )}
    </PagePreview>
  );
}

// ── Variante B: cartelito encima del sidebar ──────────────────────────────
function VariantB() {
  return (
    <div className="relative min-h-[520px] p-6 flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-3 w-12 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-200" />
        </div>
        <div className="h-7 w-3/4 rounded bg-gray-300" />
        <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-navy-200 to-navy-300" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-11/12 rounded bg-gray-200" />
          <div className="h-3 w-9/12 rounded bg-gray-200" />
        </div>
      </div>
      <div className="w-80 flex-shrink-0 space-y-4">
        {/* Russia card — arriba del sidebar */}
        <div className="relative rounded-2xl bg-gradient-to-br from-navy to-[#0f1440] text-white p-4 overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(230,0,126,0.5), transparent 50%)",
            }}
          />
          <div className="relative flex items-start gap-3">
            <RobotAvatar size={42} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs font-bold">Russia</p>
                <Sparkles className="h-3 w-3 text-magenta" />
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Hacé cualquier pregunta sobre esta propiedad y te respondo al
                toque.
              </p>
              <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-magenta text-white px-3 py-1.5 rounded-full hover:bg-magenta-600">
                <MessageCircle className="h-3 w-3" />
                Preguntar
              </button>
            </div>
          </div>
        </div>
        {/* Sidebar normal */}
        <div className="rounded-xl bg-white border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded bg-emerald-100" />
            <div className="h-8 w-8 rounded bg-gray-100" />
            <div className="h-8 w-8 rounded bg-gray-100" />
          </div>
          <div className="h-14 w-14 rounded bg-navy-100 mx-auto" />
          <div className="h-3 w-32 mx-auto rounded bg-gray-200" />
          <div className="h-9 w-full rounded bg-gray-100" />
          <div className="h-9 w-full rounded bg-gray-100" />
          <div className="h-20 w-full rounded bg-gray-100" />
          <div className="h-10 w-full rounded bg-magenta/80" />
        </div>
      </div>
    </div>
  );
}

// ── Variante C: burbuja cómic con robot asomándose ───────────────────────
function VariantC() {
  return (
    <PagePreview>
      <div className="absolute left-6 bottom-6 z-10 flex items-end gap-0">
        {/* Robot pegado a la burbuja */}
        <div className="relative flex-shrink-0 -mr-3 z-10">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-magenta to-navy flex items-center justify-center shadow-xl ring-4 ring-white">
            <Bot className="h-11 w-11 text-white" />
          </div>
          {/* Brillo */}
          <span className="absolute top-3 left-4 h-2.5 w-2.5 rounded-full bg-white/60 blur-[1px]" />
        </div>
        {/* Burbuja cómic */}
        <div className="relative bg-white rounded-2xl shadow-xl border-2 border-navy px-5 py-4 max-w-sm">
          {/* Pico de burbuja apuntando al robot */}
          <div className="absolute top-1/2 -left-[9px] -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-[10px] border-t-transparent border-b-transparent border-r-navy" />
          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-white" />

          <p className="text-sm font-bold text-navy flex items-center gap-1.5">
            ¿Preguntas sobre esta propi?
            <Sparkles className="h-3.5 w-3.5 text-magenta" />
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Soy Russia, la IA de Russo. Te respondo al toque.
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-magenta text-white px-4 py-2 rounded-full hover:bg-magenta-600 shadow-md">
            <MessageCircle className="h-3.5 w-3.5" />
            Empezar
          </button>
        </div>
      </div>
    </PagePreview>
  );
}

// ── Variante D: banner slim inline ────────────────────────────────────────
function VariantD() {
  return (
    <div className="p-6 space-y-6">
      {/* Fake: título + galería */}
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
          <div className="h-7 w-3/4 rounded bg-gray-300" />
          <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-navy-200 to-navy-300" />
        </div>
        <div className="w-80 flex-shrink-0 rounded-xl bg-white border border-gray-200 p-4 h-32" />
      </div>

      {/* Banner Russia */}
      <div className="relative rounded-2xl bg-gradient-to-r from-navy via-[#1a1f5c] to-navy text-white overflow-hidden shadow-lg">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(circle at 10% 50%, rgba(230,0,126,0.7), transparent 50%), radial-gradient(circle at 90% 50%, rgba(230,0,126,0.4), transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-4 px-5 py-4 flex-wrap">
          <RobotAvatar size={44} />
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-bold flex items-center gap-1.5">
              Preguntale a Russia sobre esta propiedad
              <Sparkles className="h-3.5 w-3.5 text-magenta" />
            </p>
            <p className="text-xs opacity-80">
              Nuestra IA te responde cualquier duda — zona, transporte,
              comparables, lo que sea.
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 bg-magenta hover:bg-magenta-600 text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors">
            <MessageCircle className="h-4 w-4" />
            Preguntar
          </button>
        </div>
      </div>

      {/* Fake: descripción */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-11/12 rounded bg-gray-200" />
        <div className="h-3 w-9/12 rounded bg-gray-200" />
      </div>
    </div>
  );
}
