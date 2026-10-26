"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { isOwnerSession, isTenantSession, startTenantSession, verifyTenantPassword } from "@/lib/auth";

export default function TenantGate({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
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
    if (verifyTenantPassword(tenant.passwordHash, password)) {
      startTenantSession(tenant.id);
      setAuthed(true);
    } else {
      setError("Contraseña incorrecta.");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">{tenant.name}</h1>
        <p className="text-sm text-neutral-500">
          Ingresá la contraseña del restaurante para administrar el panel.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          autoFocus
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
