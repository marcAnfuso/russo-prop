"use client";

import { useState, FormEvent } from "react";
import { Lock, User } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Error al iniciar sesión");
        return;
      }
      window.location.reload();
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy to-[#1a1f5c] px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(230,0,126,0.45), transparent 50%), radial-gradient(circle at 80% 80%, rgba(230,0,126,0.3), transparent 50%)",
        }}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-magenta/10 text-magenta">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy leading-tight">
              Panel interno
            </h1>
            <p className="text-xs text-gray-500">Russo Propiedades</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Ingresá con el usuario y la contraseña que te pasamos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            >
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password || !username}
            className="w-full rounded-lg bg-magenta text-white font-semibold py-2.5 transition-colors hover:bg-magenta-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando…" : "Entrar"}
          </button>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-6">
          ¿Olvidaste la contraseña? Pedile al owner del equipo que la resetee.
        </p>
      </div>
    </main>
  );
}
