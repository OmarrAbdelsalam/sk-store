import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CartPageClient from "@/components/cart/CartPageClient";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "سلة التسوق",
  description: "عرض وإدارة منتجات سلة التسوق الخاصة بك - HouseScrub",
  path: "/cart",
});

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Suspense fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted" />
            <div className="h-px w-full bg-border" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-7 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
              <div className="lg:col-span-5">
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        }>
          <CartPageClient />
        </Suspense>
      </div>
    </div>
  );
}
