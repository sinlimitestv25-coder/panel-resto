"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTenant } from "./db";
import type { Tenant } from "./types";

type TenantContextValue = {
  tenant: Tenant;
  refresh: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  tenantId,
  children,
}: {
  tenantId: string;
  children: React.ReactNode;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function refresh() {
    const t = await getTenant(tenantId);
    if (!t) {
      setNotFound(true);
      return;
    }
    setTenant(t);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  if (notFound) {
    return (
      <p className="text-neutral-500 text-sm">
        No encontramos ese restaurante.
      </p>
    );
  }

  if (!tenant) return null;

  return (
    <TenantContext.Provider value={{ tenant, refresh }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant debe usarse dentro de TenantProvider");
  return ctx;
}
