"use client";
import { useCart } from "@/hooks/useCart";
import { lazy, Suspense, useState } from "react";
import Link from "next/link";
import { Loader2, Truck } from "lucide-react";
import { CartSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useActivePromotions } from "@/hooks/usePromotions";
import { AcceptedPaymentBrands } from "@/components/checkout/PaymentBrands";
import CartItem from "@/components/cart/CartItem";
import { formatAmount } from "@/lib/price";

const CartUpsell = lazy(() => import("@/components/cart/CartUpsell"));

/**
 * Cart page in the Shopify (Dawn) layout: "Your cart" + continue shopping,
 * a Product / Quantity / Total table, then a right-aligned estimated total
 * with the checkout button. Phones get a sticky total + checkout bar.
 */
export default function CartPageClient() {
  const { items, isLoading, removeFromCart, updateQuantity, getTotalPrice, getSubtotal, bogoDiscount, freeShippingApplied } = useCart();
  const { data: activePromotions = [] } = useActivePromotions();
  const freeShippingPromo = activePromotions.find((p) => p.promo_type === "free_shipping_min_amount");
  const freeShippingThreshold = freeShippingPromo?.min_amount ?? undefined;
  const locale = useLocale();
  const router = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const currency = isAr ? "ج.م" : "EGP";
  const [goingToCheckout, setGoingToCheckout] = useState(false);

  if (isLoading) {
    return (
      <div dir={dir}>
        <CartSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div dir={dir} className="flex flex-col items-center py-16 text-center sm:py-24" aria-live="polite">
        <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">
          {isAr ? "السلة فاضية" : "Your cart is empty"}
        </h1>
        <Button asChild className="mt-8 h-12 px-10">
          <Link href="/products">{isAr ? "كملي تسوق" : "Continue shopping"}</Link>
        </Button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const estimatedTotal = Math.max(0, getTotalPrice() - bogoDiscount);
  const itemCount = items.reduce((n, i) => n + (i.quantity || 0), 0);

  const goCheckout = () => {
    setGoingToCheckout(true);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.push(`/checkout`);
  };

  return (
    <>
    <div dir={dir} className="animate-fade-in pb-32 md:pb-0">
      {/* Title row */}
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">
          {isAr ? "سلة التسوق" : "Your cart"}
        </h1>
        <Link
          href="/products"
          className="shrink-0 pb-1 font-sans text-[14px] text-ink underline underline-offset-4 transition-opacity duration-fast hover:opacity-60"
        >
          {isAr ? "كملي تسوق" : "Continue shopping"}
        </Link>
      </div>

      {/* Free shipping progress (Prestige) */}
      {freeShippingThreshold && !freeShippingApplied && (() => {
        const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
        const remaining = Math.max(freeShippingThreshold - subtotal, 0);
        return (
          <div className="mt-6">
            <p className="flex items-center gap-2 font-sans text-[14px] text-ink">
              <Truck className="size-4 shrink-0" strokeWidth={1.25} />
              {isAr
                ? `فاضل ${formatAmount(remaining)} ج.م وتاخدي الشحن مجاني`
                : `Spend ${formatAmount(remaining)} EGP more for free shipping`}
            </p>
            <div className="mt-2.5 h-[3px] w-full overflow-hidden bg-gray-200">
              <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })()}
      {freeShippingApplied && (
        <p className="mt-6 flex items-center gap-2 bg-beige px-4 py-3 font-sans text-[14px] text-ink">
          <Truck className="size-4 shrink-0" strokeWidth={1.25} />
          {isAr ? "مبروك! الشحن مجاني على طلبك" : "You’ve unlocked free shipping"}
        </p>
      )}

      {/* Table head */}
      <div className="mt-8 grid grid-cols-1 border-b border-gray-200 pb-3 font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500 md:grid-cols-[minmax(0,1fr)_200px_140px] md:gap-x-6">
        <span>{isAr ? "المنتج" : "Product"}</span>
        <span className="hidden md:block">{isAr ? "الكمية" : "Quantity"}</span>
        <span className="hidden text-end md:block">{isAr ? "الإجمالي" : "Total"}</span>
      </div>

      <ul>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={{ ...item, itemId: item.id }}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            maxQuantity={item.availableStock}
          />
        ))}
      </ul>

      {/* Totals + checkout, right-aligned (Dawn cart footer) */}
      <div className="mt-8 flex justify-end">
        <div className="w-full md:max-w-[380px]">
          <dl className="space-y-2 font-sans">
            {bogoDiscount > 0 && (
              <>
                <div className="flex items-baseline justify-between gap-4 text-[14px] text-ink">
                  <dt>{isAr ? "المجموع الفرعي" : "Subtotal"}</dt>
                  <dd className="tabular-nums">
                    {formatAmount(subtotal)} {currency}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 text-[14px] text-ink">
                  <dt>{isAr ? "اشتري 1 وخدي 1" : "Buy 1 get 1"}</dt>
                  <dd className="tabular-nums">
                    −{formatAmount(bogoDiscount)} {currency}
                  </dd>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[16px] text-ink">
                {isAr ? "الإجمالي التقديري" : "Estimated total"}
                <span className="ms-1.5 text-[13px] text-gray-500">
                  ({itemCount} {isAr ? (itemCount === 1 ? "منتج" : "منتجات") : itemCount === 1 ? "item" : "items"})
                </span>
              </dt>
              <dd className="text-[19px] font-semibold tabular-nums text-ink">
                {formatAmount(estimatedTotal)} <span className="text-[13px] font-normal text-gray-500">{currency}</span>
              </dd>
            </div>
          </dl>
          <p className="mt-2 font-sans text-[13px] leading-5 text-gray-500 md:text-end">
            {isAr
              ? "أكواد الخصم بتتحسب في صفحة الدفع. الشحن بيتدفع للمندوب عند الاستلام."
              : "Discount codes are applied at checkout. Shipping is paid to the courier on delivery."}
          </p>

          <Button onClick={goCheckout} disabled={goingToCheckout} className="mt-5 hidden h-[52px] w-full tracking-[0.16em] md:flex">
            {goingToCheckout ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : isAr ? "إتمام الشراء" : "Check out"}
          </Button>

          <div className="mt-4 hidden justify-center md:flex md:justify-end">
            <AcceptedPaymentBrands isAr={isAr} />
          </div>
          <p className="mt-3 font-sans text-[12px] leading-4 text-gray-500 md:text-end">
            {isAr ? "كل شنطة بتتعمل يدوي لطلبك — بتوصل خلال 7-10 أيام." : "Every bag is handmade to order — delivered in 7–10 days."}
          </p>
        </div>
      </div>

      {/* You might also like */}
      <Suspense fallback={null}>
        <CartUpsell />
      </Suspense>
    </div>

      {/* Phone: sticky total + checkout. Kept OUTSIDE the fade-in wrapper:
          that animation leaves a transform on it, and a transformed parent
          pins a position:fixed child to itself instead of the screen — the
          bar ended up at the very bottom of the page instead of on screen. */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-background px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
        dir={dir}
      >
        <div className="mb-3 flex items-baseline justify-between font-sans">
          <span className="text-[14px] text-ink">{isAr ? "الإجمالي التقديري" : "Estimated total"}</span>
          <span className="text-[17px] font-semibold tabular-nums text-ink">
            {formatAmount(estimatedTotal)} <span className="text-[12px] font-normal text-gray-500">{currency}</span>
          </span>
        </div>
        <Button onClick={goCheckout} disabled={goingToCheckout} className="h-12 w-full tracking-[0.16em]">
          {goingToCheckout ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : isAr ? "إتمام الشراء" : "Check out"}
        </Button>
      </div>
    </>
  );
}
