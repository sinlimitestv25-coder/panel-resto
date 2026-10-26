"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { TenantProvider, useTenant } from "@/lib/tenant-context";

const TABS = [
  { href: "", label: "Resumen" },
  { href: "/menu", label: "Menú" },
  { href: "/fotos", label: "Fotos" },
  { href: "/qr", label: "QR" },
  { href: "/ajustes", label: "Ajustes" },
];

function TabNav({ slug }: { slug: string }) {
  const { tenant } = useTenant();
  const pathname = usePathname();
  const base = `/admin/${slug}`;

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Todos los restaurantes
        </Link>
        <h1 className="text-xl font-semibold mt-1">{tenant.name}</h1>
      </div>
      <nav className="flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => {
          const href = `${base}${tab.href}`;
          const active = pathname === href;
          return (
            <Link
              key={tab.href}
              href={href}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                active
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  return (
    <TenantProvider slug={slug}>
      <div className="space-y-6">
        <TabNav slug={slug} />
        {children}
      </div>
    </TenantProvider>
  );
}
