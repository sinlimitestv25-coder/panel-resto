"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { isOwnerSession, isTenantSession, startTenantSession, verifyTenantCredentials } from "@/lib/auth";
import AuthSplitScreen from "./AuthSplitScreen";

export default function TenantGate({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(isOwnerSession() || isTenantSession(tenant.id));
    setReady(true);
  }, [tenant.id]);

  if (!ready) return null;

  if (authed) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (verifyTenantCredentials(tenant, username, password)) {
      startTenantSession(tenant.id);
      setAuthed(true);
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <AuthSplitScreen
      title={tenant.name}
      subtitle="Ingresá el usuario y la contraseña de tu restaurante."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-dark px-4 py-2 text-sm text-white font-medium hover:opacity-90"
        >
          Entrar
        </button>
      </form>
    </AuthSplitScreen>
  );
}
