import { cache } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { fetchProductById, fetchProducts } from "@/api/products";
import { getStudioMap } from "@/lib/studio-photos";
import ProductDetailContent from "@/components/product/ProductDetailContent";
import ProductHeader from "@/components/product/ProductHeader";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

// Cached page, refreshed at most once a minute (admin edits show within 60s).
export const revalidate = 60;

// Every current product is built at deploy time, so nobody hits a slow
// first render after a deploy (the catalogue is small). Products added
// later are built on their first visit and cached from then on.
export async function generateStaticParams() {
  try {
    const { items } = await fetchProducts(1, 500);
    return items.map((p) => ({ id: String(p.id) }));
  } catch {
    return [];
  }
}

// One database round trip per render: generateMetadata and the page share it.
const getProduct = cache((id: string) => fetchProductById(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProduct(id);

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
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const productName = isAr ? product.nameAr : product.nameEn;

  // Which photos are white-background studio shots — decided here (cached
  // per photo) so the gallery renders right away instead of checking every
  // photo in the browser first.
  const studioMap = await getStudioMap(
    (product.photos ?? []).map((p) => p.imageUrl).filter((u): u is string => !!u && u.startsWith("http"))
  );

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="container px-0 pb-section">
        <ProductHeader productName={productName} />
        <ProductDetailContent product={product} studioMap={studioMap} />
      </div>
    </div>
  );
}
