"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTenant } from "@/lib/tenant-context";

export default function QrPage() {
  const { tenant } = useTenant();
  const [publicUrl, setPublicUrl] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/${tenant.slug}`);
  }, [tenant.slug]);

  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { width: 512, margin: 2 }).then(setDataUrl);
  }, [publicUrl]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 flex flex-col items-center gap-4 max-w-sm">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="Código QR" className="w-64 h-64 rounded-lg" />
      ) : (
        <div className="w-64 h-64 rounded-lg bg-neutral-100 animate-pulse" />
      )}
      <p className="text-sm text-neutral-500 text-center break-all">{publicUrl}</p>
      {dataUrl && (
        <a
          href={dataUrl}
          download={`qr-${tenant.slug}.png`}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700"
        >
          Descargar QR (PNG)
        </a>
      )}
      <p className="text-xs text-neutral-400 text-center">
        Nota: mientras el proyecto corre en tu máquina (localhost), el QR solo
        va a abrir desde el mismo dispositivo o la misma red. Al publicar el
        sitio (por ejemplo en Vercel) el QR va a funcionar desde cualquier celular.
      </p>
    </div>
  );
}
