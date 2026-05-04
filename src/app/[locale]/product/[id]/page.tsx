"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useProduct } from "@/hooks/useProduct";
import ProductHeader from "@/components/product/ProductHeader";
import ProductDetailLoading from "@/components/product/ProductDetailLoading";
import ProductDetailError from "@/components/product/ProductDetailError";
import ProductDetailContent from "@/components/product/ProductDetailContent";
import NavigationLoadingHandler from "@/components/NavigationLoadingHandler";

export default function ProductDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const t = useTranslations("ProductDetail");

  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  
  // Use string ID directly - updated to handle UUIDs
  const { product, isLoading, error } = useProduct(id);

  // Prefetch cart and checkout pages in background
  useEffect(() => {
    if (product) {
      router.prefetch(`/${locale}/cart`);
      router.prefetch(`/${locale}/checkout`);
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

  const productName = isAr ? product.nameAr : product.nameEn;

  return (
    <div className="min-h-screen" dir={dir}>
      <NavigationLoadingHandler />
      <div className="container mx-auto px-4 py-4">
        <ProductHeader onBack={() => router.back()} productName={productName} />
        
        <ProductDetailContent product={product} />

        {/* Hidden prefetch links for cart and checkout */}
        <div className="hidden">
          <link rel="prefetch" href={`/${locale}/cart`} />
          <link rel="prefetch" href={`/${locale}/checkout`} />
        </div>
      </div>
    </div>
  );
}
