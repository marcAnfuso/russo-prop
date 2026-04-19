"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const QUICK_QUESTIONS = [
  "¿Qué hay cerca?",
  "¿Cuál es el punto fuerte?",
  "¿Algo a tener en cuenta?",
  "¿Cómo están los ambientes?",
];

interface AskAboutPropertyProps {
  propertyId: string;
}

export default function AskAboutProperty({ propertyId }: AskAboutPropertyProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, question }),
      });
      const data = (await res.json()) as { ok?: boolean; answer?: string; error?: string };
      if (data.ok && data.answer) {
        setMessages((m) => [...m, { role: "ai", text: data.answer! }]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "ai",
            text: "No pude responder esta consulta. Podés escribirle directamente al equipo por WhatsApp y te contestan en minutos.",
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Problema de conexión. Probá de nuevo en un segundo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <section>
      <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-navy mb-4">
        <span className="h-6 w-1 rounded-full bg-magenta" aria-hidden="true" />
        Preguntale a esta propiedad
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-magenta to-magenta-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ml-1">
          <Sparkles className="h-3 w-3" />
          IA
        </span>
      </h2>

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {/* Messages */}
        <div
          ref={scrollRef}
          className={`px-4 py-4 space-y-3 ${
            messages.length > 0 || loading ? "max-h-80 overflow-y-auto" : ""
          }`}
        >
          {messages.length === 0 && !loading && (
            <div className="py-2">
              <p className="text-sm text-gray-600 mb-3">
                Consultá cualquier duda sobre esta propiedad. La IA responde con
                lo que sabe; si no está cargado, te deriva a un agente.
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-navy hover:border-magenta hover:bg-magenta-50 hover:text-magenta transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-magenta text-white rounded-br-sm"
                    : "bg-gray-50 text-navy rounded-bl-sm border border-gray-100"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-50 border border-gray-100 px-4 py-3">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 bg-magenta/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 bg-magenta/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 bg-magenta/60 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 flex items-center gap-2 p-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu pregunta…"
            maxLength={400}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Enviar pregunta"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-magenta text-white transition-colors hover:bg-magenta-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
        Las respuestas son generadas por IA basándose en la información cargada
        por Russo. Siempre confirmá los datos con un agente antes de decidir.
      </p>
    </section>
  );
}
