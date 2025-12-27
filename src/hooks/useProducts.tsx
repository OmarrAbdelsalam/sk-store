"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  getProductsPage,
  mapApiProductToUI,
  type ProductApi,
} from "@/lib/api/products";

export interface Product {
  id: number;
  name: string;
  nameAr?: string;        // للبحث ثنائي اللغة
  nameEn?: string;        // للبحث ثنائي اللغة
  category: string;       // اسم عرض
  price: string;          // "1000 جنيه" أو "1000 EGP"
  priceNum: number;       // 1000
  image: string;
  description: string;
  gender: string;         // "unisex" | "men" | "women"
  availableColors: Array<{ name: string; hex: string }>;

  // إضافيات:
  categoryIds?: string[];
  raw?: ProductApi;
}

// Cache for products - shared across all hook instances
const productsCache: {
  ar: { products: Product[]; timestamp: number } | null;
  en: { products: Product[]; timestamp: number } | null;
  rawData: ProductApi[] | null;
} = {
  ar: null,
  en: null,
  rawData: null,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProducts = () => {
  const locale = useLocale() as 'ar' | 'en';
  const [products, setProducts] = useState<Product[]>(() => {
    // Initialize from cache if available
    const cached = productsCache[locale];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.products;
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    // Don't show loading if we have cached data
    const cached = productsCache[locale];
    return !(cached && Date.now() - cached.timestamp < CACHE_DURATION);
  });
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Fetch function that can be called on demand
  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = productsCache[locale];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProducts(cached.products);
        setLoading(false);
        return;
      }

      // If we have raw data cached, just re-map it for the new locale
      if (productsCache.rawData && productsCache.rawData.length > 0) {
        const mapped = productsCache.rawData.map((p) => mapApiProductToUI(p, locale));
        productsCache[locale] = { products: mapped, timestamp: Date.now() };
        setProducts(mapped);
        setLoading(false);
        return;
      }
    }

    // Prevent duplicate fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const page = await getProductsPage(1, 100);
      
      if (!mountedRef.current) return;
      
      // Cache raw data
      productsCache.rawData = page.items ?? [];
      
      const mapped = (page.items ?? []).map((p) =>
        mapApiProductToUI(p, locale)
      );
      
      // Cache mapped products
      productsCache[locale] = { products: mapped, timestamp: Date.now() };
      
      setProducts(mapped);
    } catch (e: any) {
      if (!mountedRef.current) return;
      console.error(e);
      setError(e?.message || "Failed to load products");
      setProducts([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [locale]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchProducts();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProducts]);

  // Handle back/forward navigation (bfcache)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted = true means page was restored from bfcache
      if (event.persisted) {
        // Re-fetch from cache (will use cached data if still valid)
        const cached = productsCache[locale];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setProducts(cached.products);
          setLoading(false);
        } else {
          fetchProducts();
        }
      }
    };

    // Handle popstate for client-side navigation
    const handlePopState = () => {
      // Small delay to let Next.js router settle
      setTimeout(() => {
        const cached = productsCache[locale];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setProducts(cached.products);
          setLoading(false);
        } else {
          fetchProducts();
        }
      }, 50);
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [locale, fetchProducts]);

  return { products, loading, error };
};
