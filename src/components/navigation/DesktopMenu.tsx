"use client";

import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";

interface DesktopMenuProps {
  isTransparent?: boolean;
}

export const DesktopMenu = ({ isTransparent = false }: DesktopMenuProps) => {
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
          router.prefetch(`/?category=${encodeURIComponent(slug)}`);
        }
      });
      router.prefetch("/");
      
      // Prefetch common product pages (first few products)
      setTimeout(() => {
        for (let i = 1; i <= 10; i++) {
          router.prefetch(`/${i}`);
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
      router.push(`/products`, { scroll: true });
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
      router.push(`/products?category=${encodeURIComponent(slug)}`, { scroll: true });
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

  const linkColorClass = (active: boolean) => {
    if (isTransparent) {
      return active 
        ? 'text-white font-semibold drop-shadow-sm' 
        : 'text-white/90 hover:text-white hover:bg-white/10';
    }
    return active 
      ? 'text-black font-semibold' 
      : 'text-black/60 hover:text-black hover:bg-transparent';
  };

  return (
    <nav className="flex items-center gap-1 lg:gap-1.5 xl:gap-2.5 2xl:gap-3.5 flex-nowrap shrink min-w-0">
      <Button 
        variant="ghost" 
        onClick={goToAllProducts}
        className={`text-[13px] lg:text-[13px] xl:text-sm 2xl:text-base font-medium transition-colors px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 whitespace-nowrap h-8 xl:h-9 ${linkColorClass(isActive(null))}`}
      >
        {t("Nav.allProducts")}
      </Button>

      {(!mounted || loading) && <span className={`text-sm px-2 ${isTransparent ? 'text-white/60' : 'text-muted-foreground'}`}>…</span>}

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
              className={`text-[13px] lg:text-[13px] xl:text-sm 2xl:text-base font-medium transition-colors px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 whitespace-nowrap h-8 xl:h-9 ${linkColorClass(isActiveCategory)}`}
              disabled={isPending}
            >
              {categoryName}
            </Button>
          );
        })}
    </nav>
  );
};
