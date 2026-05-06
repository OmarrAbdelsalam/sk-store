"use client";

import useSWR from "swr";
import { getCategories, type CategoryOption } from "@/api/categories";
import { useLocale } from "next-intl";

export function useCategories() {
  const locale = useLocale();

  // Try to get initial data from localStorage
  let initialData: CategoryOption[] = [];
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`categories_cache_${locale}`);
      if (local) {
        initialData = JSON.parse(local);
      }
    } catch (e) {}
  }
  
  const { data, error, isLoading } = useSWR<CategoryOption[]>(
    ["categories", locale],
    async () => {
      const result = await getCategories(locale);
      if (typeof window !== 'undefined' && result) {
        localStorage.setItem(`categories_cache_${locale}`, JSON.stringify(result));
      }
      return result;
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 60 * 1000, // 30 minutes
      revalidateIfStale: true, // We want to revalidate to get fresh data in the background
    }
  );

  return {
    categories: data && data.length > 0 ? data : initialData,
    isLoading: isLoading && (!data || data.length === 0) && initialData.length === 0,
    error,
  };
}
