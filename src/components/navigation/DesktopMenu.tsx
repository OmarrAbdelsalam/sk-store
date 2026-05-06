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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { categories, isLoading: loading } = useCategories();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const categorySlug = searchParams.get("category");

  // Prefetch category pages once categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach((category) => {
        const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
        // Add null check before calling toLowerCase
        if (categoryName) {
          const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
          router.prefetch(`/${locale}?category=${encodeURIComponent(slug)}`);
        }
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
      router.push(`/${locale}/products`, { scroll: true });
    });
  };
  
  const goToCategory = (id: string, name: string) => {
    // Add null check before calling toLowerCase
    if (!name) return;
    
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`category_${slug}`, id);
    }
    startTransition(() => {
      router.push(`/${locale}/products?category=${encodeURIComponent(slug)}`, { scroll: true });
    });
  };

  // Check if we're on the products page
  const isProductsPage = pathname.includes('/products');

  const isActive = (categoryId: string | null) => {
    // Only show active state if we're on the products page
    if (!isProductsPage) return false;
    if (!activeCategoryId && !categoryId) return true; // All products is active
    return activeCategoryId === categoryId;
  };

  return (
    <nav className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        onClick={goToAllProducts}
        className={`font-medium ${isActive(null) ? 'bg-gray-100 rounded-lg' : ''}`}
      >
        {t("Nav.allProducts")}
      </Button>

      {(!mounted || loading) && <span className="text-sm text-muted-foreground">…</span>}

      {mounted && !loading && categories.length > 0 &&
        categories.map((category) => {
          const isActiveCategory = isActive(category.key);
          const categoryName = locale === 'ar' ? category.arabicName : category.englishName;
          
          // Skip if categoryName is undefined or null
          if (!categoryName) return null;
          
          return (
            <Button
              key={category.key}
              variant="ghost"
              onClick={() => goToCategory(category.key, categoryName)}
              className={`font-medium ${isActiveCategory ? 'bg-gray-100 rounded-lg' : ''}`}
              disabled={isPending}
            >
              {categoryName}
            </Button>
          );
        })}
    </nav>
  );
};
