"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import ProductPagination from "@/components/product/ProductPagination";
import { useTranslations, useLocale } from "next-intl";
import { getCategories, type CategoryOption } from "@/api/categories";
import {
  filterProducts,
  mapApiProductToUI,
  type ProductApi,
} from "@/lib/api/products";
import { fetchProducts } from "@/api/products";
import { prefetchProducts } from "@/hooks/useProduct";
import { ShoppingBag } from "lucide-react";

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
  const [remainingProducts, setRemainingProducts] = useState<Product[]>([]);
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

  // Load remaining products after initial 8
  useEffect(() => {
    if (hasLoaded) return;

    const loadRemaining = async () => {
      setIsLoadingMore(true);
      try {
        // Fetch all products (page 1 with large size to get everything)
        const result = await fetchProducts(1, 100);
        // Skip the first 8 since they're already rendered server-side
        const remaining = result.items.slice(8);
        setRemainingProducts(remaining.map((p) => mapServerToProduct(p, locale)));
        setHasLoaded(true);
      } catch (error) {
        console.error("Failed to load remaining products:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };

    loadRemaining();
  }, [locale, hasLoaded]);

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

  /* Read URL category */
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (!categorySlug) {
      if (activeFilter !== "All") {
        setActiveFilter("All");
      }
      return;
    }
    const categoryId = typeof window !== "undefined" 
      ? sessionStorage.getItem(`category_${categorySlug}`) 
      : null;
    const newFilter = categoryId || categorySlug;
    if (activeFilter !== newFilter) {
      setActiveFilter(newFilter);
    }
  }, [searchParams, activeFilter]);

  /* Search & filter */
  const qRaw = (searchParams.get("q") ?? "").toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All" && !qRaw) return remainingProducts;

    return remainingProducts.filter((p) => {
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
  }, [remainingProducts, activeFilter, qRaw]);

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

  if (!mounted) return null;

  // If still loading remaining products, show skeleton
  if (isLoadingMore) {
    return (
      <section className="pb-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-6 items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2 md:space-y-4 animate-pulse">
                <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
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

  // If no remaining products, just show pagination for the initial 8
  if (filteredProducts.length === 0 && hasLoaded) {
    return null;
  }

  return (
    <section className="pb-8 bg-background">
      <div className="container mx-auto px-4">
        {/* Category Tabs - Mobile only */}
        <div className="md:hidden mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => {
                setActiveFilter("All");
                router.push(`/${locale}/products`);
              }}
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
                onClick={() => {
                  setActiveFilter(String(cat.key));
                  const slug = (cat.englishName || "")
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  sessionStorage.setItem(`category_${slug}`, String(cat.key));
                  router.push(`/${locale}/products?category=${slug}`);
                }}
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

        {/* Remaining products grid */}
        {displayedProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-6 items-stretch">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={String(product.id)}
                product={product as any}
                index={index + 8}
              />
            ))}
          </div>
        )}

        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
};

export default ClientProductGrid;
