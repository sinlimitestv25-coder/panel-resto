"use client";

import { buildSeed, type Db } from "./seed";
import type { Category, GalleryPhoto, MenuItem, Tenant } from "./types";

// Repositorio "falso" para el prototipo: guarda todo en localStorage.
// Las funciones son async a propósito, con la misma forma que van a tener
// las futuras consultas a Supabase, para que el reemplazo sea directo.

const STORAGE_KEY = "panelresto_db_v4";

function readDb(): Db {
  if (typeof window === "undefined") return buildSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = buildSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as Db;
  } catch {
    const seed = buildSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeDb(db: Db) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("panelresto:change"));
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

// --- Tenants ---------------------------------------------------------

export async function listTenants(): Promise<Tenant[]> {
  return readDb().tenants;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  return readDb().tenants.find((t) => t.slug === slug) ?? null;
}

export async function getTenant(id: string): Promise<Tenant | null> {
  return readDb().tenants.find((t) => t.id === id) ?? null;
}

export async function createTenant(
  input: Omit<Tenant, "id" | "createdAt">
): Promise<Tenant> {
  const db = readDb();
  const tenant: Tenant = {
    ...input,
    id: newId("tenant"),
    createdAt: new Date().toISOString(),
  };
  db.tenants.push(tenant);
  writeDb(db);
  return tenant;
}

export async function updateTenant(
  id: string,
  patch: Partial<Omit<Tenant, "id">>
): Promise<Tenant | null> {
  const db = readDb();
  const idx = db.tenants.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.tenants[idx] = { ...db.tenants[idx], ...patch };
  writeDb(db);
  return db.tenants[idx];
}

export async function deleteTenant(id: string): Promise<void> {
  const db = readDb();
  db.tenants = db.tenants.filter((t) => t.id !== id);
  db.categories = db.categories.filter((c) => c.tenantId !== id);
  db.items = db.items.filter((i) => i.tenantId !== id);
  db.photos = db.photos.filter((p) => p.tenantId !== id);
  writeDb(db);
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const db = readDb();
  return db.tenants.some((t) => t.slug === slug && t.id !== excludeId);
}

// --- Categories --------------------------------------------------------

export async function listCategories(tenantId: string): Promise<Category[]> {
  return readDb()
    .categories.filter((c) => c.tenantId === tenantId)
    .sort((a, b) => a.order - b.order);
}

export async function createCategory(
  input: Omit<Category, "id">
): Promise<Category> {
  const db = readDb();
  const category: Category = { ...input, id: newId("cat") };
  db.categories.push(category);
  writeDb(db);
  return category;
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<Category, "id">>
): Promise<Category | null> {
  const db = readDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.categories[idx] = { ...db.categories[idx], ...patch };
  writeDb(db);
  return db.categories[idx];
}

export async function deleteCategory(id: string): Promise<void> {
  const db = readDb();
  db.categories = db.categories.filter((c) => c.id !== id);
  db.items = db.items.filter((i) => i.categoryId !== id);
  writeDb(db);
}

// --- Menu items ----------------------------------------------------------

export async function listItems(tenantId: string): Promise<MenuItem[]> {
  return readDb()
    .items.filter((i) => i.tenantId === tenantId)
    .sort((a, b) => a.order - b.order);
}

export async function createItem(input: Omit<MenuItem, "id">): Promise<MenuItem> {
  const db = readDb();
  const item: MenuItem = { ...input, id: newId("item") };
  db.items.push(item);
  writeDb(db);
  return item;
}

export async function updateItem(
  id: string,
  patch: Partial<Omit<MenuItem, "id">>
): Promise<MenuItem | null> {
  const db = readDb();
  const idx = db.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  db.items[idx] = { ...db.items[idx], ...patch };
  writeDb(db);
  return db.items[idx];
}

export async function deleteItem(id: string): Promise<void> {
  const db = readDb();
  db.items = db.items.filter((i) => i.id !== id);
  writeDb(db);
}

// --- Gallery photos ------------------------------------------------------

export async function listPhotos(tenantId: string): Promise<GalleryPhoto[]> {
  return readDb()
    .photos.filter((p) => p.tenantId === tenantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addPhoto(
  input: Omit<GalleryPhoto, "id" | "createdAt">
): Promise<GalleryPhoto> {
  const db = readDb();
  const photo: GalleryPhoto = {
    ...input,
    id: newId("photo"),
    createdAt: new Date().toISOString(),
  };
  db.photos.push(photo);
  writeDb(db);
  return photo;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = readDb();
  db.photos = db.photos.filter((p) => p.id !== id);
  writeDb(db);
}

// --- Utilidades ------------------------------------------------------

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
