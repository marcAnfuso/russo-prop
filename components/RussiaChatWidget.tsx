"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { Bot, X, Send, Sparkles, Minus } from "lucide-react";

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

interface Props {
  propertyId: string;
}

type WidgetState = "collapsed" | "bubble" | "open";

export default function RussiaChatWidget({ propertyId }: Props) {
  const [state, setState] = useState<WidgetState>("collapsed");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mostrar la burbuja de bienvenida a los 2.5s — da tiempo a que el
  // usuario registre la página antes de que aparezca la invitación.
  useEffect(() => {
    const t = setTimeout(() => {
      setState((prev) => (prev === "collapsed" ? "bubble" : prev));
    }, 2500);
    return () => clearTimeout(t);
  }, []);

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
        { role: "ai", text: "Problema de conexión. Probá de nuevo en un segundo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  // ── Chat panel abierto ───────────────────────────────────────────────
  if (state === "open") {
    return (
      <div className="fixed bottom-6 right-6 z-40 w-[min(360px,calc(100vw-2rem))] max-h-[min(560px,calc(100vh-3rem))] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <header className="bg-gradient-to-r from-magenta to-[#b3006d] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <RobotAvatar size={36} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold flex items-center gap-1">
              Russia
              <Sparkles className="h-3 w-3" />
            </p>
            <p className="text-[11px] opacity-90">IA de Russo Propiedades</p>
          </div>
          <button
            type="button"
            onClick={() => setState("collapsed")}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Minimizar"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setState("collapsed")}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50"
        >
          {messages.length === 0 && !loading && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-navy border border-gray-100 shadow-sm max-w-[85%]">
                ¡Hola! Soy Russia. Preguntame lo que quieras sobre esta
                propiedad — cuadras al transporte, expensas, barrio, lo que
                sea.
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-navy hover:border-magenta hover:bg-magenta-50 hover:text-magenta transition-colors"
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
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-magenta text-white rounded-br-sm"
                    : "bg-white text-navy rounded-bl-sm border border-gray-100 shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm px-3 py-2.5">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 bg-magenta/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 bg-magenta/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 bg-magenta/60 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 flex items-center gap-2 p-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu pregunta…"
            maxLength={400}
            disabled={loading}
            autoFocus
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
    );
  }

  // ── Estado con burbuja (sugerencia) ──────────────────────────────────
  // ── Estado colapsado (sólo avatar) ───────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {state === "bubble" && (
        <div className="relative max-w-[240px] bg-white rounded-2xl rounded-br-md shadow-xl border border-gray-100 px-4 py-3 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            type="button"
            onClick={() => setState("collapsed")}
            className="absolute top-1 right-1 p-0.5 text-gray-300 hover:text-gray-500 rounded"
            aria-label="Cerrar sugerencia"
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
            onClick={() => setState("open")}
            className="mt-2 w-full text-xs font-semibold text-magenta hover:underline text-left"
          >
            Empezar a preguntar →
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setState("open")}
        className="relative flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-magenta to-navy shadow-[0_10px_25px_-5px_rgba(230,0,126,0.5)] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Chatear con Russia"
      >
        <Bot className="h-7 w-7 text-white" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
        </span>
      </button>
    </div>
  );
}

function RobotAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-black/10 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Bot className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  );
}
