"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductPagination from "@/components/product/ProductPagination";
import { useTranslations, useLocale } from "next-intl";
import { getCategories, type CategoryOption } from "@/api/categories";
import {
  filterProducts,
  mapApiProductToUI,
  type ProductApi,
} from "@/lib/api/products";
import { prefetchProducts } from "@/hooks/useProduct";
import { ShoppingBag } from "lucide-react";

/* ===================== Types ===================== */

type SearchParamsLike = {
  get(name: string): string | null;
  toString?: () => string;
};

interface FilterResponse {
  items?: ProductApi[];
}

interface Product {
  id: string | number;
  name: string;
  nameAr?: string;  // للبحث ثنائي اللغة
  nameEn?: string;  // للبحث ثنائي اللغة
  price: string;
  priceNum: number;
  image: string;
  description: string;
  gender: string; // keeping as string to match ProductCard
  availableColors: Array<{ name: string; hex: string }>;
  category?: string;
  categoryIds?: Array<number | string>;
  raw?: ProductApi;  // للـ ProductCard عشان يحسب الـ stock
}

/* ===================== Helpers ===================== */

const isDefaultFilters = (sp: SearchParamsLike) => {
  const priceFrom = Number(sp.get("priceFrom") ?? 0);
  const priceTo = Number(sp.get("priceTo") ?? 200);
  const color = sp.get("colorName");
  const size = sp.get("sizeName");
  const gender = (sp.get("gender") ?? "all").toLowerCase();
  return (
    priceFrom === 0 &&
    priceTo === 200 &&
    !color &&
    !size &&
    (gender === "all" || gender === "")
  );
};

/**
 * ✅ استخدم نفس الماب الرئيسي لكن نحوله لشكل ProductGrid المحلي
 * مع إضافة nameAr و nameEn للبحث ثنائي اللغة
 */
const mapServerToProduct = (p: ProductApi, locale: string): Product => {
  const ui = mapApiProductToUI(p, locale as 'ar' | 'en');
  return {
    id: ui.id,
    name: ui.name,
    nameAr: p.nameAr ?? "",  // للبحث ثنائي اللغة
    nameEn: p.nameEn ?? "",  // للبحث ثنائي اللغة
    price: ui.price,
    priceNum: ui.priceNum,
    image: ui.image,
    description: ui.description,
    gender: ui.gender,
    availableColors: ui.availableColors,
    category: ui.category,
    categoryIds: ui.categoryIds,
    raw: p,  // للـ ProductCard عشان يحسب الـ stock
  };
};

/* ===================== Component ===================== */

interface ProductGridProps {
  isFullPage?: boolean;
}

const ProductGrid = ({ isFullPage = false }: ProductGridProps) => {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [serverFiltered, setServerFiltered] = useState<Product[] | null>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, isLoading: loading } = useProducts();
  const t = useTranslations();
  const locale = useLocale();

  const productsPerPage = 16; // Fixed value to prevent hydration mismatch

  // Mount state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  /* Read URL category once per change - optimized */
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (!categorySlug) {
      if (activeFilter !== "All") {
        setActiveFilter("All");
      }
      return;
    }
    
    // Get the actual ID from sessionStorage
    const categoryId = sessionStorage.getItem(`category_${categorySlug}`);
    const newFilter = categoryId || categorySlug;
    
    if (activeFilter !== newFilter) {
      setActiveFilter(newFilter);
    }
  }, [searchParams, activeFilter]);

  /* Server filtering when filters present */
  useEffect(() => {
    const sp = searchParams as unknown as SearchParamsLike;

    if (isDefaultFilters(sp)) {
      setServerFiltered(null);
      setServerError(null);
      setServerLoading(false);
      return;
    }

    const priceFrom = Number(sp.get("priceFrom") ?? 0);
    const priceTo = Number(sp.get("priceTo") ?? 200);
    const colorName = sp.get("colorName") ?? undefined;
    const sizeName = sp.get("sizeName") ?? undefined;

    setServerLoading(true);
    setServerError(null);

    filterProducts({
      minPrice: priceFrom,
      maxPrice: priceTo,
      page: 1,
      pageSize: 100,
    })
      .then((res: unknown) => {
        const { items } = (res as FilterResponse) ?? {};
        const safeItems = Array.isArray(items) ? items : [];
        setServerFiltered(
          safeItems.map((p) => mapServerToProduct(p, locale))
        );
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to filter";
        console.error(e);
        setServerError(message);
        setServerFiltered([]);
      })
      .finally(() => setServerLoading(false));
  }, [searchParams, locale]);

  /* Base list (server → mapped) OR client list */
  const baseList: Product[] = useMemo(() => {
    if (serverFiltered) return serverFiltered;
    // useProducts راجع جاهز بالـ locale من
    return (products as unknown as Product[]) ?? [];
  }, [serverFiltered, products]);

  /* Apply activeFilter (category) */
  const afterCategory: Product[] = useMemo(() => {
    if (activeFilter === "All") return baseList;

    const byId = baseList.filter((p) =>
      (p.categoryIds ?? []).some((cid) => String(cid) === String(activeFilter))
    );
    if (byId.length > 0) return byId;

    // legacy name
    return baseList.filter(
      (p) => p?.category && String(p.category) === String(activeFilter)
    );
  }, [baseList, activeFilter]);

  /* q & gender tokens */
  const qRaw = (searchParams.get("q") ?? "").toLowerCase().trim();
  const genderParamRaw = (searchParams.get("gender") ?? "all")
    .toLowerCase()
    .trim();
  const genderTokens = useMemo(
    () =>
      genderParamRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [genderParamRaw]
  );

  /* Gender rule as stable callback (fixes exhaustive-deps) */
  const matchesGender = useCallback(
    (g: string) => {
      const pg = (g || "").toLowerCase();

      // all or empty -> allow all
      if (genderTokens.length === 0 || genderTokens.includes("all")) return true;

      const wantsMen = genderTokens.includes("men");
      const wantsWomen = genderTokens.includes("women");
      const wantsUnisex = genderTokens.includes("unisex");

      // men only -> men + unisex
      if (wantsMen && !wantsWomen)
        return pg === "men" || pg === "unisex" || wantsUnisex;

      // women only -> women + unisex
      if (wantsWomen && !wantsMen)
        return pg === "women" || pg === "unisex" || wantsUnisex;

      // men & women -> include all
      if (wantsMen && wantsWomen)
        return pg === "men" || pg === "women" || pg === "unisex";

      // only unisex
      if (wantsUnisex && !wantsMen && !wantsWomen) return pg === "unisex";

      // fallback exact match
      return genderTokens.includes(pg);
    },
    [genderTokens]
  );

  /* Final client-side filtering (gender + text search) */
  const filteredProducts = useMemo(() => {
    return afterCategory.filter((p) => {
      const okGender = matchesGender(p.gender);
      // البحث ثنائي اللغة: يبحث في الاسم العربي والإنجليزي معاً
      const okSearch = !qRaw
        ? true
        : (p.name ?? "").toLowerCase().includes(qRaw) ||
          (p.nameAr ?? "").toLowerCase().includes(qRaw) ||
          (p.nameEn ?? "").toLowerCase().includes(qRaw) ||
          (p.description ?? "").toLowerCase().includes(qRaw);
      return okGender && okSearch;
    });
  }, [afterCategory, qRaw, matchesGender]);

  /* View All / Expansion Logic */
  const [isExpanded, setIsExpanded] = useState(isFullPage);

  /* Reset expansion on filter changes */
  useEffect(() => {
    setCurrentPage(1);
    setIsExpanded(isFullPage);
  }, [activeFilter, searchParams, isFullPage]);

  /* Title */
  const displayTitle = useMemo(() => {
    if (activeFilter === "All") return t("ProductGrid.ourCollections");
    const byId = categories.find((c) => String(c.key) === String(activeFilter));
    if (byId) {
      return locale === 'ar' ? byId.arabicName : byId.englishName;
    }
    const legacyTitles: Record<string, string> = {
      "Scrub Tops": t("ProductGrid.tops"),
      "Scrub Pants": t("ProductGrid.pants"),
      Accessories: t("ProductGrid.accessories"),
      Premium: t("ProductGrid.premium"),
    };
    return legacyTitles[activeFilter] || t("ProductGrid.ourCollections");
  }, [activeFilter, categories, t, locale]);

  /* Pagination & Display Logic */
  const totalPages =
    Math.ceil((filteredProducts.length || 0) / productsPerPage) || 1;
  
  const displayedProducts = useMemo(() => {
    if (!isExpanded) {
      return filteredProducts.slice(0, 8); // 8 for desktop, CSS hides last 2 on mobile
    }
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [isExpanded, filteredProducts, currentPage, productsPerPage]);

  /* Prefetch visible products - only first page */
  useEffect(() => {
    if (displayedProducts.length > 0 && currentPage === 1) {
      // Only prefetch first 4 products on initial load
      const productIds = displayedProducts.slice(0, 4).map(p => p.id);
      prefetchProducts(productIds);
    }
  }, [displayedProducts, currentPage]);

  /* Actions */
  const showAll = () => {
    setActiveFilter("All");
    const spString = searchParams.toString();
    if (!spString) {
      router.push(`/`);
      return;
    }
    const params = new URLSearchParams(spString);
    params.delete("categoryId");
    params.delete("category");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : `/`);
  };

  const isBusy = loading || serverLoading;

  // Don't render until mounted (ssr: false handles this)
  if (!mounted) {
    return null;
  }

  /* Render */
  return (
    <section id="products" className={`${isFullPage ? 'pt-2 pb-8' : ''} bg-background`}>
      <div className="container mx-auto px-5">
        {isFullPage ? (
          <>
            {/* Breadcrumb - Desktop/Tablet only */}
            <nav className="hidden md:flex items-center gap-2 text-sm mb-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                {locale === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <span className="text-muted-foreground">/</span>
              {activeFilter !== "All" ? (
                <>
                  <Link href={`/${locale}/products`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {locale === 'ar' ? 'المنتجات' : 'Products'}
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-medium text-foreground">
                    {(() => {
                      const cat = categories.find((c) => String(c.key) === String(activeFilter));
                      return cat ? (locale === 'ar' ? cat.arabicName : cat.englishName) : activeFilter;
                    })()}
                  </span>
                </>
              ) : (
                <span className="font-medium text-foreground">
                  {locale === 'ar' ? 'كل المنتجات' : 'All Products'}
                </span>
              )}
            </nav>

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
                  {locale === 'ar' ? 'كل المنتجات' : 'All Products'}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveFilter(String(cat.key));
                      const slug = (cat.englishName || '').toLowerCase().replace(/\s+/g, '-');
                      sessionStorage.setItem(`category_${slug}`, String(cat.key));
                      router.push(`/${locale}/products?category=${slug}`);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      String(activeFilter) === String(cat.key)
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {locale === 'ar' ? cat.arabicName : cat.englishName}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center mb-10">
            <h2 className="font-playfair text-3xl md:text-4xl text-[#2D2A26] mb-2">
              {displayTitle}
            </h2>
            <div className="w-24 h-[2px] bg-[#C2A878] mx-auto mt-3 rounded-full"></div>
          </div>
        )}

        {isBusy && displayedProducts.length === 0 ? (
          null
        ) : displayedProducts.length === 0 ? (
          <div className="text-center pt-4 md:pt-8 pb-20">
            <div className="flex justify-center mb-6">
              <ShoppingBag className="w-24 h-24 text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-medium mb-2">
              {t("ProductGrid.notFound")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("ProductGrid.tryChange")}
            </p>
            <Button variant="outline" onClick={showAll}>
              {t("ProductGrid.showAll")}
            </Button>
            {serverError && (
              <p className="mt-4 text-sm text-destructive">{serverError}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-4 items-stretch">
              {displayedProducts.map((product, index) => (
                <div 
                  key={String(product.id)} 
                  className={!isExpanded && index >= 6 ? "hidden md:block" : ""}
                >
                  <ProductCard
                    product={product}
                    index={index}
                  />
                </div>
              ))}
            </div>

            {/* View All Button */}
            {!isFullPage && (
              <div className="text-center mt-12">
                <Button 
                  onClick={() => router.push(`/${locale}/products`)}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 rounded-none tracking-[0.2em] uppercase text-xs transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {t("ProductGrid.viewAll") || "View All"}
                </Button>
              </div>
            )}
          </>
        )}

        {isExpanded && (
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

export default ProductGrid;

