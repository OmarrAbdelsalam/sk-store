"use client";

import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice, toAmount } from "@/lib/price";

interface SearchAndFiltersProps {
  isTransparent?: boolean;
  /** Desktop header: icon + underlined "Search" bar. */
  showLabel?: boolean;
}

const MAX_RESULTS = 8;

/**
 * Header search (Prestige): a panel drops from the top with one large
 * field and live product results as you type. Enter, or "View all results",
 * opens /products?q=… — filtering itself lives on the products page.
 */
export const SearchAndFilters = ({ showLabel = false }: SearchAndFiltersProps) => {
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const sp = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();

  useEffect(() => setMounted(true), []);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return products
      .filter((p) =>
        [p.name, p.nameEn, p.nameAr, p.category].some((v) => String(v ?? "").toLowerCase().includes(q))
      )
      .slice(0, MAX_RESULTS);
  }, [products, q]);

  const suggestions = useMemo(() => products.slice(0, 4), [products]);

  const submit = () => {
    const v = query.trim();
    setOpen(false);
    router.push(v ? `/products?q=${encodeURIComponent(v)}` : "/products");
  };

  const label = isAr ? "بحث" : "Search";

  const trigger = showLabel ? (
    <button
      type="button"
      className="mx-auto flex w-[300px] items-center gap-3 border-b border-current pb-1.5 text-start font-sans text-fine transition-opacity duration-fast hover:opacity-70"
      aria-label={label}
    >
      <Search className="size-4 shrink-0" strokeWidth={1.25} />
      <span>{tNav("search")}</span>
    </button>
  ) : (
    <Button variant="ghost" size="icon" aria-label={label}>
      <Search className="!size-[22px]" strokeWidth={1.25} />
    </Button>
  );

  if (!mounted) return trigger;

  const list = q ? results : suggestions;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side="top"
        hideClose
        dir={isAr ? "rtl" : "ltr"}
        className="max-h-[92svh] gap-0 overflow-y-auto border-b border-gray-200 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{label}</SheetTitle>
        </SheetHeader>

        {/* Search field */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="ds-page flex h-[72px] items-center gap-3 border-b border-gray-200 lg:h-[96px]"
        >
          <Search className="size-5 shrink-0 text-ink" strokeWidth={1.25} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? "ابحثي عن شنطة…" : "Search for a bag…"}
            aria-label={label}
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent font-display text-[20px] text-ink outline-none placeholder:text-gray-400 lg:text-[26px] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="font-sans text-[13px] text-gray-500 underline underline-offset-2 transition-colors duration-fast hover:text-ink"
            >
              {isAr ? "مسح" : "Clear"}
            </button>
          )}
          <SheetClose
            className="-me-2 flex size-10 shrink-0 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            aria-label={isAr ? "إغلاق البحث" : "Close search"}
          >
            <X className="size-5" strokeWidth={1.25} />
          </SheetClose>
        </form>

        {/* Results */}
        <div className="ds-page py-6 lg:py-8">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
              {q
                ? results.length
                  ? isAr ? "منتجات" : "Products"
                  : isAr ? `مفيش نتايج لـ "${query.trim()}"` : `No results for “${query.trim()}”`
                : isAr ? "مقترحات" : "Suggestions"}
            </p>
            {q && results.length > 0 && (
              <button
                type="button"
                onClick={submit}
                className="inline-flex items-center gap-1.5 font-sans text-[13px] text-ink underline underline-offset-4 transition-opacity duration-fast hover:opacity-60"
              >
                {isAr ? "عرض كل النتايج" : "View all results"}
                <ArrowRight className="size-3.5 rtl:rotate-180" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {list.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-tile gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
              {list.map((p) => {
                const before = toAmount(p.beforePrice);
                const onSale = before > p.priceNum;
                return (
                  <li key={p.id}>
                    <Link href={`/product/${p.id}`} onClick={() => setOpen(false)} className="group block">
                      <div className="ds-cutout-frame relative aspect-product overflow-hidden">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                          className="ds-cutout object-center transition-transform duration-500 ease-brand group-hover:scale-[1.06]"
                        />
                      </div>
                      <p className="mt-2 truncate font-sans text-[13px] uppercase leading-5 tracking-[0.04em] text-ink">
                        {p.name}
                      </p>
                      <p className="flex flex-wrap gap-x-2 font-sans text-[13px] leading-5">
                        {onSale && <span className="whitespace-nowrap text-ink line-through">{formatPrice(before, locale)}</span>}
                        <span className={`whitespace-nowrap ${onSale ? "text-accent-2" : "text-ink"}`}>
                          {formatPrice(p.priceNum, locale)}
                        </span>
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {q && results.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: isAr ? "تسوقي الكل" : "Shop all", href: "/products" },
                { label: tNav("newIn"), href: "/products?badge=new_arrival" },
                { label: tNav("bestSellers"), href: "/products?badge=best_seller" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center border border-ink px-4 font-sans text-[13px] text-ink transition-colors duration-fast hover:bg-ink hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
