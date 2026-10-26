"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/lib/tenant-context";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  fileToDataUrl,
  listCategories,
  listItems,
  updateItem,
} from "@/lib/db";
import { MENU_SECTIONS, type Category, type MenuItem, type MenuSection } from "@/lib/types";

export default function MenuPage() {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  async function refresh() {
    const [cats, its] = await Promise.all([
      listCategories(tenant.id),
      listItems(tenant.id),
    ]);
    setCategories(cats);
    setItems(its);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id]);

  if (loading) return null;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Categorías y platos</h2>
        <button
          onClick={() => setShowCategoryForm((v) => !v)}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
        >
          {showCategoryForm ? "Cancelar" : "+ Nueva categoría"}
        </button>
      </div>

      {showCategoryForm && (
        <CategoryForm
          tenantId={tenant.id}
          nextOrder={categories.length}
          onDone={async () => {
            setShowCategoryForm(false);
            await refresh();
          }}
        />
      )}

      {categories.length === 0 && (
        <p className="text-sm text-neutral-500">
          Todavía no hay categorías. Creá una para empezar a agregar platos.
        </p>
      )}

      <div className="space-y-5">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            items={items.filter((i) => i.categoryId === cat.id)}
            onChange={refresh}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryForm({
  tenantId,
  nextOrder,
  onDone,
}: {
  tenantId: string;
  nextOrder: number;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [section, setSection] = useState<MenuSection>("almuerzo");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createCategory({ tenantId, name: name.trim(), section, order: nextOrder });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-wrap gap-3 items-end"
    >
      <div>
        <label className="block text-xs font-medium mb-1">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Ej: Entradas"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Momento del día</label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value as MenuSection)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {MENU_SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700"
      >
        Crear categoría
      </button>
    </form>
  );
}

function CategoryCard({
  category,
  items,
  onChange,
}: {
  category: Category;
  items: MenuItem[];
  onChange: () => void;
}) {
  const [showItemForm, setShowItemForm] = useState(false);

  async function handleDeleteCategory() {
    if (!confirm(`¿Eliminar la categoría "${category.name}" y sus platos?`)) return;
    await deleteCategory(category.id);
    onChange();
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="min-w-0">
          <span className="font-medium">{category.name}</span>
          <span className="ml-2 text-xs text-neutral-500">
            {MENU_SECTIONS.find((s) => s.value === category.section)?.label}
          </span>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setShowItemForm((v) => !v)}
            className="text-sm text-amber-700 hover:underline whitespace-nowrap"
          >
            {showItemForm ? "Cancelar" : "+ Agregar plato"}
          </button>
          <button
            onClick={handleDeleteCategory}
            className="text-sm text-red-600 hover:underline whitespace-nowrap"
          >
            Eliminar categoría
          </button>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {showItemForm && (
          <div className="p-4">
            <ItemForm
              tenantId={category.tenantId}
              categoryId={category.id}
              nextOrder={items.length}
              onDone={() => {
                setShowItemForm(false);
                onChange();
              }}
            />
          </div>
        )}
        {items.length === 0 && !showItemForm && (
          <p className="p-4 text-sm text-neutral-400">Sin platos todavía.</p>
        )}
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}

function ItemRow({ item, onChange }: { item: MenuItem; onChange: () => void }) {
  const [editing, setEditing] = useState(false);

  async function toggleAvailable() {
    await updateItem(item.id, { available: !item.available });
    onChange();
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${item.name}"?`)) return;
    await deleteItem(item.id);
    onChange();
  }

  if (editing) {
    return (
      <div className="p-4">
        <ItemForm
          tenantId={item.tenantId}
          categoryId={item.categoryId}
          nextOrder={item.order}
          existing={item}
          onDone={() => {
            setEditing(false);
            onChange();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-lg bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center text-neutral-400 text-xs">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            "sin foto"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item.name}</span>
            {!item.available && (
              <span className="text-xs rounded bg-neutral-200 px-1.5 py-0.5 shrink-0">Agotado</span>
            )}
          </div>
          <p className="text-sm text-neutral-500 truncate">{item.description}</p>
        </div>
        <div className="text-sm font-medium whitespace-nowrap shrink-0">
          ${item.price.toLocaleString("es-AR")}
        </div>
      </div>
      <div className="flex gap-3 text-sm flex-wrap justify-end">
        <button onClick={toggleAvailable} className="text-neutral-500 hover:underline">
          {item.available ? "Marcar agotado" : "Marcar disponible"}
        </button>
        <button onClick={() => setEditing(true)} className="text-amber-700 hover:underline">
          Editar
        </button>
        <button onClick={handleDelete} className="text-red-600 hover:underline">
          Eliminar
        </button>
      </div>
    </div>
  );
}

function ItemForm({
  tenantId,
  categoryId,
  nextOrder,
  existing,
  onDone,
}: {
  tenantId: string;
  categoryId: string;
  nextOrder: number;
  existing?: MenuItem;
  onDone: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(await fileToDataUrl(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      tenantId,
      categoryId,
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      imageUrl,
      available: existing?.available ?? true,
      order: existing?.order ?? nextOrder,
    };
    if (existing) {
      await updateItem(existing.id, payload);
    } else {
      await createItem(payload);
    }
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-neutral-50 p-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-16 w-16 rounded-lg bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center text-neutral-400 text-xs">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            "foto"
          )}
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-medium mb-1">Foto del plato</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="text-sm min-w-0 max-w-full"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="block text-xs font-medium mb-1">Nombre del plato</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Precio</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          rows={2}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white font-medium hover:bg-neutral-700 disabled:opacity-50"
      >
        {existing ? "Guardar cambios" : "Agregar plato"}
      </button>
    </form>
  );
}
