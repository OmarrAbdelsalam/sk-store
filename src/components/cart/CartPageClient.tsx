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
      {/* Page Title & Free Shipping Banner */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">{t("title")}</h1>
          <div className="h-px w-12 bg-foreground mt-3" />
        </div>

        {/* Prominent Free Shipping Success Banner */}
        {freeShippingApplied && (
          <div className="w-full bg-emerald-900 text-emerald-50 py-3 px-4 flex flex-col sm:flex-row items-center justify-center text-center animate-fade-in shadow-sm">
            <div className="flex items-center gap-2 font-medium tracking-[0.1em] uppercase text-xs sm:text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-emerald-300">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
              </svg>
              <span>{isAr ? "لقد حصلت عليها! الشحن المجاني لك" : "YOU GOT IT! FREE SHIPPING UNLOCKED"}</span>
            </div>
            <span className="hidden sm:inline-block text-emerald-500/50 mx-2 sm:mx-3">•</span>
            <span className="font-light text-xs sm:text-sm text-emerald-50/80 tracking-wide mt-1 sm:mt-0">
              {isAr ? "أكمل طلبك الآن للاستفادة من العرض" : "Complete your order now to claim this offer"}
            </span>
          </div>
        )}
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
