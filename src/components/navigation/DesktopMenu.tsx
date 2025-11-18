"use client";

import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getCategories, type CategoryOption } from "@/api/categories";

export const DesktopMenu = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const categorySlug = searchParams.get("category");
  
  // Get the actual ID from sessionStorage if we have a slug
  const activeCategoryId = categorySlug 
    ? sessionStorage.getItem(`category_${categorySlug}`)
    : null;

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories", e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goToAllProducts = () => router.push("/");
  const goToCategory = (id: string, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    // Store the mapping in sessionStorage for ProductGrid to use
    sessionStorage.setItem(`category_${slug}`, id);
    router.push(`/?category=${encodeURIComponent(slug)}`);
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
