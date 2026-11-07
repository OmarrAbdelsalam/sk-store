"use client";

import { memo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import PromoCodeInput from "./PromoCodeInput";
import { formatAmount } from "@/lib/price";

interface CartItem {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: string;
  beforePrice?: string | number;
  quantity: number;
  image: string;
  colorName?: string;
  sizeName?: string;
}

type Discount = {
  amount: number;
  percentage: number;
  code: string;
  originalTotal: number;
  finalTotal: number;
};

const toNumber = (v: string | number | undefined) =>
  typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/** Only a compare-at price above what's being charged is a discount worth
 *  showing — anything else would strike through a price that never applied. */
function discountedFrom(price: string, beforePrice?: string | number) {
  const priceValue = toNumber(price);
  const beforeValue = toNumber(beforePrice);
  return beforeValue > priceValue ? beforeValue : null;
}

/**
 * What is charged online. Shipping is settled with the courier, never online,
 * so the total shown is the goods value — exactly what the pay button charges.
 */
export function payableNowOf({
  totalPrice,
  shippingPrice,
  discount,
  bogoDiscount = 0,
}: {
  totalPrice: number;
  shippingPrice: number;
  discount?: Discount | null;
  bogoDiscount?: number;
}) {
  const finalTotal = discount?.finalTotal
    ? discount.finalTotal + shippingPrice - bogoDiscount
    : totalPrice + shippingPrice - (discount?.amount || 0) - bogoDiscount;
  return Math.max(0, finalTotal - shippingPrice);
}

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  shippingPrice: number;
  /** A governorate has been chosen, so the shipping figure is real. */
  shippingKnown?: boolean;
  discount?: Discount | null;
  onDiscountChange?: (discount: Discount | null) => void;
  disabled?: boolean;
  phoneNumber?: string;
  freeShippingApplied?: boolean;
  bogoDiscount?: number;
}

/**
 * Shopify-checkout order summary: thumbnails with a quantity bubble, the
 * discount field, then the money lines and a large total.
 */
const CheckoutOrderSummary = memo(
  ({
    items,
    totalPrice,
    shippingPrice,
    shippingKnown = false,
    discount,
    onDiscountChange,
    disabled = false,
    phoneNumber,
    freeShippingApplied = false,
    bogoDiscount = 0,
  }: CheckoutOrderSummaryProps) => {
    const t = useTranslations("CheckoutSummary");
    const tPromo = useTranslations("PromoCode");
    const locale = useLocale();
    const isAr = locale === "ar";
    const currency = isAr ? "ج.م" : "EGP";

    const money = formatAmount;

    const payableNow = payableNowOf({ totalPrice, shippingPrice, discount, bogoDiscount });
    const itemCount = items.reduce((n, i) => n + (i.quantity || 0), 0);

    return (
      <div className="font-sans text-ink">
        <h2 className="sr-only">{t("title")}</h2>

        {/* Line items */}
        <ul className="space-y-4">
          {items.map((item) => {
            const name = (isAr ? item.nameAr : item.nameEn) || item.name;
            const unit = toNumber(item.price);
            const before = discountedFrom(item.price, item.beforePrice);
            const variant = [item.colorName, item.sizeName].filter(Boolean).join(" / ");
            return (
              <li key={item.id} className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="ds-cutout-frame relative size-16 overflow-hidden border border-gray-200">
                    <Image
                      src={item.image || "/SK_Logo.svg"}
                      alt={name}
                      fill
                      sizes="64px"
                      className="ds-cutout object-center"
                    />
                  </div>
                  <span
                    aria-label={`${t("quantity")} ${item.quantity}`}
                    className="absolute -end-2 -top-2 z-10 flex h-[21px] min-w-[21px] items-center justify-center rounded-full bg-gray-600 px-1.5 text-[12px] font-semibold leading-none text-white"
                  >
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[14px] leading-5">{name}</p>
                  {variant && <p className="mt-0.5 text-[12px] leading-4 text-gray-500">{variant}</p>}
                </div>
                <div className="shrink-0 text-end text-[14px] leading-5 tabular-nums">
                  {before && (
                    <p className="text-[12px] text-gray-500 line-through">
                      {money(before * item.quantity)} {currency}
                    </p>
                  )}
                  <p>
                    {money(unit * item.quantity)} {currency}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Discount code */}
        <div className="mt-6">
          <PromoCodeInput
            onDiscountApplied={(d) => onDiscountChange?.(d)}
            onDiscountRemoved={() => onDiscountChange?.(null)}
            appliedDiscount={discount}
            disabled={disabled}
            phoneNumber={phoneNumber}
          />
        </div>

        {/* Money lines */}
        <dl className="mt-6 space-y-2 text-[14px] leading-5">
          <div className="flex items-center justify-between gap-4">
            <dt>
              {t("subtotal")}
              <span className="text-gray-500">
                {" "}· {itemCount} {isAr ? (itemCount === 1 ? "منتج" : "منتجات") : itemCount === 1 ? "item" : "items"}
              </span>
            </dt>
            <dd className="tabular-nums">
              {money(totalPrice)} {currency}
            </dd>
          </div>

          {discount && (
            <div className="flex items-center justify-between gap-4">
              <dt>
                {tPromo("discount")}
                <span className="ms-2 inline-flex items-center bg-gray-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]">
                  {discount.code}
                </span>
              </dt>
              <dd className="tabular-nums">
                −{money(discount.amount)} {currency}
              </dd>
            </div>
          )}

          {bogoDiscount > 0 && (
            <div className="flex items-center justify-between gap-4">
              <dt>{isAr ? "خصم اشتري 1 واحصل على 1" : "Buy 1 get 1"}</dt>
              <dd className="tabular-nums">
                −{money(bogoDiscount)} {currency}
              </dd>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <dt>{t("shipping")}</dt>
            <dd className="text-end">
              {freeShippingApplied ? (
                <span className="font-semibold">{isAr ? "مجاني" : "Free"}</span>
              ) : shippingKnown && shippingPrice > 0 ? (
                <>
                  <span className="tabular-nums">
                    {money(shippingPrice)} {currency}
                  </span>
                  <span className="block text-[12px] leading-4 text-gray-500">
                    {isAr ? "يُدفع للمندوب عند الاستلام" : "Paid to the courier on delivery"}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">{isAr ? "اكتبي عنوان الشحن" : "Enter shipping address"}</span>
              )}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4 pt-3">
            <dt className="text-[19px] font-semibold leading-7">{isAr ? "الإجمالي" : "Total"}</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-[12px] text-gray-500">{currency}</span>
              <span className="text-[19px] font-semibold leading-7 tabular-nums">{money(payableNow)}</span>
            </dd>
          </div>
        </dl>
      </div>
    );
  }
);

CheckoutOrderSummary.displayName = "CheckoutOrderSummary";
export default CheckoutOrderSummary;
