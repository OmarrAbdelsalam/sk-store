"use client";

import { useParams, useRouter } from "next/navigation";
import { lazy, Suspense, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useProduct } from "@/hooks/useProduct";
import ProductHeader from "@/components/product/ProductHeader";
import ProductDetailLoading from "@/components/product/ProductDetailLoading";
import ProductDetailError from "@/components/product/ProductDetailError";
import ProductDetailContent from "@/components/product/ProductDetailContent";

const RelatedProducts = lazy(() => import("@/components/product/RelatedProducts"));

export default function ProductDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const t = useTranslations("ProductDetail");

  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const numericId = Number.parseInt(id ?? "0", 10);

  const { product, isLoading, error } = useProduct(
    Number.isFinite(numericId) ? numericId : undefined
  );

  // Prefetch cart and checkout pages in background
  useEffect(() => {
    if (product) {
      // Prefetch after a short delay to not block initial render
      const timer = setTimeout(() => {
        router.prefetch(`/${locale}/cart`);
        router.prefetch(`/${locale}/checkout`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [product, locale, router]);

  if (isLoading) {
    return <ProductDetailLoading dir={dir} onBack={() => router.back()} />;
  }

  if (error || !product) {
    return (
      <ProductDetailError
        dir={dir}
        message={isAr ? "المنتج غير موجود أو حدث خطأ في التحميل." : "Product not found or failed to load."}
        onBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-4">
        <ProductHeader onBack={() => router.back()} />
        
        <ProductDetailContent product={product} />

        <Suspense fallback={<div className="mt-16 h-80 animate-pulse bg-muted rounded" />}>
          <RelatedProducts currentProductId={numericId} />
        </Suspense>

        {/* Hidden prefetch links for cart and checkout */}
        <div className="hidden">
          <link rel="prefetch" href={`/${locale}/cart`} />
          <link rel="prefetch" href={`/${locale}/checkout`} />
        </div>
      </div>
    </div>
  );
}
