"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { deleteTenant, fileToDataUrl, isSlugTaken, slugify, updateTenant } from "@/lib/db";
import { hashTenantPassword } from "@/lib/auth";

export default function AjustesPage() {
  const { tenant, refresh } = useTenant();
  const router = useRouter();

  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [description, setDescription] = useState(tenant.description);
  const [address, setAddress] = useState(tenant.address);
  const [phone, setPhone] = useState(tenant.phone);
  const [themeColor, setThemeColor] = useState(tenant.themeColor);
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl);
  const [coverUrl, setCoverUrl] = useState(tenant.coverUrl);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUrl(await fileToDataUrl(file));
  }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUrl(await fileToDataUrl(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const finalSlug = slugify(slug || name);
    if (!name.trim() || !finalSlug) {
      setError("Completá el nombre del restaurante.");
      return;
    }
    if (newPassword && newPassword.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }
    setSaving(true);
    if (await isSlugTaken(finalSlug, tenant.id)) {
      setError("Ese identificador de URL ya está en uso.");
      setSaving(false);
      return;
    }
    await updateTenant(tenant.id, {
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      address: address.trim(),
      phone: phone.trim(),
      themeColor,
      logoUrl,
      coverUrl,
      ...(newPassword ? { passwordHash: hashTenantPassword(newPassword) } : {}),
    });
    setNewPassword("");
    setSaving(false);
    setSaved(true);
    if (finalSlug !== tenant.slug) {
      router.replace(`/admin/${finalSlug}/ajustes`);
    } else {
      await refresh();
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${tenant.name}" definitivamente? Esto borra su menú y fotos.`)) return;
    await deleteTenant(tenant.id);
    router.push("/admin");
  }

  return (
    <div className="space-y-6 max-w-xl">
      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">URL (/slug)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1">Dirección</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Nueva contraseña del panel (dejar vacío para no cambiarla)
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Mínimo 4 caracteres"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Color del panel</label>
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            className="h-9 w-16 rounded border border-neutral-300"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1">Logo</label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleLogo} className="text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Foto de portada</label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-20 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                {coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="Portada" className="h-full w-full object-cover" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleCover} className="text-sm" />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-700">Cambios guardados.</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700 disabled:opacity-50"
        >
          Guardar cambios
        </button>
      </form>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-red-800">Eliminar restaurante</p>
          <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
