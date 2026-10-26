import { simpleHash } from "./auth";
import type { Category, GalleryPhoto, MenuItem, Tenant } from "./types";

export type Db = {
  tenants: Tenant[];
  categories: Category[];
  items: MenuItem[];
  photos: GalleryPhoto[];
};

const now = new Date().toISOString();

export function buildSeed(): Db {
  const tenantId = "demo-1";

  const tenants: Tenant[] = [
    {
      id: tenantId,
      slug: "la-esquina",
      name: "La Esquina",
      description: "Bar y restaurante de barrio, cocina de autor con onda casera.",
      themeColor: "#b45309",
      logoUrl: null,
      coverUrl: null,
      address: "Av. Siempre Viva 123",
      phone: "+54 9 11 1234-5678",
      username: "la-esquina",
      passwordHash: simpleHash("esquina123"),
      createdAt: now,
    },
  ];

  const categories: Category[] = [
    { id: "cat-1", tenantId, section: "desayuno", name: "Desayunos y Meriendas", order: 0 },
    { id: "cat-2", tenantId, section: "almuerzo", name: "Platos Principales", order: 1 },
    { id: "cat-3", tenantId, section: "bebidas", name: "Bebidas", order: 2 },
    { id: "cat-4", tenantId, section: "postres", name: "Postres", order: 3 },
  ];

  const items: MenuItem[] = [
    {
      id: "item-1",
      tenantId,
      categoryId: "cat-1",
      name: "Tostado jamón y queso",
      description: "Pan de campo, jamón natural y queso cremoso.",
      price: 3500,
      imageUrl: null,
      available: true,
      order: 0,
    },
    {
      id: "item-2",
      tenantId,
      categoryId: "cat-1",
      name: "Café con leche + medialunas (x2)",
      description: "Medialunas de manteca recién horneadas.",
      price: 2800,
      imageUrl: null,
      available: true,
      order: 1,
    },
    {
      id: "item-3",
      tenantId,
      categoryId: "cat-2",
      name: "Milanesa con papas",
      description: "A elección: carne o pollo, con papas fritas o puré.",
      price: 7200,
      imageUrl: null,
      available: true,
      order: 0,
    },
    {
      id: "item-4",
      tenantId,
      categoryId: "cat-3",
      name: "Limonada con menta",
      description: "Jarra de 1 litro.",
      price: 3200,
      imageUrl: null,
      available: true,
      order: 0,
    },
    {
      id: "item-5",
      tenantId,
      categoryId: "cat-4",
      name: "Flan casero",
      description: "Con dulce de leche y crema.",
      price: 3000,
      imageUrl: null,
      available: true,
      order: 0,
    },
  ];

  const photos: GalleryPhoto[] = [];

  return { tenants, categories, items, photos };
}
