"use client";

import { CreditCard } from "lucide-react";
import { memo } from "react";
import { useTranslations, useLocale } from "next-intl";
import PromoCodeInput from "./PromoCodeInput";
import Image from "next/image";

interface CartItem {
  id: string | number;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: string;
  quantity: number;
  image: string;
}
interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  shippingPrice: number;
  discount?: { 
    amount: number; 
    percentage: number; 
    code: string;
    originalTotal: number;
    finalTotal: number;
  } | null;
  onDiscountChange?: (discount: { 
    amount: number; 
    percentage: number; 
    code: string;
    originalTotal: number;
    finalTotal: number;
  } | null) => void;
  disabled?: boolean;
  phoneNumber?: string;
  freeShippingApplied?: boolean;
  bogoDiscount?: number;
}

const CheckoutOrderSummary = memo(({ 
  items, 
  totalPrice, 
  shippingPrice, 
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
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  // استخدم finalTotal من API إذا كان متوفر، وإلا احسبه يدوياً
  const finalTotal = discount?.finalTotal 
    ? discount.finalTotal + shippingPrice - bogoDiscount
    : totalPrice + shippingPrice - (discount?.amount || 0) - bogoDiscount;

  return (
    <div className="sticky top-24" dir={dir}>
      <div className="bg-[#F0EBE3]/50 rounded-[32px] p-6 sm:p-8 border border-[#d4c9bc] shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-medium tracking-widest uppercase">{t("title")}</h2>
          <span className="text-xs text-muted-foreground tracking-wider">
            {items.length} {isAr ? "منتج" : "items"}
          </span>
        </div>

        <div className="space-y-6">
          {/* Product List */}
          <div className="space-y-4 max-h-72 overflow-y-auto scrollbar-hide">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                <div className="relative w-16 h-20 bg-muted overflow-hidden flex-shrink-0 rounded-lg">
                  <Image
                    src={item.image || "/SK_Logo.svg"}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("quantity")}: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium whitespace-nowrap self-center">{item.price}</p>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="pt-4 border-t border-border">
            <PromoCodeInput
              onDiscountApplied={(discountData) => onDiscountChange?.(discountData)}
              onDiscountRemoved={() => onDiscountChange?.(null)}
              appliedDiscount={discount}
              disabled={disabled}
              phoneNumber={phoneNumber}
            />
          </div>

          {/* Price Summary */}
          <div className="pt-4 border-t border-border space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider uppercase text-muted-foreground">{t("subtotal")}</span>
              <span className="text-sm font-medium">{totalPrice.toFixed(2)} {t("currency")}</span>
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider uppercase text-muted-foreground">{t("shipping")}</span>
              {freeShippingApplied ? (
                <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
                  {isAr ? "مجاني" : "FREE"}
                </span>
              ) : shippingPrice > 0 ? (
                <span className="text-sm font-medium">{shippingPrice} {t("currency")}</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t("shippingNote")}
                </span>
              )}
            </div>

            {/* Discount */}
            {discount && (
              <div className="flex items-center justify-between py-2">
                <span className="text-xs tracking-wider uppercase text-muted-foreground">
                  {tPromo("discount")} ({discount.percentage}%)
                </span>
                <span className="text-sm font-medium">
                  -{discount.amount.toFixed(2)} {t("currency")}
                </span>
              </div>
            )}

            {/* BOGO Discount */}
            {bogoDiscount > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-xs tracking-wider uppercase text-emerald-700">
                  {isAr ? "خصم اشتري 1 واحصل على 1" : "BOGO Discount"}
                </span>
                <span className="text-sm font-medium text-emerald-700">
                  -{bogoDiscount.toFixed(2)} {t("currency")}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-foreground pt-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium tracking-wider uppercase">{t("total")}</span>
                <div className="text-end">
                  <span className="text-xl sm:text-2xl font-light tracking-wider">
                    {finalTotal.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1.5 tracking-wider uppercase">{t("currency")}</span>
                </div>
              </div>
            </div>

            {/* Payment method note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground tracking-wider uppercase pt-2">
              <CreditCard className="h-3.5 w-3.5" />
              <span>{isAr ? "الدفع أونلاين" : "Online Payment"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CheckoutOrderSummary.displayName = "CheckoutOrderSummary";
export default CheckoutOrderSummary;
