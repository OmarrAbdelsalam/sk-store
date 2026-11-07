/**
 * The one way the storefront writes money: "1,250 ج.م" / "1,250 EGP".
 *
 * Whole amounts drop the decimals (every bag is priced in whole pounds);
 * an amount with piastres — a 50% deposit of an odd total, say — keeps two
 * decimals so it never reads as "687.5". Latin digits in both languages, to
 * match the rest of the store.
 */

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Parses numbers and stored strings like "1250 EGP" / "1,250 جنيه". */
export function toAmount(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return parseFloat(String(value ?? "").replace(/[^\d.]/g, "")) || 0;
}

export function formatAmount(value: number | string | null | undefined): string {
  const n = toAmount(value);
  return Math.abs(n - Math.round(n)) < 0.005 ? whole.format(Math.round(n)) : cents.format(n);
}

export function currencyLabel(locale: string): string {
  return locale === "ar" ? "ج.م" : "EGP";
}

export function formatPrice(value: number | string | null | undefined, locale: string): string {
  return `${formatAmount(value)} ${currencyLabel(locale)}`;
}
