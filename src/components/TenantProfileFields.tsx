"use client";

import { fileToDataUrl } from "@/lib/db";

type Props = {
  name: string;
  onNameChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  address: string;
  onAddressChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  themeColor: string;
  onThemeColorChange: (v: string) => void;
  logoUrl: string | null;
  onLogoChange: (v: string) => void;
  coverUrl: string | null;
  onCoverChange: (v: string) => void;
};

export default function TenantProfileFields({
  name,
  onNameChange,
  slug,
  onSlugChange,
  description,
  onDescriptionChange,
  address,
  onAddressChange,
  phone,
  onPhoneChange,
  themeColor,
  onThemeColorChange,
  logoUrl,
  onLogoChange,
  coverUrl,
  onCoverChange,
}: Props) {
  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (v: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(await fileToDataUrl(file));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">Nombre del restaurante</label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Ej: La Esquina"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">URL del menú público (/slug)</label>
          <input
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="la-esquina"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Ej: Bar y restaurante de barrio, cocina de autor con onda casera."
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">Dirección</label>
          <input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Teléfono</label>
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Color del panel</label>
        <input
          type="color"
          value={themeColor}
          onChange={(e) => onThemeColorChange(e.target.value)}
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e, onLogoChange)}
              className="text-sm"
            />
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e, onCoverChange)}
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
