// Modelo de datos del prototipo. Pensado para mapear 1:1 con las futuras
// tablas de Supabase (tenant_id en cada fila para aislar por restaurante).

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  themeColor: string;
  logoUrl: string | null;
  coverUrl: string | null;
  address: string;
  phone: string;
  username: string;
  passwordHash: string;
  createdAt: string;
};

export type MenuSection = "desayuno" | "almuerzo" | "cena" | "bebidas" | "postres" | "otros";

export const MENU_SECTIONS: { value: MenuSection; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "bebidas", label: "Bebidas" },
  { value: "postres", label: "Postres" },
  { value: "otros", label: "Otros" },
];

export type Category = {
  id: string;
  tenantId: string;
  section: MenuSection;
  name: string;
  order: number;
};

export type DietaryTag = "vegan" | "vegetarian" | "gf" | "sf" | "spicy";

export const DIETARY_TAGS: { value: DietaryTag; icon: string; label: string }[] = [
  { value: "vegan", icon: "🌱", label: "Vegano" },
  { value: "vegetarian", icon: "🧀", label: "Vegetariano" },
  { value: "gf", icon: "🌾", label: "Sin TACC" },
  { value: "sf", icon: "🍯", label: "Sin azúcar" },
  { value: "spicy", icon: "🌶️", label: "Picante" },
];

export type MenuItem = {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  available: boolean;
  order: number;
  dietaryTags: DietaryTag[];
  ingredients: string;
};

export type GalleryPhoto = {
  id: string;
  tenantId: string;
  url: string;
  caption: string;
  createdAt: string;
};
