"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import { addPhoto, deletePhoto, fileToDataUrl, listPhotos } from "@/lib/db";
import type { GalleryPhoto } from "@/lib/types";

export default function FotosPage() {
  const { tenant } = useTenant();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [caption, setCaption] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setPhotos(await listPhotos(tenant.id));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(await fileToDataUrl(file));
  }

  async function handleUpload() {
    if (!pending) return;
    await addPhoto({ tenantId: tenant.id, url: pending, caption: caption.trim() });
    setPending(null);
    setCaption("");
    await refresh();
  }

  async function handleDelete(id: string) {
    await deletePhoto(id);
    await refresh();
  }

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
        <h2 className="font-medium">Subir foto</h2>
        <p className="text-sm text-neutral-500">
          Fotos del local, platos sueltos o lo que quieras mostrar en el menú
          público.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Descripción (opcional)"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={!pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700 disabled:opacity-50"
          >
            Guardar foto
          </button>
        </div>
        {pending && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pending} alt="Vista previa" className="h-24 rounded-lg object-cover" />
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no subiste fotos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption} className="h-32 w-full object-cover" />
              <div className="p-2 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-500 truncate">
                  {p.caption || "Sin descripción"}
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-600 hover:underline shrink-0"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
