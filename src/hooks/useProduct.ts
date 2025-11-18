// hooks/useProduct.ts
"use client";

import useSWR from "swr";
import { getProductById, type ProductApi } from "@/lib/api/products";

export function useProduct(id?: number) {
  const shouldFetch = typeof id === "number" && id > 0;

  const { data, error, isLoading, mutate } = useSWR<ProductApi>(
    shouldFetch ? ["product", id] : null,
    () => getProductById(id as number)
  );

  return { product: data, error, isLoading, refresh: mutate };
}
