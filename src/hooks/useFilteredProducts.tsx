// /src/hooks/useFilteredProducts.ts
"use client";
import useSWR from "swr";
import { useMemo } from "react";
import { filterProducts, type ProductApi } from "@/lib/api/products";

export type Filters = {
  search?: string;        // بحث محلي (اسم/وصف)
  priceFrom?: number;
  priceTo?: number;
  colorName?: string;     // english lowercase (e.g. "red")
  sizeName?: string;      // lowercase (e.g. "xl")
  gender?: "all" | "men" | "women" | "unisex";
  pageNumber?: number;
  pageSize?: number;
};

const fetcher = (key: string) => {
  const { priceFrom, priceTo, colorName, sizeName, pageNumber, pageSize } = JSON.parse(key);
  return filterProducts({ priceFrom, priceTo, colorName, sizeName, pageNumber, pageSize });
};

// بسيط: لو عايز تعمل debounce في الأب، ابعته جاهز هنا
export function useFilteredProducts(filters: Filters) {
  // مفتاح SWR لا يشمل search/gender لأنهم هنفلترهم محليًا
  const key = useMemo(
    () =>
      JSON.stringify({
        priceFrom: filters.priceFrom ?? 0,
        priceTo: filters.priceTo ?? 100000,
        colorName: filters.colorName || "",
        sizeName: filters.sizeName || "",
        pageNumber: filters.pageNumber ?? 1,
        pageSize: filters.pageSize ?? 12,
      }),
    [
      filters.priceFrom,
      filters.priceTo,
      filters.colorName,
      filters.sizeName,
      filters.pageNumber,
      filters.pageSize,
    ]
  );

  const { data, error, isLoading } = useSWR(key, fetcher);

  // فلترة محلية اختيارية: search + gender
  const items = useMemo(() => {
    const list = data?.items ?? [];
    const byGender =
      filters.gender && filters.gender !== "all"
        ? list.filter((p) => (p.genderType || "Unisex").toLowerCase() === filters.gender)
        : list;

    const bySearch = filters.search?.trim()
      ? byGender.filter((p) => {
          const s = filters.search!.toLowerCase();
          return (
            (p.nameAr || "").toLowerCase().includes(s) ||
            (p.nameEn || "").toLowerCase().includes(s) ||
            (p.descriptionAr || "").toLowerCase().includes(s) ||
            (p.descriptionEn || "").toLowerCase().includes(s)
          );
        })
      : byGender;

    return bySearch;
  }, [data, filters.search, filters.gender]);

  return {
    items,
    raw: data,
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error,
  };
}
