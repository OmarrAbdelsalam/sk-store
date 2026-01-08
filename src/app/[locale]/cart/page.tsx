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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-2 sm:py-8">
        <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-8">
            <div className="lg:col-span-2 space-y-2 sm:space-y-4">
              <Skeleton className="h-7 sm:h-10 w-36 sm:w-48 mb-3 sm:mb-6" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 sm:h-32 w-full" />
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-72 sm:h-96 w-full" />
            </div>
          </div>
        }>
          <CartPageClient />
        </Suspense>
      </div>
    </div>
  );
}
