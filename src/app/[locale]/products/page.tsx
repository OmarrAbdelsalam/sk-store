import { Suspense } from "react";
import { fetchProducts } from "@/api/products";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import ClientProductGrid from "@/components/product/ClientProductGrid";
import { ProductsPageSkeleton } from "@/components/skeletons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return generatePageMetadata({
    title: isAr ? "منتجات SK Bags" : "SK Bags Products",
    description: isAr
      ? "تسوقي كل شنط SK Bags الهاند ميد البريميم بتصميمات أنيقة وخامات عالية الجودة وتوصيل لكل أنحاء مصر."
      : "Shop all SK Bags premium handmade bags with elegant designs, high-quality materials, and delivery across Egypt.",
    path: "/products",
    locale,
  });
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch initial products server-side for faster first paint
  let initialProducts: any[] = [];
  try {
    const result = await fetchProducts(1, 8);
    initialProducts = result.items;
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Products with filtering (breadcrumb is inside ClientProductGrid) */}
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ClientProductGrid initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
