"use client";

import useSWR from "swr";
import { getCategories, type CategoryOption } from "@/api/categories";
import { useLocale } from "next-intl";

export function useCategories() {
  const locale = useLocale();
  
  const { data, error, isLoading } = useSWR<CategoryOption[]>(
    ["categories", locale],
    () => getCategories(locale),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30 * 60 * 1000, // 30 minutes
      revalidateIfStale: false,
    }
  );

  return {
    categories: data ?? [],
    isLoading,
    error,
  };
}
