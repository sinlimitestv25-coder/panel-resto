"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTenantBySlug, listCategories, listItems, listPhotos } from "@/lib/db";
import { MENU_SECTIONS } from "@/lib/types";
import type { Category, GalleryPhoto, MenuItem, Tenant } from "@/lib/types";

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null | "not-found">(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  useEffect(() => {
    (async () => {
      const t = await getTenantBySlug(slug);
      if (!t) {
        setTenant("not-found");
        return;
      }
      setTenant(t);
      const [cats, its, phs] = await Promise.all([
        listCategories(t.id),
        listItems(t.id),
        listPhotos(t.id),
      ]);
      setCategories(cats);
      setItems(its);
      setPhotos(phs);
    })();
  }, [slug]);

  if (tenant === null) return null;

  if (tenant === "not-found") {
    return (
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-neutral-500">No encontramos este menú.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-neutral-50">
      <div
        className="h-32 sm:h-48 w-full bg-neutral-200"
        style={
          tenant.coverUrl
            ? { backgroundImage: `url(${tenant.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: tenant.themeColor }
        }
      />
      <div className="max-w-md mx-auto -mt-10 px-4">
        <div className="flex items-end gap-3">
          <div
            className="h-20 w-20 rounded-2xl border-4 border-neutral-50 overflow-hidden shrink-0 flex items-center justify-center text-white text-2xl font-semibold"
            style={{ backgroundColor: tenant.themeColor }}
          >
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
            ) : (
              tenant.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-bold">{tenant.name}</h1>
            {tenant.address && <p className="text-xs text-neutral-500">{tenant.address}</p>}
          </div>
        </div>

        {tenant.description && (
          <p className="mt-3 text-sm text-neutral-600">{tenant.description}</p>
        )}

        <div className="mt-6 space-y-8 pb-16">
          {MENU_SECTIONS.map((section) => {
            const sectionCategories = categories.filter((c) => c.section === section.value);
            if (sectionCategories.length === 0) return null;
            return (
              <div key={section.value} className="space-y-5">
                <h2 className="text-lg font-semibold border-b border-neutral-200 pb-1">
                  {section.label}
                </h2>
                {sectionCategories.map((cat) => {
                  const catItems = items.filter((i) => i.categoryId === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-3">
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                        {cat.name}
                      </h3>
                      <div className="space-y-3">
                        {catItems.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="h-16 w-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                              {item.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm font-semibold whitespace-nowrap">
                                  ${item.price.toLocaleString("es-AR")}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-neutral-500">{item.description}</p>
                              )}
                              {!item.available && (
                                <span className="text-xs text-red-500">No disponible</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {categories.length === 0 && (
            <p className="text-sm text-neutral-400 text-center">
              Este restaurante todavía no cargó su menú.
            </p>
          )}

          {photos.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold border-b border-neutral-200 pb-1">Fotos</h2>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.url}
                    alt={p.caption}
                    className="h-20 w-full object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {tenant.phone && (
            <p className="text-sm text-neutral-500 text-center">📞 {tenant.phone}</p>
          )}
        </div>
      </div>
    </main>
  );
}
