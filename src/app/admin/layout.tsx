import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-restogo.png" alt="RestoGo" className="h-6 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
            Salir
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl w-full flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
