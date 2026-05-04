import ProductGrid from "@/components/ProductGrid";
import { Suspense } from "react";

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

export default function ProductsPage() {
  return (
    <main className="min-h-screen pt-4 md:pt-6">
      <Suspense fallback={<ProductGridSkeleton />}>
        {/* We can pass a prop to ProductGrid to indicate it's the full page if needed */}
        <ProductGrid isFullPage={true} />
      </Suspense>
    </main>
  );
}
