"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, Sparkles, Loader2, Bot, MapPin, Home, BedDouble, Car, Maximize2 } from "lucide-react";

interface PropertyCard {
  id: string;
  code: string;
  title: string;
  operation: string;
  type: string;
  price: number;
  currency: string;
  address: string;
  locality: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: number | null;
  totalArea: number | null;
  image: string | null;
  distanceMeters?: number;
}

type ChatRole = "user" | "model";

interface ChatMessage {
  role: ChatRole;
  content: string;
  properties?: PropertyCard[];
}

const SUGGESTIONS = [
  "Departamento cerca de la estación de Ramos, 2 amb, hasta USD 100.000",
  "Casa en venta en San Justo con cochera",
  "Algo a 5 cuadras de la UNLaM",
  "Alquiler de depto en Ramos Mejía bajo $500.000",
];

function formatPrice(n: number): string {
  if (n >= 9999999) return "Reservado";
  return new Intl.NumberFormat("es-AR").format(n);
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${meters} m`;
  if (meters < 1000) {
    // Redondeo a múltiplos de 50m → "350 m", "650 m"
    const rounded = Math.round(meters / 50) * 50;
    return `${rounded} m`;
  }
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export default function RussiaSearchChat({
  presetMessage,
}: {
  presetMessage?: string;
} = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content:
        "Hola! Soy Russia, la IA de Russo Propiedades. Contame qué buscás (compra/alquiler, zona, ambientes, presupuesto) y te muestro lo que tenemos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const presetFiredRef = useRef(false);

  // Auto-scroll a la última respuesta
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Auto-disparar el preset al montarse · una sola vez por instancia.
  // Sin setTimeout porque strict mode lo cancelaría en el doble-mount;
  // el ref persiste entre mounts y bloquea la segunda ejecución.
  useEffect(() => {
    if (!presetMessage || presetFiredRef.current) return;
    presetFiredRef.current = true;
    sendMessage(presetMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetMessage]);

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const newMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Gemini espera que el contents arranque con role:"user". El
      // greeting inicial del bot (índice 0) y cualquier mensaje "model"
      // que aparezca antes del primer "user" tiene que filtrarse.
      const firstUserIdx = messages.findIndex((m) => m.role === "user");
      const history = (firstUserIdx === -1 ? [] : messages.slice(firstUserIdx)).map(
        (m) => ({ role: m.role, content: m.content })
      );
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error ?? "Error al consultar Russia");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: data.answer,
          properties: data.properties as PropertyCard[],
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Tuve un problema procesando tu mensaje. Probá de nuevo en un toque.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] bg-white rounded-2xl shadow-[0_30px_80px_-20px_rgba(26,34,81,0.25)] overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-magenta to-[#b3006d] text-white">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm flex items-center gap-1.5">
            Russia
            <Sparkles className="h-3.5 w-3.5" />
          </p>
          <p className="text-[11px] opacity-80">
            IA inmobiliaria de Russo · busca en el catálogo en tiempo real
          </p>
        </div>
        <Link
          href="/russia"
          className="text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white border border-white/25 rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          Cómo funciona
        </Link>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-gray-50/30"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-magenta text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-navy rounded-tl-sm shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.properties && msg.properties.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.properties.map((p) => (
                    <PropertyResultCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-magenta animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-magenta animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-2 h-2 rounded-full bg-magenta animate-bounce" style={{ animationDelay: "240ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions (solo cuando no hay conversación previa) */}
      {messages.length === 1 && !loading && (
        <div className="px-4 pt-2 pb-3 flex gap-2 flex-wrap border-t border-gray-100 bg-white">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="text-xs rounded-full border border-magenta/30 bg-magenta/5 px-3 py-1.5 text-magenta hover:bg-magenta/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 bg-white px-3 py-3 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Contale qué buscás · ej: 'depto en Ramos, 2 amb, hasta 100K USD'"
          disabled={loading}
          className="flex-1 rounded-full bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 placeholder:text-gray-400 disabled:opacity-60"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Enviar"
          className="h-10 w-10 flex items-center justify-center rounded-full bg-magenta text-white hover:bg-magenta-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function PropertyResultCard({ property: p }: { property: PropertyCard }) {
  const isAlquiler = p.operation === "alquiler";
  const currency = p.currency === "ARS" ? "$" : "USD";
  const priceLabel =
    p.price === 9999999 ? "Reservado" : `${currency} ${formatPrice(p.price)}`;

  return (
    <Link
      href={`/propiedad/${p.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-white border border-gray-200 hover:border-magenta/40 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="flex gap-2.5">
        <div className="relative h-24 w-24 sm:w-28 flex-shrink-0 bg-gray-100">
          {p.image ? (
            <Image
              src={p.image}
              alt={p.address}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-200" />
          )}
          <span className={`absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white ${isAlquiler ? "bg-navy/90" : "bg-magenta/90"}`}>
            {isAlquiler ? "Alquiler" : "Venta"}
          </span>
        </div>
        <div className="flex-1 min-w-0 py-2 pr-3">
          {/* Precio en su propia línea, sin compartir con código RUS */}
          <p className="font-bold text-navy text-base leading-tight truncate">
            {priceLabel}
          </p>
          {/* Dirección + código RUS chiquito al lado */}
          <p className="text-[11px] text-gray-700 truncate mt-0.5">
            <span>{p.address}</span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-gray-400 font-mono">{p.code}</span>
          </p>
          <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate mb-1.5">
            <MapPin className="h-3 w-3 inline flex-shrink-0" />
            <span className="truncate">{p.locality}</span>
            {typeof p.distanceMeters === "number" && (
              <span className="ml-1 inline-flex items-center rounded-full bg-magenta/10 text-magenta px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0">
                a {formatDistance(p.distanceMeters)}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-navy font-medium">
            {p.totalArea ? (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3 text-magenta" />
                {p.totalArea} m²
              </span>
            ) : null}
            {p.rooms ? (
              <span className="flex items-center gap-1">
                <Home className="h-3 w-3 text-magenta" />
                {p.rooms} amb.
              </span>
            ) : null}
            {p.bedrooms ? (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3 w-3 text-magenta" />
                {p.bedrooms} dorm.
              </span>
            ) : null}
            {p.garage ? (
              <span className="flex items-center gap-1">
                <Car className="h-3 w-3 text-magenta" />
                {p.garage} coch.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
