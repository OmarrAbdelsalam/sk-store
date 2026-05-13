import { Suspense } from "react";
import { fetchProducts } from "@/api/products";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import ServerProductGrid from "@/components/product/ServerProductGrid";
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
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 items-stretch">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
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

  // Fetch first 8 products server-side
  let initialProducts: any[] = [];
  try {
    const result = await fetchProducts(1, 8);
    initialProducts = result.items;
  } catch (error) {
    console.error("Failed to fetch initial products:", error);
  }

  return (
    <main className="min-h-screen pt-4 md:pt-6">
      {/* First 8 products rendered server-side */}
      <ServerProductGrid products={initialProducts} locale={locale} />

      {/* Remaining products loaded client-side */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ClientProductGrid initialProducts={initialProducts} />
      </Suspense>
    </main>
  );
}
