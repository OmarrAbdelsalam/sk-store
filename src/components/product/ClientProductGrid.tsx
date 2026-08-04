"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import ProductPagination from "@/components/product/ProductPagination";
import { useTranslations, useLocale } from "next-intl";
import { getCategories, type CategoryOption } from "@/api/categories";
import {
  mapApiProductToUI,
  type ProductApi,
} from "@/lib/api/products";
import { fetchProducts } from "@/api/products";
import { prefetchProducts } from "@/hooks/useProduct";

/* ===================== Types ===================== */

interface Product {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: string;
  priceNum: number;
  image: string;
  description: string;
  gender: string;
  availableColors: Array<{ name: string; hex: string }>;
  category?: string;
  categoryIds?: Array<number | string>;
  raw?: ProductApi;
}

/* ===================== Helpers ===================== */

const mapServerToProduct = (p: ProductApi, locale: string): Product => {
  const ui = mapApiProductToUI(p, locale as "ar" | "en");
  return {
    id: ui.id,
    name: ui.name,
    nameAr: p.nameAr ?? "",
    nameEn: p.nameEn ?? "",
    price: ui.price,
    priceNum: ui.priceNum,
    image: ui.image,
    description: ui.description,
    gender: ui.gender,
    availableColors: ui.availableColors,
    category: ui.category,
    categoryIds: ui.categoryIds,
    raw: p,
  };
};

/* ===================== Component ===================== */

interface ClientProductGridProps {
  initialProducts: ProductApi[];
}

const ClientProductGrid = ({ initialProducts }: ClientProductGridProps) => {
  const [mounted, setMounted] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const productsPerPage = 16;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load ALL products (including initial ones for consistent filtering)
  useEffect(() => {
    if (hasLoaded) return;

    const loadAll = async () => {
      setIsLoadingMore(true);
      try {
        const result = await fetchProducts(1, 100);
        setAllProducts(result.items.map((p) => mapServerToProduct(p, locale)));
        setHasLoaded(true);
      } catch (error) {
        console.error("Failed to load products:", error);
        // Fallback to initial products
        setAllProducts(initialProducts.map((p) => mapServerToProduct(p, locale)));
        setHasLoaded(true);
      } finally {
        setIsLoadingMore(false);
      }
    };

    loadAll();
  }, [locale, hasLoaded, initialProducts]);

  /* Load categories */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getCategories();
        if (!alive) return;
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setCategories([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* Read URL category and match to category ID */
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (!categorySlug) {
      if (activeFilter !== "All") {
        setActiveFilter("All");
      }
      return;
    }

    // Try sessionStorage first
    const storedId = typeof window !== "undefined"
      ? sessionStorage.getItem(`category_${categorySlug}`)
      : null;

    if (storedId) {
      if (activeFilter !== storedId) setActiveFilter(storedId);
      return;
    }

    // Fallback: match slug to category name
    if (categories.length > 0) {
      const matchedCat = categories.find((cat) => {
        const enSlug = (cat.englishName || "").toLowerCase().replace(/\s+/g, "-");
        const arSlug = (cat.arabicName || "").toLowerCase().replace(/\s+/g, "-");
        return enSlug === categorySlug || arSlug === categorySlug;
      });
      if (matchedCat) {
        // Store for future use
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`category_${categorySlug}`, String(matchedCat.key));
        }
        if (activeFilter !== String(matchedCat.key)) {
          setActiveFilter(String(matchedCat.key));
        }
        return;
      }
    }

    // Last resort: use slug directly
    if (activeFilter !== categorySlug) {
      setActiveFilter(categorySlug);
    }
  }, [searchParams, categories, activeFilter]);

  /* Search & filter */
  const qRaw = (searchParams.get("q") ?? "").toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All" && !qRaw) return allProducts;

    return allProducts.filter((p) => {
      const okCategory =
        activeFilter === "All" ||
        (p.categoryIds ?? []).some(
          (cid) => String(cid) === String(activeFilter)
        );
      const okSearch = !qRaw
        ? true
        : (p.name ?? "").toLowerCase().includes(qRaw) ||
          (p.nameAr ?? "").toLowerCase().includes(qRaw) ||
          (p.nameEn ?? "").toLowerCase().includes(qRaw);
      return okCategory && okSearch;
    });
  }, [allProducts, activeFilter, qRaw]);

  /* Pagination */
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  const displayedProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);

  /* Prefetch visible products */
  useEffect(() => {
    if (displayedProducts.length > 0 && currentPage === 1) {
      const productIds = displayedProducts.slice(0, 4).map((p) => p.id);
      prefetchProducts(productIds);
    }
  }, [displayedProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchParams]);

  const handleCategoryClick = useCallback((cat: CategoryOption | null) => {
    if (!cat) {
      setActiveFilter("All");
      router.push(`/products`, { scroll: false });
      return;
    }
    const slug = (cat.englishName || "").toLowerCase().replace(/\s+/g, "-");
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`category_${slug}`, String(cat.key));
    }
    setActiveFilter(String(cat.key));
    router.push(`/products?category=${slug}`, { scroll: false });
  }, [locale, router]);

  // Get active category name for breadcrumb
  const activeCategoryName = useMemo(() => {
    if (activeFilter === "All") return null;
    const cat = categories.find((c) => String(c.key) === String(activeFilter));
    if (!cat) return null;
    return locale === "ar" ? cat.arabicName : cat.englishName;
  }, [activeFilter, categories, locale]);

  if (!mounted) return null;

  // Show skeleton while loading
  if (isLoadingMore) {
    return (
      <section className="pb-8 bg-background">
        <div className="container mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2 md:space-y-4 animate-pulse">
                <div className="aspect-[4/5] w-full rounded bg-muted" />
                <div className="space-y-1.5 md:space-y-2">
                  <div className="h-4 md:h-6 w-3/4 rounded bg-muted" />
                  <div className="h-3 md:h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="pb-8 bg-background">
      <div className="container mx-auto px-5">
        {/* Breadcrumb - Desktop only */}
        <nav className="hidden md:flex items-center gap-2 text-sm mb-6">
          <span className="text-muted-foreground">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </span>
          <span className="text-muted-foreground">/</span>
          {activeCategoryName ? (
            <>
              <button
                onClick={() => handleCategoryClick(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {locale === "ar" ? "كل المنتجات" : "All Products"}
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">
                {activeCategoryName}
              </span>
            </>
          ) : (
            <span className="font-medium text-foreground">
              {locale === "ar" ? "كل المنتجات" : "All Products"}
            </span>
          )}
        </nav>

        {/* Category Tabs - Mobile only */}
        {categories.length > 0 && (
          <div className="md:hidden mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === "All"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {locale === "ar" ? "كل المنتجات" : "All Products"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    String(activeFilter) === String(cat.key)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {locale === "ar" ? cat.arabicName : cat.englishName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 items-stretch">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={String(product.id)}
                product={product as any}
                index={index}
              />
            ))}
          </div>
        ) : (
          hasLoaded && activeFilter !== "All" && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                {locale === "ar" ? "لا توجد منتجات في هذا التصنيف" : "No products in this category"}
              </p>
            </div>
          )
        )}

        {totalPages > 1 && (
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </section>
  );
};

export default ClientProductGrid;
