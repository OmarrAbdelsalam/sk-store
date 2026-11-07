"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2, Minus, Plus, Truck, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useActivePromotions } from "@/hooks/usePromotions";
import { formatAmount, toAmount } from "@/lib/price";
import { CART_DRAWER_OPEN_EVENT, isCartDrawerSuppressed } from "@/lib/cart-drawer";
import type { CartItem } from "@/lib/localStorage";

/**
 * Cart drawer (Prestige): slides in from the side — 80% of the screen on
 * phones, 440px on desktop — and opens by itself after every add to cart.
 * Header with count + ×, free-shipping progress, line items with a compact
 * stepper and a "Remove" link, then a pinned footer with the estimated total
 * and "Check out".
 */
export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [goingToCheckout, setGoingToCheckout] = useState(false);
  const { items, updateQuantity, removeFromCart, getTotalPrice, getSubtotal, bogoDiscount, freeShippingApplied } = useCart();
  const { data: activePromotions = [] } = useActivePromotions();
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const currency = isAr ? "ج.م" : "EGP";

  useEffect(() => {
    const show = () => setOpen(true);
    const onAdded = () => {
      if (!isCartDrawerSuppressed()) setOpen(true);
    };
    window.addEventListener(CART_DRAWER_OPEN_EVENT, show);
    window.addEventListener("cart-item-added", onAdded);
    return () => {
      window.removeEventListener(CART_DRAWER_OPEN_EVENT, show);
      window.removeEventListener("cart-item-added", onAdded);
    };
  }, []);

  useEffect(() => {
    if (!open) setGoingToCheckout(false);
  }, [open]);

  const itemCount = items.reduce((n, i) => n + (i.quantity || 0), 0);
  const subtotal = getSubtotal();
  const estimatedTotal = Math.max(0, getTotalPrice() - bogoDiscount);
  const threshold = activePromotions.find((p) => p.promo_type === "free_shipping_min_amount")?.min_amount ?? undefined;

  const goCheckout = () => {
    setGoingToCheckout(true);
    setOpen(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side={isAr ? "left" : "right"}
        hideClose
        dir={isAr ? "rtl" : "ltr"}
        className="flex w-[80vw] max-w-none flex-col gap-0 border-0 p-0 sm:w-[440px] sm:max-w-[440px]"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        {/* Header */}
        <div className="flex h-header-mobile shrink-0 items-center justify-between border-b border-gray-200 ps-5 pe-3 lg:h-header-desktop lg:ps-6">
          <SheetTitle className="font-display text-[20px] font-normal normal-case leading-none tracking-normal text-ink">
            {isAr ? "السلة" : "Cart"}
            {itemCount > 0 && <span className="ms-2 font-sans text-[14px] text-gray-500">({itemCount})</span>}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {isAr ? "المنتجات اللي في السلة" : "Items in your cart"}
          </SheetDescription>
          <SheetClose
            className="flex size-10 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            aria-label={isAr ? "إغلاق السلة" : "Close cart"}
          >
            <X className="size-5" strokeWidth={1.25} />
          </SheetClose>
        </div>

        {items.length === 0 ? (
          /* Empty */
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-[22px] leading-tight text-ink">
              {isAr ? "السلة فاضية" : "Your cart is empty"}
            </p>
            <Button asChild className="mt-6 h-12 px-8">
              <Link href="/products" onClick={() => setOpen(false)}>
                {isAr ? "تسوقي الكل" : "Shop all bags"}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            {threshold && !freeShippingApplied ? (
              <div className="shrink-0 border-b border-gray-200 px-5 py-4 lg:px-6">
                <p className="flex items-center gap-2 font-sans text-[13px] text-ink">
                  <Truck className="size-4 shrink-0" strokeWidth={1.25} />
                  {Math.max(threshold - subtotal, 0) > 0
                    ? isAr
                      ? `فاضل ${formatAmount(threshold - subtotal)} ج.م وتاخدي الشحن مجاني`
                      : `Spend ${formatAmount(threshold - subtotal)} EGP more for free shipping`
                    : isAr ? "الشحن مجاني على طلبك" : "You’ve unlocked free shipping"}
                </p>
                <div className="mt-2.5 h-[3px] w-full overflow-hidden bg-gray-200">
                  <div
                    className="h-full bg-ink transition-[width] duration-500"
                    style={{ width: `${Math.min((subtotal / threshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : freeShippingApplied ? (
              <p className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-beige px-5 py-3 font-sans text-[13px] text-ink lg:px-6">
                <Truck className="size-4 shrink-0" strokeWidth={1.25} />
                {isAr ? "مبروك! الشحن مجاني على طلبك" : "You’ve unlocked free shipping"}
              </p>
            ) : null}

            {/* Lines */}
            <ul className="flex-1 overflow-y-auto overscroll-contain px-5 lg:px-6">
              {items.map((item) => (
                <DrawerLine
                  key={item.id}
                  item={item}
                  isAr={isAr}
                  currency={currency}
                  onClose={() => setOpen(false)}
                  onQuantity={(q) => updateQuantity(item.id, q)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </ul>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-200 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 lg:px-6">
              {bogoDiscount > 0 && (
                <div className="mb-1 flex items-baseline justify-between font-sans text-[13px] text-ink">
                  <span>{isAr ? "اشتري 1 وخدي 1" : "Buy 1 get 1"}</span>
                  <span className="tabular-nums">−{formatAmount(bogoDiscount)} {currency}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between font-sans">
                <span className="text-[15px] text-ink">{isAr ? "الإجمالي التقديري" : "Estimated total"}</span>
                <span className="text-[18px] font-semibold tabular-nums text-ink">
                  {formatAmount(estimatedTotal)} <span className="text-[12px] font-normal text-gray-500">{currency}</span>
                </span>
              </div>
              <p className="mt-1.5 font-sans text-[12px] leading-4 text-gray-500">
                {isAr
                  ? "أكواد الخصم بتتحسب في صفحة الدفع. الشحن بيتدفع للمندوب عند الاستلام."
                  : "Discount codes are applied at checkout. Shipping is paid to the courier on delivery."}
              </p>
              <Button onClick={goCheckout} disabled={goingToCheckout} className="mt-4 h-12 w-full tracking-[0.16em]">
                {goingToCheckout ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : isAr ? "إتمام الشراء" : "Check out"}
              </Button>
              <SheetClose className="mt-3 block w-full text-center font-sans text-[13px] text-ink underline underline-offset-4 transition-opacity duration-fast hover:opacity-60">
                {isAr ? "كملي تسوق" : "Continue shopping"}
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerLine({
  item,
  isAr,
  currency,
  onClose,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  isAr: boolean;
  currency: string;
  onClose: () => void;
  onQuantity: (q: number) => Promise<boolean>;
  onRemove: () => void;
}) {
  const [maxed, setMaxed] = useState(false);
  const name = (isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr) || item.name;
  const color = (isAr ? item.colorNameAr || item.colorNameEn : item.colorNameEn || item.colorNameAr) || item.colorName;
  const variant = [color, item.sizeName].filter(Boolean).join(" / ");
  const unit = toAmount(item.price);
  const before = toAmount(item.beforePrice);
  const onSale = before > unit;
  const href = `/product/${item.productId}`;
  const canIncrease = !maxed && (item.availableStock === undefined || item.quantity < item.availableStock);

  return (
    <li className="flex gap-4 border-b border-gray-200 py-5 last:border-0">
      <Link href={href} onClick={onClose} tabIndex={-1} aria-hidden="true" className="w-[84px] shrink-0">
        <div className="ds-cutout-frame relative aspect-product w-full overflow-hidden">
          <Image src={item.image || "/SK_Logo.svg"} alt="" fill sizes="84px" className="ds-cutout object-center" />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={href}
            onClick={onClose}
            className="line-clamp-2 font-sans text-[14px] leading-5 text-ink underline-offset-4 hover:underline"
          >
            {name}
          </Link>
          <p className="shrink-0 text-end font-sans text-[14px] leading-5 tabular-nums text-ink">
            {formatAmount(unit * item.quantity)} <span className="text-[12px] text-gray-500">{currency}</span>
          </p>
        </div>

        <p className="mt-0.5 flex flex-wrap gap-x-2 font-sans text-[13px] leading-5">
          {onSale && <span className="whitespace-nowrap text-gray-500 line-through">{formatAmount(before)} {currency}</span>}
          <span className={`whitespace-nowrap ${onSale ? "text-accent-2" : "text-gray-500"}`}>
            {formatAmount(unit)} {currency}
          </span>
        </p>
        {variant && <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">{variant}</p>}

        <div className="mt-3 flex items-center gap-4">
          <div className="inline-flex h-10 w-[108px] items-center justify-between border border-gray-300">
            <button
              type="button"
              onClick={() => {
                if (item.quantity <= 1) return;
                setMaxed(false);
                onQuantity(item.quantity - 1);
              }}
              disabled={item.quantity <= 1}
              aria-label={isAr ? `تقليل كمية ${name}` : `Decrease quantity for ${name}`}
              className="flex h-full w-9 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus className="size-3.5" strokeWidth={1.5} />
            </button>
            <span aria-live="polite" className="select-none font-sans text-[14px] tabular-nums text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                if (!canIncrease) return;
                onQuantity(item.quantity + 1).then((ok) => !ok && setMaxed(true));
              }}
              disabled={!canIncrease}
              aria-label={isAr ? `زيادة كمية ${name}` : `Increase quantity for ${name}`}
              className="flex h-full w-9 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="font-sans text-[13px] text-gray-500 underline underline-offset-4 transition-colors duration-fast hover:text-ink"
          >
            {isAr ? "إزالة" : "Remove"}
          </button>
        </div>
        {maxed && (
          <p className="mt-2 font-sans text-[12px] text-gray-500">
            {isAr ? "دي كل الكمية المتاحة" : "That’s all we have in stock"}
          </p>
        )}
      </div>
    </li>
  );
}
