"use client";
import { useCart } from "@/hooks/useCart";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";

const CartItem = lazy(() => import("@/components/cart/CartItem"));
const EmptyCart = lazy(() => import("@/components/cart/EmptyCart"));
const OrderSummary = lazy(() => import("@/components/cart/OrderSummary"));

// Skeleton للكارت وقت التحميل
function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex gap-4 sm:gap-6">
                <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden">
          <Skeleton className="h-16 w-full" />
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPageClient() {
  const { items, isLoading, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
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
        <Skeleton className="h-10 w-40 mb-8" />
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
      {/* زر الرجوع */}
      <Button 
        variant="ghost" 
        onClick={() => router.push(`/${locale}`)} 
        className="mb-2 sm:mb-6 hover:bg-secondary/50 rounded-xl group" 
        aria-label={tOrderSummary("continueShopping")}
      >
        {isAr ? (
          <ArrowRight className="h-4 w-4 me-2 group-hover:translate-x-1 transition-transform" />
        ) : (
          <ArrowLeft className="h-4 w-4 me-2 group-hover:-translate-x-1 transition-transform" />
        )}
        {tOrderSummary("continueShopping")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        {/* قائمة المنتجات */}
        <div className="lg:col-span-2">
          {/* العنوان مع عدد المنتجات */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">{t("title")}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getTotalItems()} {isAr ? "منتج" : "items"}
              </p>
            </div>
          </div>

          {/* المنتجات */}
          <div className="space-y-2 sm:space-y-4">
            <Suspense fallback={
              <div className="space-y-2 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-36 sm:h-40 w-full rounded-2xl" />
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

        {/* ملخص الطلب */}
        <div className="lg:col-span-1">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
            <OrderSummary
              totalItemsFallback={getTotalItems()}
              totalPriceFallback={getTotalPrice()}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
