"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { prefetchProduct } from "@/hooks/useProduct";
import { Stethoscope } from "lucide-react";

/* ===================== Types ===================== */

type SearchParamsLike = {
  get(name: string): string | null;
  toString?: () => string;
};

interface FilterResponse {
  items?: ProductApi[];
}

interface Product {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  description: string;
  gender: string; // keeping as string to match ProductCard
  availableColors: Array<{ name: string; hex: string }>;
  category?: string;
  categoryIds?: Array<number | string>;
}

/* ===================== Helpers ===================== */

const DEFAULT_IMAGE = "/placeholder-product.png";

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
 */
const mapServerToProduct = (p: ProductApi, locale: string): Product => {
  const ui = mapApiProductToUI(p, locale);
  return {
    id: ui.id,
    name: ui.name,
    price: ui.price,
    priceNum: ui.priceNum,
    image: ui.image,
    description: ui.description,
    gender: ui.gender,
    availableColors: ui.availableColors,
    category: ui.category,
    categoryIds: ui.categoryIds,
  };
};

/* ===================== Component ===================== */

const ProductGrid = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [serverFiltered, setServerFiltered] = useState<Product[] | null>(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { products, loading } = useProducts();
  const t = useTranslations();
  const locale = useLocale();

  const productsPerPage = isMobile ? 14 : 16;

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
      priceFrom,
      priceTo,
      colorName,
      sizeName,
      pageNumber: 1,
      pageSize: 100, // ← قللنا من 200 لـ 100
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
      const okSearch = !qRaw
        ? true
        : (p.name ?? "").toLowerCase().includes(qRaw) ||
          (p.description ?? "").toLowerCase().includes(qRaw);
      return okGender && okSearch;
    });
  }, [afterCategory, qRaw, matchesGender]);

  /* Reset page on filter changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchParams]);

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

  /* Pagination */
  const totalPages =
    Math.ceil((filteredProducts.length || 0) / productsPerPage) || 1;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  /* Prefetch visible products */
  useEffect(() => {
    if (currentProducts.length > 0) {
      // Prefetch current page products
      currentProducts.forEach((product) => {
        prefetchProduct(product.id);
      });
      
      // Prefetch next page products if available
      if (currentPage < totalPages) {
        const nextPageStart = indexOfLastProduct;
        const nextPageEnd = nextPageStart + productsPerPage;
        const nextPageProducts = filteredProducts.slice(nextPageStart, nextPageEnd);
        nextPageProducts.forEach((product) => {
          setTimeout(() => prefetchProduct(product.id), 1000); // Delay to avoid overwhelming
        });
      }
    }
  }, [currentProducts, currentPage, totalPages, indexOfLastProduct, productsPerPage, filteredProducts]);

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

  /* Render */
  return (
    <section id="products" className="py-4 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div
          className={`md:mb-12 animate-fade-in ${
            isMobile ? "text-start" : "text-center"
          }`}
        >
          <h2
            className={`font-medium ${
              isMobile ? "text-2xl mb-2" : "text-4xl md:text-5xl mb-3"
            }`}
          >
            {displayTitle}
          </h2>
          {isMobile ? (
            <>
              <div className="h-0.5 w-32 bg-blue-600 mb-3"></div>
              <p className="text-muted-foreground text-sm mb-6">
                {t("ProductGrid.subtitle")}
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                {t("ProductGrid.subtitle")}
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-blue-600"></div>
                <div className="h-1 w-16 bg-blue-600 rounded-full"></div>
                <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-blue-600"></div>
              </div>
            </>
          )}
        </div>

        {isBusy ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 lg:gap-12">
            {Array.from({ length: isMobile ? 6 : 8 }).map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-8 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-6">
              <Stethoscope className="w-24 h-24 text-muted-foreground/30" strokeWidth={1.5} />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 lg:gap-12 items-stretch">
            {currentProducts.map((product, index) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={index}
                variant="grid"
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

export default ProductGrid;
