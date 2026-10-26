"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createTenant, isSlugTaken, listTenants, slugify } from "@/lib/db";
import { hashTenantPassword } from "@/lib/auth";
import OwnerGate from "@/components/OwnerGate";
import TenantProfileFields from "@/components/TenantProfileFields";
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
          className="rounded-lg bg-brand-dark px-4 py-2 text-sm text-white font-medium hover:opacity-90"
        >
          {showForm ? "Cancelar" : "+ Nuevo restaurante"}
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-brand-green/10 text-brand-green-dark flex items-center justify-center font-semibold">
          {tenants.length}
        </div>
        <div>
          <div className="font-medium">
            {tenants.length === 1 ? "restaurante activo" : "restaurantes activos"}
          </div>
          <div className="text-xs text-neutral-500">Total de restaurantes cargados en RestoGo.</div>
        </div>
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
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [themeColor, setThemeColor] = useState("#b45309");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
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
    const finalUsername = (username || finalSlug).trim();
    if (!finalUsername) {
      setError("Completá el usuario para el panel del restaurante.");
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
      description: description.trim(),
      themeColor,
      logoUrl,
      coverUrl,
      address: address.trim(),
      phone: phone.trim(),
      username: finalUsername,
      passwordHash: hashTenantPassword(password),
    });
    setSaving(false);
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4"
    >
      <TenantProfileFields
        name={name}
        onNameChange={(v) => {
          setName(v);
          if (!slugEdited) setSlug(slugify(v));
          if (!usernameEdited) setUsername(slugify(v));
        }}
        slug={slug}
        onSlugChange={(v) => {
          setSlugEdited(true);
          setSlug(v);
        }}
        description={description}
        onDescriptionChange={setDescription}
        address={address}
        onAddressChange={setAddress}
        phone={phone}
        onPhoneChange={setPhone}
        themeColor={themeColor}
        onThemeColorChange={setThemeColor}
        logoUrl={logoUrl}
        onLogoChange={setLogoUrl}
        coverUrl={coverUrl}
        onCoverChange={setCoverUrl}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">
            Usuario para el panel del restaurante
          </label>
          <input
            value={username}
            onChange={(e) => {
              setUsernameEdited(true);
              setUsername(e.target.value);
            }}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder={slug || "la-esquina"}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Mínimo 4 caracteres"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-neutral-400">
        Le pasás al restaurante el link /admin/{slug || "su-slug"} junto con este usuario y contraseña.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-dark px-4 py-2 text-sm text-white font-medium hover:opacity-90 disabled:opacity-50"
      >
        Crear restaurante
      </button>
    </form>
  );
}
