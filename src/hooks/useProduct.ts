// hooks/useProduct.ts
"use client";

import useSWR, { preload } from "swr";
import { getProductById, type ProductApi } from "@/lib/api/products";

export function useProduct(id?: number) {
  const shouldFetch = typeof id === "number" && id > 0;

  const { data, error, isLoading, mutate } = useSWR<ProductApi>(
    shouldFetch ? ["product", id] : null,
    () => getProductById(id as number),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return { product: data, error, isLoading, refresh: mutate };
}

// Prefetch function for ProductCard hover
export function prefetchProduct(id: number) {
  preload(["product", id], () => getProductById(id));
}
