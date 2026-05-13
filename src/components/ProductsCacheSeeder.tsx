"use client";

import { useEffect } from "react";
import { seedProductsCache } from "@/hooks/useProducts";
import type { ProductApi } from "@/api/products";

interface ProductsCacheSeederProps {
  products: ProductApi[];
  locale: string;
}

/**
 * Seeds the shared products cache with server-fetched data.
 * This prevents client components (ProductGrid, BestSellers, HandbagsSection)
 * from making redundant API calls on initial page load.
 * Renders nothing — purely a side-effect component.
 */
const ProductsCacheSeeder = ({ products, locale }: ProductsCacheSeederProps) => {
  useEffect(() => {
    if (products && products.length > 0) {
      seedProductsCache(products, locale as 'ar' | 'en');
    }
  }, [products, locale]);

  return null;
};

export default ProductsCacheSeeder;
