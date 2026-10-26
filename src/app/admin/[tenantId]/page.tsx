"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import QrCode from "@/components/QrCode";

export default function TenantOverview() {
  const { tenant } = useTenant();
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/${tenant.slug}`);
  }, [tenant.slug]);

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
          <h2 className="font-medium">Menú público</h2>
          <p className="text-sm text-neutral-500 break-all">
            {publicUrl || "cargando…"}
          </p>
          {publicUrl && (
            <Link
              href={`/${tenant.slug}`}
              target="_blank"
              className="inline-block text-sm text-amber-700 underline"
            >
              Ver menú público ↗
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 grid grid-cols-3 gap-4 text-center">
          <Link href={`/admin/${tenant.id}/menu`} className="hover:underline">
            <div className="text-sm text-neutral-500">Editar</div>
            <div className="font-medium">Menú</div>
          </Link>
          <Link href={`/admin/${tenant.id}/fotos`} className="hover:underline">
            <div className="text-sm text-neutral-500">Subir</div>
            <div className="font-medium">Fotos</div>
          </Link>
          <Link href={`/admin/${tenant.id}/qr`} className="hover:underline">
            <div className="text-sm text-neutral-500">Descargar</div>
            <div className="font-medium">QR</div>
          </Link>
        </div>
      </div>

      {publicUrl && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col items-center gap-2">
          <QrCode url={publicUrl} size={160} />
          <span className="text-xs text-neutral-500">Escaneá para ver el menú</span>
        </div>
      )}
    </div>
  );
}
