"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";
import ProductPagination from "@/components/product/ProductPagination";
import ProductFilters, { colorKey, readFilterParams } from "@/components/product/ProductFilters";
import { ProductsPageSkeleton } from "@/components/skeletons";
import Link from "next/link";
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

  // ?badge=new_arrival | best_seller | sale — used by the header menu.
  // Falls back to every product when nothing carries the badge, so the
  // page is never empty (same rule as the home page sections).
  const badge = (searchParams.get("badge") ?? "").trim();
  const badgeProducts = useMemo(() => {
    if (!badge) return allProducts;
    const matches = allProducts.filter((p) => {
      if (p.raw?.badge === badge) return true;
      if (badge === "sale") {
        const before = Number((p as any).beforePrice ?? (p.raw as any)?.compareAtPrice) || 0;
        return before > Number(p.priceNum);
      }
      return false;
    });
    return matches.length > 0 ? matches : allProducts;
  }, [allProducts, badge]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All" && !qRaw) return badgeProducts;

    return badgeProducts.filter((p) => {
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
  }, [badgeProducts, activeFilter, qRaw]);

  /* Price / colour / sort (ProductFilters writes them to the URL) */
  const fp = readFilterParams(searchParams);
  const fpKey = `${fp.priceFrom}|${fp.priceTo}|${fp.colors.join(",")}|${fp.sort}`;
  const refinedProducts = useMemo(() => {
    let list = filteredProducts.filter((p) => {
      const price = Number(p.priceNum) || 0;
      if (fp.priceFrom !== null && price < fp.priceFrom) return false;
      if (fp.priceTo !== null && price > fp.priceTo) return false;
      if (fp.colors.length) {
        const names = (p.raw?.colors ?? []).flatMap((c: any) => [
          colorKey(c),
          String(c.colorNameAr ?? "").trim().toLowerCase(),
        ]);
        if (!fp.colors.some((k) => names.includes(k))) return false;
      }
      return true;
    });
    if (fp.sort === "price-asc") list = [...list].sort((a, b) => a.priceNum - b.priceNum);
    if (fp.sort === "price-desc") list = [...list].sort((a, b) => b.priceNum - a.priceNum);
    return list;
  }, [filteredProducts, fpKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back to page 1 whenever a filter or the sort changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [fpKey]);

  /* Pagination */
  const totalPages = Math.ceil(refinedProducts.length / productsPerPage) || 1;

  const displayedProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return refinedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [refinedProducts, currentPage, productsPerPage]);

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

  // Before mount and while loading: the same skeleton as the route loader,
  // so the page doesn't flash blank or change shape.
  if (!mounted || isLoadingMore) {
    return (
      <section className="bg-background pb-section">
        <ProductsPageSkeleton />
      </section>
    );
  }

  const badgeTitles: Record<string, [string, string]> = {
    new_arrival: ["New In", "وصل حديثاً"],
    best_seller: ["Best Sellers", "الأكثر مبيعاً"],
    sale: ["Sale", "تخفيضات"],
  };
  const pageTitle =
    activeCategoryName ||
    (badge && badgeTitles[badge] ? badgeTitles[badge][locale === "ar" ? 1 : 0] : "") ||
    (locale === "ar" ? "كل الشنط" : "All bags");


  return (
    <section id="products" className="pb-section bg-background">
      <div className="container px-0">
        {/* Page title (Parfois: small, bold, above the tabs) */}
        <div className="ds-page pb-1 pt-2">
          <h1 className="font-sans text-fine font-semibold text-ink">{pageTitle}</h1>
        </div>

        {/* Category tabs — active one underlined in ink */}
        <div className="border-b border-gray-200">
          <div className="ds-page flex overflow-x-auto scrollbar-hide" role="tablist">
            {[{ key: "All", label: locale === "ar" ? "عرض الكل" : "View All", cat: null as CategoryOption | null },
              ...categories.map((cat) => ({
                key: String(cat.key),
                label: locale === "ar" ? cat.arabicName : cat.englishName,
                cat,
              }))].map((tab) => {
              const active = String(activeFilter) === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleCategoryClick(tab.cat)}
                  className={`-mb-px flex h-10 shrink-0 items-center whitespace-nowrap border-b-2 px-4 font-sans text-fine transition-colors duration-fast ${
                    active
                      ? "border-ink font-semibold text-ink"
                      : "border-transparent text-ink/55 hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters — dropdowns (Price · Color · Has deal), count, Sort by */}
        <div className="ds-page py-5">
          <ProductFilters products={filteredProducts as any} resultCount={refinedProducts.length} />
        </div>

        {/* Products grid */}
        {displayedProducts.length > 0 ? (
          <div className="ds-grid-page grid grid-cols-2 items-stretch gap-x-tile gap-y-row-gap md:grid-cols-3 lg:grid-cols-4">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={String(product.id)}
                product={product as any}
                index={index}
              />
            ))}
          </div>
        ) : (
          hasLoaded && (activeFilter !== "All" || refinedProducts.length === 0) && (
            <div className="flex flex-col items-center px-gutter py-section text-center">
              <h2 className="font-display text-[22px] leading-tight text-ink sm:text-[26px]">
                {locale === "ar" ? "مفيش منتجات هنا" : "No products found"}
              </h2>
              <p className="mt-2 font-sans text-[14px] leading-6 text-gray-500">
                {refinedProducts.length === 0 && filteredProducts.length > 0
                  ? locale === "ar" ? "مفيش منتجات بتطابق الفلاتر اللي اخترتيها." : "No products match these filters."
                  : locale === "ar" ? "مفيش منتجات في التصنيف ده لسه." : "There are no products in this category yet."}
              </p>
              <Button asChild variant="outline" className="mt-6 h-12 px-8">
                <Link href="/products">{locale === "ar" ? "مسح الفلاتر" : "Clear filters"}</Link>
              </Button>
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
