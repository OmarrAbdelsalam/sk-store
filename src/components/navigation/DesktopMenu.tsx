"use client";

import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";

export const DesktopMenu = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const { categories, isLoading: loading } = useCategories();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const categorySlug = searchParams.get("category");

  // Prefetch category pages once categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach((category) => {
        const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        router.prefetch(`/${locale}?category=${encodeURIComponent(slug)}`);
      });
      router.prefetch(`/${locale}`);
      
      // Prefetch common product pages (first few products)
      setTimeout(() => {
        for (let i = 1; i <= 10; i++) {
          router.prefetch(`/${locale}/${i}`);
        }
      }, 2000);
    }
  }, [categories, locale, router]);

  // Get the actual ID from sessionStorage if we have a slug (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && categorySlug) {
      const storedId = sessionStorage.getItem(`category_${categorySlug}`);
      setActiveCategoryId(storedId);
    } else {
      setActiveCategoryId(null);
    }
  }, [categorySlug]);

  const goToAllProducts = () => {
    // Clear category from sessionStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith('category_'));
      keys.forEach(k => sessionStorage.removeItem(k));
    }
    setActiveCategoryId(null);
    startTransition(() => {
      router.push(`/${locale}`, { scroll: false });
    });
  };
  
  const goToCategory = (id: string, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`category_${slug}`, id);
    }
    startTransition(() => {
      router.push(`/${locale}?category=${encodeURIComponent(slug)}`, { scroll: false });
    });
  };

  // Check if we're on the home page
  const isHomePage = pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;

  const isActive = (categoryId: string | null) => {
    // Only show active state if we're on the home page
    if (!isHomePage) return false;
    if (!activeCategoryId && !categoryId) return true; // All products is active
    return activeCategoryId === categoryId;
  };

  return (
    <nav className="flex items-center gap-1">
      <div className="relative">
        <Button 
          variant="ghost" 
          onClick={goToAllProducts}
          className="font-medium"
        >
          {t("Nav.allProducts")}
        </Button>
        {isActive(null) && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-blue-600"></div>
        )}
      </div>

      {loading && <span className="text-sm text-muted-foreground">…</span>}

      {!loading && categories.length > 0 &&
        categories.map((category) => {
          const isActiveCategory = isActive(category.key);
          const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
          
          return (
            <div key={category.key} className="relative">
              <Button
                variant="ghost"
                onClick={() => goToCategory(category.key, categoryName)}
                className="font-medium"
                disabled={isPending}
              >
                {categoryName}
              </Button>
              {isActiveCategory && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-blue-600"></div>
              )}
            </div>
          );
        })}
    </nav>
  );
};
