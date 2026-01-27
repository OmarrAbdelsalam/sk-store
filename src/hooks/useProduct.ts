// hooks/useProduct.ts
"use client";

import useSWR, { preload, mutate } from "swr";
import { getProductById, type ProductApi } from "@/lib/api/products";

// Global cache for prefetched products with cleanup
const prefetchedProducts = new Map<number, ProductApi>();
const MAX_CACHE_SIZE = 50; // Maximum number of cached products

// Cleanup old cache entries
function cleanupCache() {
  if (prefetchedProducts.size > MAX_CACHE_SIZE) {
    const entries = Array.from(prefetchedProducts.entries());
    // Sort by timestamp and remove oldest entries
    entries.sort((a, b) => ((a[1] as any).timestamp || 0) - ((b[1] as any).timestamp || 0));
    const toRemove = entries.slice(0, prefetchedProducts.size - MAX_CACHE_SIZE);
    toRemove.forEach(([id]) => prefetchedProducts.delete(id));
  }
}

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
  // Skip if already prefetched recently
  if (prefetchedProducts.has(id)) {
    const cached = prefetchedProducts.get(id);
    // Re-prefetch if data is older than 2 minutes
    if (cached && Date.now() - (cached as any).timestamp < 120000) {
      return;
    }
  }
  
  try {
    // Preload into SWR cache
    const data = await preload(["product", id], () => getProductById(id));
    if (data) {
      (data as any).timestamp = Date.now();
      prefetchedProducts.set(id, data);
      // Also update SWR cache directly
      mutate(["product", id], data, false);
      
      // Cleanup cache if it gets too large
      cleanupCache();
    }
  } catch (error) {
    console.error(`Failed to prefetch product ${id}:`, error);
  }
}

// Prefetch multiple products at once with throttling
export function prefetchProducts(ids: number[]) {
  // Throttle prefetch requests to avoid overwhelming the server
  ids.forEach((id, index) => {
    setTimeout(() => prefetchProduct(id), index * 50); // 50ms delay between requests
  });
}
