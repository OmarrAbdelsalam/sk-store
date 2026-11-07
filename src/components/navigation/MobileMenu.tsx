"use client";

import { ChevronLeft, ChevronRight, Menu, ShoppingBag, Truck, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Wordmark from "@/components/Wordmark";
import { useCart } from "@/hooks/useCart";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  /** Desktop header: "☰ MENU" label trigger. */
  showLabel?: boolean;
  isTransparent?: boolean;
}

/**
 * Menu drawer — used as the phone hamburger and as the desktop "MENU" label
 * (the reference keeps all navigation inside this drawer).
 */
export const MobileMenu = ({ showLabel = false }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // ✅ نستخدم try/catch زي ما عندك علشان لو ما فيش مزوّد للكارت ما يكسرش الصفحة
  let cartItemsCount = 0;
  try {
    const { getTotalItems } = useCart();
    cartItemsCount = getTotalItems();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Cart context not available:", error);
  }

  const t = useTranslations("MobileMenu");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const sheetSide = locale === "ar" ? "right" : "left";
  const router = useRouter();

  const { categories, isLoading: loading } = useCategories();

  
  const goToCategory = (id: string, name: string) => {
    // Add null check before calling toLowerCase
    if (!name) return;
    
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`category_${slug}`, id);
    }
    setOpen(false);
    router.push(`/products?category=${encodeURIComponent(slug)}`);
  };

  const tNav = useTranslations("Nav");

  const trigger = showLabel ? (
    <button
      type="button"
      className="ds-label flex items-center gap-2.5 hover:opacity-60 transition-opacity duration-fast"
      aria-label={t("openMenu")}
    >
      <Menu className="size-4" strokeWidth={1.25} />
      {tNav("menu")}
    </button>
  ) : (
    <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
      <Menu className="!size-[22px]" strokeWidth={1} />
    </Button>
  );

  // Don't render Sheet until mounted to avoid hydration mismatch
  if (!mounted) {
    return trigger;
  }

  const isAr = locale === "ar";
  const primaryLinks = [
    { label: t("shopAll"), href: "/products", accent: false },
    { label: tNav("newIn"), href: "/products?badge=new_arrival", accent: false },
    { label: tNav("bestSellers"), href: "/products?badge=best_seller", accent: false },
    { label: tNav("sale"), href: "/products?badge=sale", accent: true },
  ];
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side={sheetSide}
        hideClose
        className="flex w-[88vw] max-w-[400px] flex-col gap-0 border-0 p-0"
        dir={dir}
        aria-label={t("menuAriaLabel")}
        // No focus ring on the first link when the drawer opens.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("menuTitle")}</SheetTitle>
        </SheetHeader>

        {/* Top bar — same height as the site header */}
        <div className="flex h-header-mobile shrink-0 items-center justify-between border-b border-gray-200 ps-gutter pe-2 lg:h-header-desktop">
          <Link href="/" onClick={() => setOpen(false)} aria-label={t("home")} className="text-ink">
            <Wordmark className="h-[15px] w-auto" />
          </Link>
          <SheetClose
            className="flex size-11 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            aria-label={t("close")}
          >
            <X className="size-5" strokeWidth={1.25} />
          </SheetClose>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain">
          {/* Primary — large display links */}
          <ul className="px-gutter pb-2 pt-6">
            {primaryLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center justify-between py-2.5 font-display text-[22px] uppercase leading-8 tracking-[0.04em] transition-opacity duration-fast hover:opacity-60",
                    l.accent ? "text-accent-2" : "text-ink"
                  )}
                >
                  {l.label}
                  <Chevron
                    className="size-4 text-gray-400 transition-transform duration-fast group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    strokeWidth={1.25}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Categories — quieter body links */}
          <div className="mx-gutter mt-4 border-t border-gray-200 pt-6">
            <p className="ds-label mb-3 text-gray-500">{t("shopByCategory")}</p>

            {loading && (
              <ul className="space-y-3 py-1" aria-live="polite" aria-label={t("loading")}>
                {[0, 1, 2, 3].map((i) => (
                  <li key={i} className="h-4 w-32 animate-pulse bg-beige" />
                ))}
              </ul>
            )}

            {!loading && categories.length > 0 && (
              <ul>
                {categories.map((category) => {
                  const categoryName = isAr ? category.arabicName : category.englishName;
                  if (!categoryName) return null;
                  return (
                    <li key={category.key}>
                      <button
                        type="button"
                        className="block w-full py-2 text-start font-sans text-[15px] capitalize leading-6 text-ink/80 transition-colors duration-fast hover:text-ink"
                        onClick={() => goToCategory(category.key, categoryName)}
                      >
                        {category.label.toLowerCase()}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {!loading && categories.length === 0 && (
              <p className="py-2 font-sans text-[15px] text-gray-500">{t("noCategories")}</p>
            )}
          </div>
        </nav>

        {/* Footer — account + bag, pinned to the bottom */}
        <div className="shrink-0 border-t border-gray-200 bg-beige px-gutter pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/my-orders"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center gap-2 border border-gray-300 bg-white font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors duration-fast hover:border-ink"
            >
              <User className="size-4" strokeWidth={1.25} />
              {t("myOrders")}
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex h-11 items-center justify-center gap-2 border border-gray-300 bg-white font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors duration-fast hover:border-ink"
              aria-label={cartItemsCount > 0 ? `${tNav("cart")} — ${t("itemsInCart", { count: cartItemsCount })}` : tNav("cart")}
            >
              <ShoppingBag className="size-4" strokeWidth={1.25} />
              {tNav("cart")}
              {cartItemsCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold tracking-normal text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 font-sans text-[12px] text-gray-500">
            <Truck className="size-3.5" strokeWidth={1.25} />
            {tNav("delivery")}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
