"use client";

export default function AuthSplitScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex md:w-1/2 bg-brand-dark flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="relative rounded-2xl bg-white px-8 py-6 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-restogo.png" alt="RestoGo" className="w-56" />
        </div>
        <p className="relative text-neutral-300 text-center max-w-sm">
          Gestioná el menú digital, las fotos y el QR de tu restaurante, todo
          en un solo lugar.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex flex-col items-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-restogo.png" alt="RestoGo" className="w-44 mb-1" />
          </div>
          <h1 className="text-xl font-semibold text-center mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500 text-center mb-6">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
