// Conversión de moneda para la carta pública. Los precios se cargan en
// ARS; las tasas son fijas y solo para la demo (no vienen de ninguna API).

export type Currency = "ARS" | "USD" | "EUR" | "BRL";

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "ARS", label: "ARS ($)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "BRL", label: "BRL (R$)" },
];

const FX_RATES: Record<Currency, number> = {
  ARS: 1,
  USD: 1 / 1000,
  EUR: 1 / 1080,
  BRL: 1 / 190,
};

const LOCALES: Record<Currency, string> = {
  ARS: "es-AR",
  USD: "en-US",
  EUR: "de-DE",
  BRL: "pt-BR",
};

export function formatPrice(priceArs: number, currency: Currency): string {
  const converted = priceArs * FX_RATES[currency];
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(converted);
}
