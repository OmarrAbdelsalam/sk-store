"use client";
import { useCart } from "@/hooks/useCart";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useActivePromotions } from "@/hooks/usePromotions";

const CartItem = lazy(() => import("@/components/cart/CartItem"));
const EmptyCart = lazy(() => import("@/components/cart/EmptyCart"));
const OrderSummary = lazy(() => import("@/components/cart/OrderSummary"));
const CartUpsell = lazy(() => import("@/components/cart/CartUpsell"));

// Skeleton للكارت وقت التحميل
function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-px w-full bg-border" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-border p-5">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-28 sm:w-28 sm:h-32" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="border border-border">
          <Skeleton className="h-12 w-full" />
          <div className="p-5 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPageClient() {
  const { items, isLoading, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, getSubtotal, bogoDiscount, freeShippingApplied } = useCart();
  const { data: activePromotions = [] } = useActivePromotions();
  const freeShippingPromo = activePromotions.find(p => p.promo_type === 'free_shipping_min_amount');
  const freeShippingThreshold = freeShippingPromo?.min_amount ?? undefined;
  const t = useTranslations("Cart");
  const tOrderSummary = useTranslations("OrderSummary");
  const locale = useLocale();
  const router = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  // عرض skeleton وقت التحميل
  if (isLoading) {
    return (
      <div dir={dir}>
        <CartSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <EmptyCart />
      </Suspense>
    );
  }

  return (
    <div dir={dir} className="animate-fade-in">
      {/* Page Title */}
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">{t("title")}</h1>
        <div className="h-px w-12 bg-foreground mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
        {/* Products List */}
        <div className="lg:col-span-7">
          <div className="space-y-0">
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            }>
              {items.map((item, index) => (
                <div 
                  key={item.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CartItem
                    item={{ ...item, itemId: item.id }}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    maxQuantity={item.availableStock}
                  />
                </div>
              ))}
            </Suspense>
          </div>

          {/* Upsell Section */}
          <Suspense fallback={null}>
            <CartUpsell />
          </Suspense>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <OrderSummary
              totalItemsFallback={getTotalItems()}
              totalPriceFallback={getTotalPrice()}
              bogoDiscount={bogoDiscount}
              freeShippingApplied={freeShippingApplied}
              freeShippingThreshold={freeShippingThreshold}
              subtotal={getSubtotal()}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
