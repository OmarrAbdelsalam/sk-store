"use client";

import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { LanguageSwitcher } from "../Navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories, type CategoryOption } from "@/api/categories";

export const MobileMenu = () => {
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

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories(locale);
        setCategories(data);
        
        // Prefetch all category pages
        data.forEach((category) => {
          router.prefetch(`/?categoryId=${encodeURIComponent(category.key)}`);
        });
        
        // Prefetch home page (all products)
        router.prefetch('/');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load categories", e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [locale, router]);

  const goToAllProducts = () => router.push(`/${locale}`);
  const goToCategory = (id: string) => router.push(`/${locale}?categoryId=${encodeURIComponent(id)}`);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t("openMenu")}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side={sheetSide} className="w-80" dir={dir} aria-label={t("menuAriaLabel")}>
        <SheetHeader>
          <SheetTitle className="text-xl font-luxury">{t("menuTitle")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-8">
          {/* الرئيسية */}
          <div>
            <Link
              href="/"
              className="flex items-center py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              aria-label={t("home")}
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
              categories.map((category) => (
                <Button
                  key={category.key}
                  variant="ghost"
                  className="w-full justify-start text-base py-3 h-auto"
                  onClick={() => goToCategory(category.key)}
                  aria-label={category.label}
                >
                  <span>{category.label}</span>
                </Button>
              ))}

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
            <Link href="/cart">
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
            <Link href="/my-orders">
              <Button variant="outline" className="w-full justify-start" aria-label={t("myOrders")}>
                {t("myOrders")}
              </Button>
            </Link>
          </div>

          {/* مبدّل اللغة */}
          <div className="pt-6">
            <LanguageSwitcher />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
