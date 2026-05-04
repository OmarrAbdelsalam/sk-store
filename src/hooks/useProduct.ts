// hooks/useProduct.ts
"use client";

import useSWR, { preload, mutate } from "swr";
import { getProductById, type ProductApi } from "@/lib/api/products";

// Global cache for prefetched products - use string keys since IDs can be UUIDs
const prefetchedProducts = new Map<string, ProductApi>();

export function useProduct(id?: number | string) {
  // Handle both number and string IDs
  const stringId = id !== undefined && id !== null ? String(id) : undefined;
  const shouldFetch = stringId !== undefined && stringId !== "" && stringId !== "0";

  const { data, error, isLoading, mutate: swrMutate } = useSWR<ProductApi>(
    shouldFetch ? ["product", stringId] : null,
    async () => {
      const result = await getProductById(stringId as string);
      if (!result) throw new Error('Product not found');
      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes - increased for better caching
      revalidateIfStale: false,
      // Use prefetched data as fallback
      fallbackData: stringId ? prefetchedProducts.get(stringId) : undefined,
    }
  );

  return { product: data, error, isLoading, refresh: swrMutate };
}

// Prefetch function for ProductCard - loads data into cache
export async function prefetchProduct(id: number | string) {
  const stringId = String(id);
  // Skip if already prefetched
  if (prefetchedProducts.has(stringId)) return;
  
  try {
    // Preload into SWR cache
    const data = await preload(["product", stringId], () => getProductById(stringId));
    if (data) {
      prefetchedProducts.set(stringId, data);
      // Also update SWR cache directly
      mutate(["product", stringId], data, false);
    }
  } catch (error) {
    console.error(`Failed to prefetch product ${id}:`, error);
  }
}

// Prefetch multiple products at once
export function prefetchProducts(ids: (number | string)[]) {
  ids.forEach(id => prefetchProduct(id));
}
