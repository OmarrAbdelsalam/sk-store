"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

/**
 * Products page filter bar — clean-theme dropdowns instead of a side drawer.
 * Price ▾ (min/max + Apply) · Color ▾ (multi-select, applies at once) ·
 * Has deal (toggle) · count · Sort by ▾. State lives in the URL
 * (?priceFrom & priceTo & colorName & badge=sale & sort) so it is shareable
 * and the back button works.
 */

type Product = { priceNum: number; raw?: any };

export interface ColorOption {
  key: string; // lowercase English name
  label: string;
  hex: string | null;
  count: number;
}

export function colorKey(c: { colorNameEn?: string | null; colorNameAr?: string | null }) {
  return String(c.colorNameEn || c.colorNameAr || "").trim().toLowerCase();
}

export function readFilterParams(sp: URLSearchParams | { get(k: string): string | null }) {
  const num = (v: string | null) => (v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : null);
  const colors = (sp.get("colorName") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return {
    priceFrom: num(sp.get("priceFrom")),
    priceTo: num(sp.get("priceTo")),
    colors,
    sort: (sp.get("sort") ?? "") as "" | "price-asc" | "price-desc",
    badge: sp.get("badge") ?? "",
  };
}

const chip =
  "inline-flex h-9 items-center gap-2 border px-3 font-sans text-fine transition-colors duration-fast data-[state=open]:bg-ink data-[state=open]:text-white";

const panel =
  "z-50 border border-gray-200 bg-white p-4 text-ink outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

export default function ProductFilters({
  products,
  resultCount,
}: {
  /** Products after category / badge / search — used for options and price bounds. */
  products: Product[];
  resultCount: number;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const sp = useSearchParams();
  const f = readFilterParams(sp);

  // Filters only re-filter the list already on the client, so the URL is
  // updated with the History API (Next keeps useSearchParams in sync) instead
  // of a router navigation — no server round-trip, the tick shows instantly,
  // and back/forward still step through filter states.
  const push = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(window.location.search);
    mutate(p);
    const qs = p.toString();
    window.history.pushState(null, "", qs ? `/products?${qs}` : "/products");
  };

  // Price bounds of the current list.
  const prices = products.map((p) => Number(p.priceNum)).filter((n) => n > 0);
  const minP = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const maxP = prices.length ? Math.ceil(Math.max(...prices)) : 0;

  // Colour options with counts.
  const colorOptions = React.useMemo<ColorOption[]>(() => {
    const map = new Map<string, ColorOption>();
    for (const p of products) {
      const seen = new Set<string>();
      for (const c of p.raw?.colors ?? []) {
        const key = colorKey(c);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const label = (isAr ? c.colorNameAr || c.colorNameEn : c.colorNameEn || c.colorNameAr) || key;
        const cur = map.get(key);
        if (cur) cur.count += 1;
        else map.set(key, { key, label, hex: c.hexa ?? null, count: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [products, isAr]);

  // ---- Price ----
  const [priceOpen, setPriceOpen] = React.useState(false);
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  React.useEffect(() => {
    if (priceOpen) {
      setFrom(f.priceFrom !== null ? String(f.priceFrom) : "");
      setTo(f.priceTo !== null ? String(f.priceTo) : "");
    }
  }, [priceOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceActive = f.priceFrom !== null || f.priceTo !== null;
  const applyPrice = () => {
    push((p) => {
      from.trim() ? p.set("priceFrom", String(Math.max(0, Number(from)))) : p.delete("priceFrom");
      to.trim() ? p.set("priceTo", String(Math.max(0, Number(to)))) : p.delete("priceTo");
    });
    setPriceOpen(false);
  };
  const clearPrice = () => {
    push((p) => {
      p.delete("priceFrom");
      p.delete("priceTo");
    });
    setPriceOpen(false);
  };

  // ---- Colour ----
  // Local selection drives the checkboxes so several colours can be ticked in
  // a row with no wait; the URL (and the grid) follow on the same tick.
  const urlColors = f.colors.join(",");
  const [colorSel, setColorSel] = React.useState<string[]>(f.colors);
  React.useEffect(() => {
    setColorSel(urlColors ? urlColors.split(",") : []);
  }, [urlColors]);
  const [colorOpen, setColorOpen] = React.useState(false);
  const toggleColor = (key: string) => {
    const next = colorSel.includes(key) ? colorSel.filter((k) => k !== key) : [...colorSel, key];
    setColorSel(next);
    push((p) => (next.length ? p.set("colorName", next.join(",")) : p.delete("colorName")));
  };
  const clearColors = () => {
    setColorSel([]);
    push((p) => p.delete("colorName"));
  };

  // ---- Sort ----
  const sorts: Array<{ value: "" | "price-asc" | "price-desc"; label: string }> = [
    { value: "", label: isAr ? "مميز" : "Featured" },
    { value: "price-asc", label: isAr ? "السعر: من الأقل للأعلى" : "Price, low to high" },
    { value: "price-desc", label: isAr ? "السعر: من الأعلى للأقل" : "Price, high to low" },
  ];
  const sortLabel = sorts.find((s) => s.value === f.sort)?.label ?? sorts[0].label;

  const anyActive = priceActive || colorSel.length > 0 || f.badge === "sale";
  const currency = isAr ? "ج.م" : "EGP";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Price ▾ */}
      <PopoverPrimitive.Root open={priceOpen} onOpenChange={setPriceOpen}>
        <PopoverPrimitive.Trigger className={`${chip} ${priceActive ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}>
          {isAr ? "السعر" : "Price"}
          {priceActive && (
            <span className="text-[12px] opacity-80">
              {f.priceFrom ?? minP}–{f.priceTo ?? maxP}
            </span>
          )}
          <ChevronDown className="size-3.5" strokeWidth={1.25} />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content align="start" sideOffset={6} className={`${panel} w-72`}>
            <p className="font-sans text-[13px] text-ink/65">
              {isAr ? "أعلى سعر" : "The highest price is"} {maxP.toLocaleString("en-US")} {currency}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <label className="flex-1">
                <span className="sr-only">{isAr ? "من" : "From"}</span>
                <input
                  inputMode="numeric"
                  value={from}
                  onChange={(e) => setFrom(e.target.value.replace(/[^\d]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                  placeholder={`${isAr ? "من" : "From"} ${minP}`}
                  className="ds-input h-10 px-3 text-[14px]"
                />
              </label>
              <span className="text-ink/40">–</span>
              <label className="flex-1">
                <span className="sr-only">{isAr ? "إلى" : "To"}</span>
                <input
                  inputMode="numeric"
                  value={to}
                  onChange={(e) => setTo(e.target.value.replace(/[^\d]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                  placeholder={`${isAr ? "إلى" : "To"} ${maxP}`}
                  className="ds-input h-10 px-3 text-[14px]"
                />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={clearPrice} className="font-sans text-[13px] text-ink/70 underline underline-offset-2 hover:text-ink">
                {isAr ? "مسح" : "Clear"}
              </button>
              <button
                type="button"
                onClick={applyPrice}
                className="inline-flex h-10 items-center bg-primary px-6 font-sans text-[12px] uppercase tracking-[0.1em] text-white transition-colors duration-fast hover:bg-night"
              >
                {isAr ? "تطبيق" : "Apply"}
              </button>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Color ▾ */}
      {colorOptions.length > 0 && (
        <PopoverPrimitive.Root open={colorOpen} onOpenChange={setColorOpen}>
          <PopoverPrimitive.Trigger
            className={`${chip} ${colorSel.length ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
          >
            {isAr ? "اللون" : "Color"}
            {colorSel.length > 0 && <span className="text-[12px] opacity-80">({colorSel.length})</span>}
            <ChevronDown className="size-3.5" strokeWidth={1.25} />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={6}
              className={`${panel} w-72 p-0`}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <span className="font-sans text-[13px] text-gray-500">
                  {colorSel.length
                    ? isAr ? `${colorSel.length} مختار` : `${colorSel.length} selected`
                    : isAr ? "اختاري لون أو أكتر" : "Pick one or more"}
                </span>
                {colorSel.length > 0 && (
                  <button
                    type="button"
                    onClick={clearColors}
                    className="font-sans text-[13px] text-ink underline underline-offset-2 transition-opacity duration-fast hover:opacity-60"
                  >
                    {isAr ? "مسح" : "Clear"}
                  </button>
                )}
              </div>
              <ul className="max-h-72 overflow-y-auto overscroll-contain py-1" aria-label={isAr ? "الألوان" : "Colors"}>
                {colorOptions.map((c) => {
                  const on = colorSel.includes(c.key);
                  return (
                    <li key={c.key}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggleColor(c.key)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-start font-sans text-[14px] text-ink outline-none transition-colors duration-fast hover:bg-beige focus-visible:bg-beige"
                      >
                        <span
                          className={`flex size-[18px] shrink-0 items-center justify-center border transition-colors duration-fast ${on ? "border-ink bg-ink text-white" : "border-gray-400 bg-white"}`}
                        >
                          {on && <Check className="size-3" strokeWidth={2.5} />}
                        </span>
                        <span className="block size-4 shrink-0 border border-gray-300" style={{ backgroundColor: c.hex || undefined }} />
                        <span className="flex-1 truncate">{c.label}</span>
                        <span className="text-[12px] text-ink/45">{c.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-200 p-3">
                <button
                  type="button"
                  onClick={() => setColorOpen(false)}
                  className="flex h-10 w-full items-center justify-center bg-ink font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-fast hover:bg-night"
                >
                  {isAr ? `عرض ${resultCount} منتج` : `View ${resultCount} ${resultCount === 1 ? "item" : "items"}`}
                </button>
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}

      {/* Has deal */}
      <button
        type="button"
        onClick={() => push((p) => (f.badge === "sale" ? p.delete("badge") : p.set("badge", "sale")))}
        aria-pressed={f.badge === "sale"}
        className={`${chip} ${f.badge === "sale" ? "border-ink bg-ink text-white" : "border-ink text-ink hover:bg-ink hover:text-white"}`}
      >
        {isAr ? "عليه خصم" : "Has deal"}
      </button>

      {anyActive && (
        <button
          type="button"
          onClick={() => {
            setColorSel([]);
            push((p) => {
              ["priceFrom", "priceTo", "colorName", "badge"].forEach((k) => p.delete(k));
            });
          }}
          className="ms-1 font-sans text-[13px] text-ink/70 underline underline-offset-2 hover:text-ink"
        >
          {isAr ? "مسح الكل" : "Clear all"}
        </button>
      )}

      <div className="ms-auto flex items-center gap-4">
        <span className="font-sans text-fine text-ink/55">
          {resultCount} {isAr ? "منتج" : resultCount === 1 ? "item" : "items"}
        </span>

        {/* Sort by ▾ */}
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger className="inline-flex h-9 items-center gap-2 font-sans text-fine text-ink transition-opacity duration-fast hover:opacity-70">
            <span className="text-ink/55">{isAr ? "ترتيب:" : "Sort by:"}</span>
            {sortLabel}
            <ChevronDown className="size-3.5" strokeWidth={1.25} />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content align="end" sideOffset={6} className={`${panel} w-56 p-2`}>
              {sorts.map((s) => {
                const on = s.value === f.sort;
                return (
                  <PopoverPrimitive.Close asChild key={s.value || "featured"}>
                    <button
                      type="button"
                      onClick={() => push((p) => (s.value ? p.set("sort", s.value) : p.delete("sort")))}
                      className={`flex w-full items-center justify-between px-2 py-2 text-start font-sans text-[14px] transition-colors duration-fast hover:bg-beige ${on ? "text-ink" : "text-ink/70"}`}
                    >
                      {s.label}
                      {on && <Check className="size-3.5" strokeWidth={2} />}
                    </button>
                  </PopoverPrimitive.Close>
                );
              })}
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </div>
    </div>
  );
}
