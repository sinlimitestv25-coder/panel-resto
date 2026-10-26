"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({
  url,
  size = 220,
}: {
  url: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { width: size, margin: 1 }).then((d) => {
      if (active) setDataUrl(d);
    });
    return () => {
      active = false;
    };
  }, [url, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-neutral-100 animate-pulse"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={`Código QR hacia ${url}`}
      width={size}
      height={size}
      className="rounded-lg border border-neutral-200"
    />
  );
}
