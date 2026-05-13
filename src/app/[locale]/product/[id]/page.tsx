import { notFound } from "next/navigation";
import { fetchProductById } from "@/api/products";
import ProductDetailContent from "@/components/product/ProductDetailContent";
import ProductHeader from "@/components/product/ProductHeader";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return generatePageMetadata({
      title: locale === "ar" ? "منتج غير موجود" : "Product Not Found",
      description: "",
      path: `/product/${id}`,
      locale,
    });
  }

  const isAr = locale === "ar";
  const name = isAr ? product.nameAr : product.nameEn;
  const description = isAr
    ? product.descriptionAr || product.descriptionEn || ""
    : product.descriptionEn || product.descriptionAr || "";

  return generatePageMetadata({
    title: product.seo_title_en && !isAr
      ? product.seo_title_en
      : product.seo_title_ar && isAr
      ? product.seo_title_ar
      : name,
    description: product.seo_description_en && !isAr
      ? product.seo_description_en
      : product.seo_description_ar && isAr
      ? product.seo_description_ar
      : description.slice(0, 160),
    path: `/product/${id}`,
    locale,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const productName = isAr ? product.nameAr : product.nameEn;

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-4">
        <ProductHeader productName={productName} />
        <ProductDetailContent product={product} />
      </div>
    </div>
  );
}
