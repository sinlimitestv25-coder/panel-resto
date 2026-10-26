"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createTenant, isSlugTaken, listTenants, slugify } from "@/lib/db";
import { hashTenantPassword } from "@/lib/auth";
import OwnerGate from "@/components/OwnerGate";
import type { Tenant } from "@/lib/types";

export default function AdminHome() {
  return (
    <OwnerGate>
      <AdminHomeContent />
    </OwnerGate>
  );
}

function AdminHomeContent() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    setTenants(await listTenants());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Restaurantes</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700"
        >
          {showForm ? "Cancelar" : "+ Nuevo restaurante"}
        </button>
      </div>

      {showForm && (
        <NewTenantForm
          onCreated={async () => {
            setShowForm(false);
            await refresh();
          }}
        />
      )}

      {tenants.length === 0 ? (
        <p className="text-neutral-500 text-sm">Todavía no hay restaurantes cargados.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tenants.map((t) => (
            <Link
              key={t.id}
              href={`/admin/${t.slug}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition flex gap-3 items-center"
            >
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold shrink-0"
                style={{ backgroundColor: t.themeColor }}
              >
                {t.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{t.name}</div>
                <div className="text-sm text-neutral-500 truncate">/{t.slug}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewTenantForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const finalSlug = slugify(slug || name);
    if (!name.trim() || !finalSlug) {
      setError("Completá el nombre del restaurante.");
      return;
    }
    if (password.length < 4) {
      setError("La contraseña del restaurante debe tener al menos 4 caracteres.");
      return;
    }
    setSaving(true);
    if (await isSlugTaken(finalSlug)) {
      setError("Ese identificador de URL ya está en uso, probá otro.");
      setSaving(false);
      return;
    }
    await createTenant({
      name: name.trim(),
      slug: finalSlug,
      description: "",
      themeColor: "#b45309",
      logoUrl: null,
      coverUrl: null,
      address: "",
      phone: "",
      passwordHash: hashTenantPassword(password),
    });
    setSaving(false);
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del restaurante</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Ej: La Esquina"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          URL del menú público
        </label>
        <div className="flex items-center text-sm text-neutral-500">
          <span className="mr-1">/</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
            placeholder="la-esquina"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Contraseña para el panel del restaurante
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Mínimo 4 caracteres"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Se la pasás al restaurante junto con el link /admin/{slug || "su-slug"}.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700 disabled:opacity-50"
      >
        Crear restaurante
      </button>
    </form>
  );
}
