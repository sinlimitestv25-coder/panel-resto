import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-restogo.png" alt="RestoGo" className="h-10 w-auto mx-auto" />
        <p className="text-neutral-600 max-w-md">
          Gestión gastronómica: menú digital, fotos y QR para tu restaurante,
          todo en un solo lugar.
        </p>
      </div>
      <Link
        href="/admin"
        className="rounded-lg bg-brand-dark px-5 py-2.5 text-white font-medium hover:opacity-90 transition"
      >
        Entrar al panel
      </Link>
    </main>
  );
}
