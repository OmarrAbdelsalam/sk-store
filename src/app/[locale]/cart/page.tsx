import { Suspense } from "react";
import { CartSkeleton } from "@/components/skeletons";
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
      <div className="mx-auto max-w-6xl px-gutter py-8 sm:py-section lg:px-gutter-lg">
        <Suspense fallback={<CartSkeleton />}>
          <CartPageClient />
        </Suspense>
      </div>
    </div>
  );
}
