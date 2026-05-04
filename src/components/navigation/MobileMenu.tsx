"use client";

import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { LanguageSwitcher } from "../Navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useState, useEffect } from "react";

export const MobileMenu = () => {
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

  const goToAllProducts = () => {
    setOpen(false);
    router.push(`/${locale}/products`);
  };
  
  const goToCategory = (id: string, name: string) => {
    // Add null check before calling toLowerCase
    if (!name) return;
    
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`category_${slug}`, id);
    }
    setOpen(false);
    router.push(`/${locale}/products?category=${encodeURIComponent(slug)}`);
  };

  // Don't render Sheet until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" aria-label={t("openMenu")}>
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t("openMenu")}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side={sheetSide} className="w-80 overflow-y-auto" dir={dir} aria-label={t("menuAriaLabel")}>
        <SheetHeader>
          <SheetTitle className="text-xl font-luxury">{t("menuTitle")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-8 pb-8">
          {/* الرئيسية */}
          <div>
            <Link
              href={`/${locale}`}
              className="flex items-center py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              aria-label={t("home")}
              onClick={() => setOpen(false)}
            >
              {t("home")}
            </Link>
          </div>

          <Separator />

          {/* الفئات */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t("categories")}
            </p>

            <Button
              key="all"
              variant="ghost"
              className="w-full justify-start text-base py-3 h-auto"
              onClick={goToAllProducts}
              aria-label={t("allProducts")}
            >
              <span>{t("allProducts")}</span>
            </Button>

            {loading && (
              <div className="text-sm text-muted-foreground px-2 py-1" aria-live="polite">
                {t("loading")}
              </div>
            )}

            {!loading && categories.length > 0 &&
              categories.map((category) => {
                const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
                
                // Skip if categoryName is undefined or null
                if (!categoryName) return null;
                
                return (
                  <Button
                    key={category.key}
                    variant="ghost"
                    className="w-full justify-start text-base py-3 h-auto"
                    onClick={() => goToCategory(category.key, categoryName)}
                    aria-label={category.label}
                  >
                    <span>{category.label}</span>
                  </Button>
                );
              })}

            {!loading && categories.length === 0 && (
              <div className="text-sm text-muted-foreground px-2 py-1">{t("noCategories")}</div>
            )}
          </div>

          <Separator />

          {/* التسوق / السلة */}
          <div className="space-y-3">
            <p className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">
              {t("shopping")}
            </p>
            <Link href={`/${locale}/cart`} onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full justify-start" aria-label={t("cart")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t("cart")}
                {cartItemsCount > 0 && (
                  <span
                    className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1"
                    aria-label={t("itemsInCart", { count: cartItemsCount })}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          <Separator />

          {/* الطلبات */}
          <div className="space-y-3 ">
            <p className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">
              {t("orders")}
            </p>
            <Link href={`/${locale}/my-orders`} onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full justify-start" aria-label={t("myOrders")}>
                {t("myOrders")}
              </Button>
            </Link>
          </div>

          {/* Language switcher hidden for now */}
          {/* <div className="pt-6">
            <LanguageSwitcher />
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
  );
};
