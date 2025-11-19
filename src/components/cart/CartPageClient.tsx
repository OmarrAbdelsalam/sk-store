"use client";
import { useCart } from "@/hooks/useCart";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useLocale } from "next-intl";

const CartItem = lazy(() => import("@/components/cart/CartItem"));
const EmptyCart = lazy(() => import("@/components/cart/EmptyCart"));
const OrderSummary = lazy(() => import("@/components/cart/OrderSummary"));

export default function CartPageClient() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const t = useTranslations("Cart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  if (items.length === 0) {
    return (
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <EmptyCart />
      </Suspense>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" dir={dir}>
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
        <div className="space-y-4">
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          }>
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </Suspense>
        </div>
      </div>

      <div className="lg:col-span-1">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <OrderSummary
            totalItemsFallback={getTotalItems()}
            totalPriceFallback={getTotalPrice()}
          />
        </Suspense>
      </div>
    </div>
  );
}
