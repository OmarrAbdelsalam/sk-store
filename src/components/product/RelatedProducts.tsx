"use client";

import ProductCard from "./ProductCard";
import { Product } from "@/hooks/useProducts";
import { useLocale, useTranslations } from "next-intl";

interface RelatedProductsProps {
  products: Product[];
  currentProductId: number;
}

const RelatedProducts = ({ products, currentProductId }: RelatedProductsProps) => {
  const t = useTranslations("RelatedProducts");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const relatedProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-16" dir={dir}>
      <h2 className="text-2xl font-semibold mb-8 text-center">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
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
