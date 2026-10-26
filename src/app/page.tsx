import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Panel Resto</h1>
        <p className="text-neutral-600 max-w-md">
          Prototipo de panel multitenant para menús digitales de restaurantes:
          QR, fotos y menú, todo en un solo lugar.
        </p>
      </div>
      <Link
        href="/admin"
        className="rounded-lg bg-neutral-900 px-5 py-2.5 text-white font-medium hover:bg-neutral-700 transition"
      >
        Entrar al panel
      </Link>
    </main>
  );
}
