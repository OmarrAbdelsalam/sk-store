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
    <div dir={dir} className="animate-fade-in pb-20 lg:pb-0">
      {/* Page Title & Free Shipping Progress */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">{t("title")}</h1>
          <div className="h-px w-12 bg-foreground mt-3" />
        </div>

        {/* Free Shipping Progress Bar */}
        {freeShippingThreshold && !freeShippingApplied && (() => {
          const subtotal = getSubtotal();
          const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
          const remaining = Math.max(freeShippingThreshold - subtotal, 0);
          return (
            <div className="w-full border border-border/60 px-4 py-3 space-y-2 rounded-[24px]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                <span>
                  {isAr
                    ? `أضف ${remaining} جنيه للشحن المجاني`
                    : `Add ${remaining} EGP more for free shipping`}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Prominent Free Shipping Success Banner */}
        {freeShippingApplied && (
          <div className="w-full bg-emerald-900 text-emerald-50 py-3 px-4 flex flex-col sm:flex-row items-center justify-center text-center animate-fade-in shadow-sm rounded-[24px]">
            <div className="flex items-center gap-2 font-medium tracking-[0.1em] uppercase text-xs sm:text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-emerald-300">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
              </svg>
              <span>{isAr ? "لقد حصلت عليها! الشحن المجاني لك" : "YOU GOT IT! FREE SHIPPING UNLOCKED"}</span>
            </div>
            <span className="font-light text-xs sm:text-sm text-emerald-50/80 tracking-wide mt-1 sm:mt-0 sm:ml-3">
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
        </div>

        {/* Order Summary - Desktop only */}
        <div className="hidden lg:block lg:col-span-5">
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

      {/* Upsell Section - Full width below cart and order summary */}
      <Suspense fallback={null}>
        <CartUpsell />
      </Suspense>

      {/* Mobile Sticky Bottom Bar - Total + Checkout */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 pt-3 pb-5 lg:hidden shadow-[0_-8px_20px_rgba(0,0,0,0.06)]" dir={dir}>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            {isAr ? 'الإجمالي' : 'Total'}
          </span>
          <span className="text-base font-semibold tracking-wider">
            {Math.max(0, getTotalPrice() - bogoDiscount).toLocaleString()} <span className="text-xs uppercase">EGP</span>
          </span>
        </div>
        <button
          className="w-full h-10 rounded-full bg-black hover:bg-black text-white text-xs font-medium tracking-widest uppercase
            transition-all duration-300 hover:scale-[1.02] shadow-md border border-white/10
            inline-flex items-center justify-center gap-2"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            router.push(`/${locale}/checkout`);
          }}
        >
          {isAr ? 'إتمام الشراء' : 'PROCEED TO CHECKOUT'}
        </button>
      </div>
    </div>
  );
}
