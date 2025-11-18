"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/hooks/useProducts";
import { useLocale, useTranslations } from "next-intl";
import { getProductsPage, mapApiProductToUI } from "@/lib/api/products";

interface RelatedProductsProps {
  currentProductId: number;
}

const RelatedProducts = ({ currentProductId }: RelatedProductsProps) => {
  const t = useTranslations("RelatedProducts");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await getProductsPage(1, 8);
        const mapped = data.items
          .filter((p) => p.id !== currentProductId)
          .slice(0, 4)
          .map((p) => mapApiProductToUI(p, locale));
        setProducts(mapped);
      } catch (error) {
        console.error("Failed to load related products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [currentProductId, locale]);

  if (loading) {
    return (
      <div className="mt-16" dir={dir}>
        <h2 className="text-2xl font-semibold mb-8 text-center">{t("title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-16" dir={dir}>
      <h2 className="text-2xl font-semibold mb-8 text-center">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="related"
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
