"use client";

import { useEffect, useState } from "react";
import {
  DEMO_OWNER_PASSWORD,
  DEMO_OWNER_USERNAME,
  endOwnerSession,
  hasOwnerPassword,
  isOwnerSession,
  seedOwnerCredentialsIfNeeded,
  setOwnerCredentials,
  startOwnerSession,
  verifyOwnerCredentials,
} from "@/lib/auth";
import AuthSplitScreen from "./AuthSplitScreen";

export default function OwnerGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    seedOwnerCredentialsIfNeeded(DEMO_OWNER_USERNAME, DEMO_OWNER_PASSWORD);
    setNeedsSetup(!hasOwnerPassword());
    setAuthed(isOwnerSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (authed) {
    return (
      <div>
        <div className="flex justify-end -mt-2 mb-2">
          <button
            onClick={() => {
              endOwnerSession();
              setAuthed(false);
            }}
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            Cerrar sesión de administrador
          </button>
        </div>
        {children}
      </div>
    );
  }

  if (needsSetup) {
    return (
      <SetupForm
        onDone={() => {
          setNeedsSetup(false);
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <LoginForm
      onSuccess={() => {
        startOwnerSession();
        setAuthed(true);
      }}
    />
  );
}

function SetupForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("Elegí un usuario.");
      return;
    }
    if (password.length < 4) {
      setError("Usá al menos 4 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setOwnerCredentials(username, password);
    startOwnerSession();
    onDone();
  }

  return (
    <AuthSplitScreen
      title="Creá tu acceso de administrador"
      subtitle="Primera vez acá: elegí tu usuario y contraseña."
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
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repetí la contraseña"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-dark px-4 py-2 text-sm text-white font-medium hover:opacity-90"
        >
          Crear acceso y entrar
        </button>
      </form>
    </AuthSplitScreen>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (verifyOwnerCredentials(username, password)) {
      onSuccess();
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <AuthSplitScreen title="Acceso de administrador" subtitle="Ingresá para gestionar RestoGo.">
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
