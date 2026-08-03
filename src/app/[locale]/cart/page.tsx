import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CartPageClient from "@/components/cart/CartPageClient";
import CartRestorer from "@/components/cart/CartRestorer";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return generatePageMetadata({
    title: isAr ? "سلة التسوق" : "Shopping Cart",
    description: isAr
      ? "عرض وإدارة شنط SK Bags المختارة قبل إتمام الطلب والتوصيل لأي مكان في مصر."
      : "Review and manage your selected SK Bags handmade bags before checkout and delivery across Egypt.",
    path: "/cart",
    locale,
  });
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Rebuilds the basket when someone arrives from a reminder email.
          Inside Suspense because it reads search params. */}
      <Suspense fallback={null}>
        <CartRestorer />
      </Suspense>
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
