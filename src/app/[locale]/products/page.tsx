import { Suspense } from "react";
import { fetchProducts } from "@/api/products";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import ClientProductGrid from "@/components/product/ClientProductGrid";

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

const ProductGridSkeleton = () => (
  <div className="container mx-auto px-5 py-12">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 items-stretch">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="aspect-[4/5] w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  </div>
);

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
    <main className="min-h-screen pt-4 md:pt-6">
      {/* Products with filtering (breadcrumb is inside ClientProductGrid) */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ClientProductGrid initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
