"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { getTenantBySlug, listCategories, listItems, listPhotos } from "@/lib/db";
import { DIETARY_TAGS, MENU_SECTIONS } from "@/lib/types";
import type { Category, DietaryTag, GalleryPhoto, MenuItem, MenuSection, Tenant } from "@/lib/types";
import { CURRENCIES, formatPrice, type Currency } from "@/lib/currency";
import { LANGUAGES, t, type Lang } from "@/lib/i18n";
import {
  ArrowRightIcon,
  BellIcon,
  CartIcon,
  CloseIcon,
  MinusIcon,
  MoonIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  SunIcon,
  TrashIcon,
} from "@/components/icons";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"] });

const LANG_KEY = "restogo_menu_lang";
const CURRENCY_KEY = "restogo_menu_currency";
const THEME_KEY = "restogo_menu_theme";

const SECTION_KEY: Record<MenuSection, "sectionDesayuno" | "sectionAlmuerzo" | "sectionCena" | "sectionBebidas" | "sectionPostres" | "sectionOtros"> = {
  desayuno: "sectionDesayuno",
  almuerzo: "sectionAlmuerzo",
  cena: "sectionCena",
  bebidas: "sectionBebidas",
  postres: "sectionPostres",
  otros: "sectionOtros",
};

const TAG_KEY: Record<DietaryTag, "filterVegan" | "filterVegetarian" | "filterGf" | "filterSf" | "filterSpicy"> = {
  vegan: "filterVegan",
  vegetarian: "filterVegetarian",
  gf: "filterGf",
  sf: "filterSf",
  spicy: "filterSpicy",
};

type CartLine = { itemId: string; qty: number };

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const table = searchParams.get("mesa");

  const [tenant, setTenant] = useState<Tenant | null | "not-found">(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  const [lang, setLang] = useState<Lang>("es");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [dark, setDark] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<DietaryTag | "all">("all");
  const [activeSection, setActiveSection] = useState<MenuSection | null>(null);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [notes, setNotes] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [activeDish, setActiveDish] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const l = window.localStorage.getItem(LANG_KEY) as Lang | null;
    const c = window.localStorage.getItem(CURRENCY_KEY) as Currency | null;
    const d = window.localStorage.getItem(THEME_KEY);
    if (l) setLang(l);
    if (c) setCurrency(c);
    if (d) setDark(d === "dark");
    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    window.localStorage.setItem(LANG_KEY, lang);
  }, [lang, prefsReady]);
  useEffect(() => {
    if (!prefsReady) return;
    window.localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency, prefsReady]);
  useEffect(() => {
    if (!prefsReady) return;
    window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, prefsReady]);

  useEffect(() => {
    (async () => {
      const tn = await getTenantBySlug(slug);
      if (!tn) {
        setTenant("not-found");
        return;
      }
      setTenant(tn);
      const [cats, its, phs] = await Promise.all([
        listCategories(tn.id),
        listItems(tn.id),
        listPhotos(tn.id),
      ]);
      setCategories(cats);
      setItems(its);
      setPhotos(phs);
    })();
  }, [slug]);

  useEffect(() => {
    if (activeSection) return;
    const first = MENU_SECTIONS.find((s) => categories.some((c) => c.section === s.value));
    if (first) setActiveSection(first.value);
  }, [categories, activeSection]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  if (tenant === null) return null;

  if (tenant === "not-found") {
    return (
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-neutral-500">{t(lang, "notFoundText")}</p>
      </main>
    );
  }

  const accent = tenant.themeColor;
  const sectionsPresent = MENU_SECTIONS.filter((s) => categories.some((c) => c.section === s.value));

  const visibleItems = items.filter((item) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    if (!cat) return false;
    if (activeSection && cat.section !== activeSection) return false;
    if (activeTag !== "all" && !item.dietaryTags.includes(activeTag)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const itemsByCategory = categories
    .filter((c) => !activeSection || c.section === activeSection)
    .sort((a, b) => a.order - b.order)
    .map((cat) => ({ cat, catItems: visibleItems.filter((i) => i.categoryId === cat.id) }))
    .filter(({ catItems }) => catItems.length > 0);

  function lineItem(line: CartLine) {
    return items.find((i) => i.id === line.itemId) ?? null;
  }
  const cartSubtotalArs = cart.reduce((sum, line) => {
    const item = lineItem(line);
    return sum + (item ? item.price * line.qty : 0);
  }, 0);
  const cartServiceArs = cartSubtotalArs * 0.1;
  const cartTotalArs = cartSubtotalArs + cartServiceArs;
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);

  function addToCart(itemId: string, qty: number) {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.itemId === itemId);
      if (idx === -1) return [...prev, { itemId, qty }];
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      return next;
    });
  }
  function setCartQty(itemId: string, qty: number) {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((l) => l.itemId !== itemId);
      return prev.map((l) => (l.itemId === itemId ? { ...l, qty } : l));
    });
  }

  function handleCallWaiter() {
    setToast(t(lang, "waiterCalledToast"));
  }
  function handleSendOrder() {
    setToast(t(lang, "orderSentToast"));
    setCart([]);
    setNotes("");
    setCartOpen(false);
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[#fcfbf9] dark:bg-neutral-950 text-stone-800 dark:text-stone-100 transition-colors">
        <Header
          tenant={tenant}
          lang={lang}
          setLang={setLang}
          currency={currency}
          setCurrency={setCurrency}
          dark={dark}
          setDark={setDark}
        />

        <main className="max-w-2xl w-full mx-auto px-4 py-6 pb-32">
          <HeroBanner
            tenant={tenant}
            lang={lang}
            table={table}
            accent={accent}
            onCallWaiter={handleCallWaiter}
          />

          <div className="space-y-3 mb-6">
            <div className="relative">
              <SearchIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(lang, "searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs focus:outline-none focus:ring-2 transition shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <FilterPill active={activeTag === "all"} onClick={() => setActiveTag("all")} accent={accent}>
                {t(lang, "filterAll")}
              </FilterPill>
              {DIETARY_TAGS.map((tag) => (
                <FilterPill
                  key={tag.value}
                  active={activeTag === tag.value}
                  onClick={() => setActiveTag(tag.value)}
                  accent={accent}
                >
                  {tag.icon} {t(lang, TAG_KEY[tag.value])}
                </FilterPill>
              ))}
            </div>
          </div>

          {sectionsPresent.length > 0 && (
            <div className="sticky top-[57px] z-30 bg-[#fcfbf9]/90 dark:bg-neutral-950/90 backdrop-blur-md py-3 -mx-4 px-4 border-b border-stone-200 dark:border-stone-800 mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {sectionsPresent.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setActiveSection(s.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
                      activeSection === s.value
                        ? "text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                    style={activeSection === s.value ? { backgroundColor: accent } : undefined}
                  >
                    {t(lang, SECTION_KEY[s.value])}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {categories.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-10">{t(lang, "noItemsText")}</p>
            )}
            {categories.length > 0 && itemsByCategory.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-10">{t(lang, "noResultsText")}</p>
            )}
            {itemsByCategory.map(({ cat, catItems }) => (
              <div key={cat.id} className="space-y-3">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{cat.name}</h3>
                <div className="space-y-3">
                  {catItems.map((item) => (
                    <DishCard
                      key={item.id}
                      item={item}
                      lang={lang}
                      currency={currency}
                      accent={accent}
                      onOpen={() => {
                        setActiveDish(item);
                        setModalQty(1);
                      }}
                      onQuickAdd={() => addToCart(item.id, 1)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {photos.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t(lang, "photosTitle")}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.url} alt={p.caption} className="h-20 w-full object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {tenant.phone && (
              <p className="text-sm text-neutral-500 text-center pt-2">📞 {tenant.phone}</p>
            )}
          </div>
        </main>

        <CartBar
          lang={lang}
          currency={currency}
          accent={accent}
          count={cartCount}
          totalArs={cartTotalArs}
          onOpen={() => setCartOpen(true)}
        />

        {activeDish && (
          <DishModal
            item={activeDish}
            lang={lang}
            currency={currency}
            accent={accent}
            qty={modalQty}
            onQtyChange={setModalQty}
            onClose={() => setActiveDish(null)}
            onAdd={() => {
              addToCart(activeDish.id, modalQty);
              setActiveDish(null);
            }}
          />
        )}

        {cartOpen && (
          <CartModal
            tenant={tenant}
            lang={lang}
            currency={currency}
            accent={accent}
            cart={cart}
            items={items}
            notes={notes}
            setNotes={setNotes}
            subtotalArs={cartSubtotalArs}
            serviceArs={cartServiceArs}
            totalArs={cartTotalArs}
            onQtyChange={setCartQty}
            onClose={() => setCartOpen(false)}
            onSend={handleSendOrder}
          />
        )}

        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl max-w-[90vw] text-center">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function Header({
  tenant,
  lang,
  setLang,
  currency,
  setCurrency,
  dark,
  setDark,
}: {
  tenant: Tenant;
  lang: Lang;
  setLang: (l: Lang) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden"
            style={{ backgroundColor: tenant.themeColor }}
          >
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt={tenant.name} className="h-full w-full object-cover" />
            ) : (
              tenant.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <h1 className={`${playfair.className} font-bold text-base leading-tight truncate`}>{tenant.name}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="bg-stone-100 dark:bg-stone-800 text-xs font-medium py-1.5 px-2 rounded-lg border border-stone-200 dark:border-stone-700 focus:outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-stone-100 dark:bg-stone-800 text-xs font-medium py-1.5 px-2 rounded-lg border border-stone-200 dark:border-stone-700 focus:outline-none cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setDark(!dark)}
            aria-label="Cambiar tema"
            className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroBanner({
  tenant,
  lang,
  table,
  accent,
  onCallWaiter,
}: {
  tenant: Tenant;
  lang: Lang;
  table: string | null;
  accent: string;
  onCallWaiter: () => void;
}) {
  return (
    <div
      className="p-5 rounded-2xl border mb-6 relative overflow-hidden"
      style={{ backgroundColor: `${accent}0d`, borderColor: `${accent}33` }}
    >
      <div
        className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full blur-xl pointer-events-none"
        style={{ backgroundColor: `${accent}22` }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {table && (
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white mb-2 shadow-sm"
              style={{ backgroundColor: accent }}
            >
              {t(lang, "tableBadge", { n: table })}
            </span>
          )}
          <h2 className={`${playfair.className} text-2xl font-bold tracking-tight`}>{t(lang, "welcomeTitle")}</h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            {tenant.description || t(lang, "welcomeDescFallback")}
          </p>
        </div>
        <button
          onClick={onCallWaiter}
          className="flex flex-col items-center justify-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-3 rounded-xl shadow-sm hover:opacity-80 transition shrink-0"
        >
          <BellIcon className="h-4 w-4 mb-1" />
          <span className="text-[10px] font-medium whitespace-nowrap">{t(lang, "callWaiterBtn")}</span>
        </button>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
        active
          ? "text-white"
          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
      }`}
      style={active ? { backgroundColor: accent } : undefined}
    >
      {children}
    </button>
  );
}

function DishCard({
  item,
  lang,
  currency,
  accent,
  onOpen,
  onQuickAdd,
}: {
  item: MenuItem;
  lang: Lang;
  currency: Currency;
  accent: string;
  onOpen: () => void;
  onQuickAdd: () => void;
}) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 flex gap-3 shadow-sm">
      <button onClick={onOpen} className="flex gap-3 flex-1 min-w-0 text-left">
        <div
          className="h-16 w-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: item.imageUrl ? undefined : `${accent}aa` }}
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            item.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium text-sm truncate">{item.name}</span>
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: accent }}>
              {formatPrice(item.price, currency)}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {item.dietaryTags.map((tag) => (
              <span key={tag} className="text-[10px]">
                {DIETARY_TAGS.find((d) => d.value === tag)?.icon}
              </span>
            ))}
            {!item.available && (
              <span className="text-[10px] rounded bg-neutral-200 dark:bg-stone-700 px-1.5 py-0.5">
                {t(lang, "unavailableText")}
              </span>
            )}
          </div>
        </div>
      </button>
      <button
        onClick={onQuickAdd}
        disabled={!item.available}
        className="self-center w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ backgroundColor: accent }}
        aria-label={t(lang, "addToOrder")}
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DishModal({
  item,
  lang,
  currency,
  accent,
  qty,
  onQtyChange,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  lang: Lang;
  currency: Currency;
  accent: string;
  qty: number;
  onQtyChange: (q: number) => void;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col">
        <div
          className="relative h-48 shrink-0 flex items-center justify-center text-white text-4xl font-semibold"
          style={{ backgroundColor: item.imageUrl ? undefined : `${accent}aa` }}
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            item.name.slice(0, 1).toUpperCase()
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className={`${playfair.className} text-xl font-bold tracking-tight`}>{item.name}</h3>
            <span className="text-lg font-bold whitespace-nowrap" style={{ color: accent }}>
              {formatPrice(item.price, currency)}
            </span>
          </div>
          {item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800"
                >
                  {DIETARY_TAGS.find((d) => d.value === tag)?.icon} {t(lang, TAG_KEY[tag])}
                </span>
              ))}
            </div>
          )}
          {item.description && (
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4">{item.description}</p>
          )}
          {item.ingredients && (
            <div className="bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-2xl mb-6 border border-stone-100 dark:border-stone-800">
              <h5 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                {t(lang, "ingredientsTitle")}
              </h5>
              <p className="text-xs text-stone-700 dark:text-stone-300">{item.ingredients}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-800">
              <button
                onClick={() => onQtyChange(Math.max(1, qty - 1))}
                className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                <MinusIcon />
              </button>
              <span className="w-8 text-center text-xs font-bold">{qty}</span>
              <button
                onClick={() => onQtyChange(qty + 1)}
                className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                <PlusIcon />
              </button>
            </div>
            <button
              onClick={onAdd}
              disabled={!item.available}
              className="flex-1 text-white py-3 px-4 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accent }}
            >
              <CartIcon className="h-3.5 w-3.5" />
              <span>{t(lang, "addToOrder")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartBar({
  lang,
  currency,
  accent,
  count,
  totalArs,
  onOpen,
}: {
  lang: Lang;
  currency: Currency;
  accent: string;
  count: number;
  totalArs: number;
  onOpen: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40">
      <div className="bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-800 dark:border-stone-200">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm relative shadow-inner shrink-0"
            style={{ backgroundColor: accent }}
          >
            <ReceiptIcon className="h-4 w-4" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-stone-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900 dark:border-stone-100">
              {count}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider opacity-80">{t(lang, "myOrderTitle")}</h4>
            <p className={`${playfair.className} font-bold text-base`}>{formatPrice(totalArs, currency)}</p>
          </div>
        </div>
        <button
          onClick={onOpen}
          className="text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 shrink-0"
          style={{ backgroundColor: accent }}
        >
          <span>{t(lang, "viewOrderBtn")}</span>
          <ArrowRightIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function CartModal({
  tenant,
  lang,
  currency,
  accent,
  cart,
  items,
  notes,
  setNotes,
  subtotalArs,
  serviceArs,
  totalArs,
  onQtyChange,
  onClose,
  onSend,
}: {
  tenant: Tenant;
  lang: Lang;
  currency: Currency;
  accent: string;
  cart: CartLine[];
  items: MenuItem[];
  notes: string;
  setNotes: (n: string) => void;
  subtotalArs: number;
  serviceArs: number;
  totalArs: number;
  onQtyChange: (itemId: string, qty: number) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1a`, color: accent }}
            >
              <ReceiptIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className={`${playfair.className} font-bold text-base truncate`}>{t(lang, "cartModalTitle")}</h3>
              <p className="text-[11px] text-stone-500 truncate">{tenant.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-300 transition shrink-0"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-6">{t(lang, "emptyCartText")}</p>
          )}
          {cart.map((line) => {
            const item = items.find((i) => i.id === line.itemId);
            if (!item) return null;
            return (
              <div key={line.itemId} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-stone-500">{formatPrice(item.price, currency)}</p>
                </div>
                <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-stone-50 dark:bg-stone-800 shrink-0">
                  <button
                    onClick={() => onQtyChange(line.itemId, line.qty - 1)}
                    className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                  >
                    <MinusIcon className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold">{line.qty}</span>
                  <button
                    onClick={() => onQtyChange(line.itemId, line.qty + 1)}
                    className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                  >
                    <PlusIcon className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => onQtyChange(line.itemId, 0)}
                  className="text-stone-400 hover:text-red-500 transition shrink-0"
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-3">
          <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
            {t(lang, "notesLabel")}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t(lang, "notesPlaceholder")}
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none"
          />
        </div>

        <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-500">
              <span>{t(lang, "subtotalText")}</span>
              <span>{formatPrice(subtotalArs, currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-500">
              <span>{t(lang, "serviceText")}</span>
              <span>{formatPrice(serviceArs, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-stone-200 dark:border-stone-800">
              <span>{t(lang, "totalText")}</span>
              <span style={{ color: accent }}>{formatPrice(totalArs, currency)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onClose}
              className="py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              {t(lang, "continueBtn")}
            </button>
            <button
              onClick={onSend}
              disabled={cart.length === 0}
              className="py-3 rounded-xl text-xs font-bold text-white transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accent }}
            >
              {t(lang, "sendOrderBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
