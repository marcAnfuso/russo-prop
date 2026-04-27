"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Users, Plus, Trash2, KeyRound, ShieldCheck, Shield } from "lucide-react";

export interface AdminUserView {
  id: number;
  username: string;
  display_name: string;
  role: "owner" | "admin";
  created_at: string;
  last_login_at: string | null;
  created_by: string | null;
}

interface Props {
  currentUser: {
    id: number;
    username: string;
    role: "owner" | "admin";
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "Nunca";
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UsersPanel({ currentUser }: Props) {
  const isOwner = currentUser.role === "owner";
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [resetPwdId, setResetPwdId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDelete(id: number, displayName: string) {
    if (!confirm(`¿Borrar a ${displayName}? No se puede deshacer.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Error al borrar");
      }
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al borrar");
    } finally {
      setBusyId(null);
    }
  }

  async function handleChangeRole(
    id: number,
    displayName: string,
    newRole: "owner" | "admin"
  ) {
    const verb = newRole === "owner" ? "promover a owner" : "bajar a admin";
    if (!confirm(`¿${verb.charAt(0).toUpperCase() + verb.slice(1)} a ${displayName}?`)) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Error al cambiar rol");
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cambiar rol");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-magenta/10 text-magenta">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy">Usuarios del panel</h2>
            <p className="text-xs text-gray-500">
              {isOwner
                ? "Sólo vos (owner) podés crear o borrar usuarios."
                : "Podés cambiar tu propia contraseña desde acá."}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-magenta px-3 py-2 text-sm font-semibold text-white hover:bg-magenta-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Cargando…</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Todavía no hay usuarios cargados.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Usuario</th>
                <th className="text-left px-4 py-2.5 font-semibold">Rol</th>
                <th className="text-left px-4 py-2.5 font-semibold">Último ingreso</th>
                <th className="text-left px-4 py-2.5 font-semibold">Creado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">
                        {u.display_name}
                        {isMe && (
                          <span className="ml-2 text-[10px] font-normal text-gray-400">
                            (vos)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {u.username}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleControl
                        user={u}
                        isOwner={isOwner}
                        isMe={isMe}
                        busy={busyId === u.id}
                        onChange={(newRole) => handleChangeRole(u.id, u.display_name, newRole)}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(u.last_login_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(u.created_at)}
                      {u.created_by && (
                        <span className="block text-gray-400">
                          por {u.created_by}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(isMe || isOwner) && (
                          <button
                            type="button"
                            onClick={() => setResetPwdId(u.id)}
                            className="p-1.5 rounded text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                            title={isMe ? "Cambiar mi contraseña" : "Resetear contraseña"}
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                        )}
                        {isOwner && !isMe && u.role !== "owner" && (
                          <button
                            type="button"
                            disabled={busyId === u.id}
                            onClick={() => handleDelete(u.id, u.display_name)}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Borrar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && isOwner && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}

      {resetPwdId !== null && (
        <ResetPasswordModal
          userId={resetPwdId}
          userName={users.find((u) => u.id === resetPwdId)?.display_name ?? ""}
          isSelf={resetPwdId === currentUser.id}
          onClose={() => setResetPwdId(null)}
        />
      )}
    </section>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "owner">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Error");
        return;
      }
      onCreated();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-navy mb-4">Nuevo usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field
            label="Nombre visible"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Franco Russo"
            required
          />
          <Field
            label="Usuario (para login)"
            value={username}
            onChange={(v) => setUsername(v.toLowerCase())}
            placeholder="franco"
            hint="3-32 caracteres: a-z, 0-9, . _ -"
            required
          />
          <Field
            label="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            hint="Mínimo 8 caracteres"
            required
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "owner")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
            >
              <option value="admin">Admin (puede usar el panel)</option>
              <option value="owner">Owner (puede gestionar usuarios)</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-magenta text-white text-sm font-semibold hover:bg-magenta-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({
  userId,
  userName,
  isSelf,
  onClose,
}: {
  userId: number;
  userName: string;
  isSelf: boolean;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Error");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-navy mb-2">
          {isSelf ? "Cambiar mi contraseña" : `Resetear contraseña · ${userName}`}
        </h3>
        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Contraseña actualizada correctamente.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy-700 transition-colors"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              label="Nueva contraseña"
              value={password}
              onChange={setPassword}
              type="password"
              hint="Mínimo 8 caracteres"
              required
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || password.length < 8}
                className="px-4 py-2 rounded-lg bg-magenta text-white text-sm font-semibold hover:bg-magenta-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando…" : "Actualizar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition-colors focus:border-magenta focus:ring-2 focus:ring-magenta/20"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function RoleControl({
  user,
  isOwner,
  isMe,
  busy,
  onChange,
}: {
  user: AdminUserView;
  isOwner: boolean;
  isMe: boolean;
  busy: boolean;
  onChange: (newRole: "owner" | "admin") => void;
}) {
  // Sólo el owner puede tocar roles, y nunca el suyo propio.
  const canEdit = isOwner && !isMe;

  if (!canEdit) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          user.role === "owner"
            ? "bg-magenta/10 text-magenta"
            : "bg-navy-50 text-navy"
        }`}
      >
        {user.role === "owner" ? (
          <ShieldCheck className="h-3 w-3" />
        ) : (
          <Shield className="h-3 w-3" />
        )}
        {user.role === "owner" ? "Owner" : "Admin"}
      </span>
    );
  }

  return (
    <select
      value={user.role}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as "owner" | "admin")}
      className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border outline-none cursor-pointer transition-colors ${
        user.role === "owner"
          ? "bg-magenta/10 text-magenta border-magenta/30 hover:bg-magenta/15"
          : "bg-navy-50 text-navy border-navy-100 hover:bg-navy-100"
      } disabled:opacity-50`}
    >
      <option value="admin">Admin</option>
      <option value="owner">Owner</option>
    </select>
  );
}
