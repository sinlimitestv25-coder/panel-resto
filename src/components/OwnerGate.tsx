"use client";

import { useEffect, useState } from "react";
import {
  endOwnerSession,
  hasOwnerPassword,
  isOwnerSession,
  setOwnerPassword,
  startOwnerSession,
  verifyOwnerPassword,
} from "@/lib/auth";

export default function OwnerGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
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
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 4) {
      setError("Usá al menos 4 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setOwnerPassword(password);
    startOwnerSession();
    onDone();
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Panel Resto · Administrador</h1>
        <p className="text-sm text-neutral-500">
          Primera vez acá: creá tu contraseña de administrador.
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
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700"
        >
          Crear contraseña y entrar
        </button>
      </form>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (verifyOwnerPassword(password)) {
      onSuccess();
    } else {
      setError("Contraseña incorrecta.");
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Panel Resto · Administrador</h1>
        <p className="text-sm text-neutral-500">Ingresá tu contraseña para entrar.</p>
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
