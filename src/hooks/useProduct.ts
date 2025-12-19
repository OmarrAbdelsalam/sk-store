// hooks/useProduct.ts
"use client";

import useSWR, { preload, mutate } from "swr";
import { getProductById, type ProductApi } from "@/lib/api/products";

// Global cache for prefetched products
const prefetchedProducts = new Map<number, ProductApi>();

export function useProduct(id?: number) {
  const shouldFetch = typeof id === "number" && id > 0;

  const { data, error, isLoading, mutate: swrMutate } = useSWR<ProductApi>(
    shouldFetch ? ["product", id] : null,
    () => getProductById(id as number),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes - increased for better caching
      revalidateIfStale: false,
      // Use prefetched data as fallback
      fallbackData: id ? prefetchedProducts.get(id) : undefined,
    }
  );

  return { product: data, error, isLoading, refresh: swrMutate };
}

// Prefetch function for ProductCard - loads data into cache
export async function prefetchProduct(id: number) {
  // Skip if already prefetched
  if (prefetchedProducts.has(id)) return;
  
  try {
    // Preload into SWR cache
    const data = await preload(["product", id], () => getProductById(id));
    if (data) {
      prefetchedProducts.set(id, data);
      // Also update SWR cache directly
      mutate(["product", id], data, false);
    }
  } catch (error) {
    console.error(`Failed to prefetch product ${id}:`, error);
  }
}

// Prefetch multiple products at once
export function prefetchProducts(ids: number[]) {
  ids.forEach(id => prefetchProduct(id));
}
