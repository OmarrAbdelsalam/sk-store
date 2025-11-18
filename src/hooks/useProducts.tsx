"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  getProductsPage,
  mapApiProductToUI,
  type ProductApi,
} from "@/lib/api/products";

export interface Product {
  id: number;
  name: string;
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

export const useProducts = () => {
  const locale = useLocale(); // 👈 هنا نحدد اللغة الحالية
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const page = await getProductsPage(1, 200);
        const mapped = (page.items ?? []).map((p) =>
          mapApiProductToUI(p, locale) // 👈 نمرر الـ locale
        );
        setProducts(mapped);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]); // 👈 لو غيرت اللغة، يعيد الماب تلقائيًا

  return { products, loading, error };
};
