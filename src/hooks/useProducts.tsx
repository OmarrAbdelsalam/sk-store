"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  fetchProducts,
  fetchProductById,
  searchProducts,
  filterProducts,
  type ProductApi,
} from "@/api/products";

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  category: string;
  price: string;
  priceNum: number;
  image: string;
  description: string;
  gender: string;
  availableColors: Array<{ name: string; hex: string }>;
  categoryIds?: string[];
  raw?: ProductApi;
  beforePrice?: number;
}

// Map ProductApi to UI Product format
export const mapApiProductToUI = (apiProduct: ProductApi, locale: 'ar' | 'en'): Product => {
  const name = locale === 'ar' ? apiProduct.nameAr : apiProduct.nameEn;
  const description = locale === 'ar' 
    ? (apiProduct.descriptionAr || apiProduct.descriptionEn || '')
    : (apiProduct.descriptionEn || apiProduct.descriptionAr || '');
  
  const mainImage = apiProduct.photos?.find(p => p.isMain)?.imageUrl || 
                   apiProduct.photos?.[0]?.imageUrl || 
                   '/placeholder-product.jpg';

  return {
    id: apiProduct.id,
    name,
    nameAr: apiProduct.nameAr,
    nameEn: apiProduct.nameEn,
    category: apiProduct.categories?.[0]?.arabicName || 'عام',
    price: `${apiProduct.price} ${locale === 'ar' ? 'جنيه' : 'EGP'}`,
    priceNum: apiProduct.price,
    image: mainImage,
    description,
    gender: "unisex",
    availableColors: apiProduct.colors?.map(c => ({
      name: locale === 'ar' ? (c.colorNameAr || c.colorNameEn || '') : (c.colorNameEn || c.colorNameAr || ''),
      hex: c.hexa || '#000000'
    })) || [],
    categoryIds: apiProduct.categories?.map(c => c.id) || [],
    raw: apiProduct,
    beforePrice: apiProduct.compareAtPrice ?? undefined,
  };
};

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
    // Initialize from memory cache if available
    const cached = productsCache[locale];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.products;
    }
    
    // Initialize from localStorage for instant display on reload
    if (typeof window !== 'undefined') {
      try {
        const localData = localStorage.getItem(`products_cache_${locale}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to read products from localStorage", e);
      }
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadProducts = useCallback(async (forceRefresh = false) => {
    // Check cache first
    const cached = productsCache[locale];
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProducts(cached.products);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchProducts(1, 100); // Get more products for better UX
      const mappedProducts = result.items.map(item => mapApiProductToUI(item, locale));
      
      // Update memory cache
      productsCache[locale] = {
        products: mappedProducts,
        timestamp: Date.now(),
      };
      productsCache.rawData = result.items;

      // Update localStorage cache
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`products_cache_${locale}`, JSON.stringify(mappedProducts));
        } catch (e) {
          console.error("Failed to save products to localStorage", e);
        }
      }

      setProducts(mappedProducts);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
      }
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  // Load products on mount and locale change
  useEffect(() => {
    loadProducts();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProducts]);

  const refreshProducts = useCallback(() => {
    return loadProducts(true);
  }, [loadProducts]);

  const getProductById = useCallback(async (id: string | number): Promise<Product | null> => {
    try {
      const apiProduct = await fetchProductById(String(id));
      if (!apiProduct) return null;
      
      return mapApiProductToUI(apiProduct, locale);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }, [locale]);

  const searchProductsLocal = useCallback(async (query: string): Promise<Product[]> => {
    try {
      const result = await searchProducts(query, 1, 50);
      return result.items.map(item => mapApiProductToUI(item, locale));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }, [locale]);

  const filterProductsLocal = useCallback(async (filters: {
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
  }): Promise<Product[]> => {
    try {
      const result = await filterProducts({
        ...filters,
        page: 1,
        pageSize: 50,
      });
      return result.items.map(item => mapApiProductToUI(item, locale));
    } catch (error) {
      console.error('Error filtering products:', error);
      return [];
    }
  }, [locale]);

  return {
    products,
    isLoading,
    error,
    refreshProducts,
    getProductById,
    searchProducts: searchProductsLocal,
    filterProducts: filterProductsLocal,
  };
};
