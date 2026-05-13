"use client";
import { memo, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Gift, Truck } from "lucide-react";
import OrderSummaryActions from "./OrderSummaryActions";

type OrderSummaryProps = {
  totalItemsFallback: number;
  totalPriceFallback: number;
  shippingPrice?: number;
  currency?: string;
  discount?: {
    amount: number;
    percentage: number;
    code: string;
  } | null;
  onCheckoutClick?: () => void;
  bogoDiscount?: number;
  freeShippingApplied?: boolean;
  freeShippingThreshold?: number;
  subtotal?: number;
};

const OrderSummary = memo(
  ({
    totalItemsFallback,
    totalPriceFallback,
    shippingPrice = 0,
    currency = "EGP",
    discount,
    onCheckoutClick,
    bogoDiscount = 0,
    freeShippingApplied = false,
    freeShippingThreshold,
    subtotal,
  }: OrderSummaryProps) => {
    const t = useTranslations("OrderSummary");
    const locale = useLocale();
    const dir = locale === "ar" ? "rtl" : "ltr";
    const isAr = locale === "ar";

    const effectiveSubtotal = subtotal ?? totalPriceFallback;
    const effectiveShipping = freeShippingApplied ? 0 : shippingPrice;

    const total = useMemo(
      () => totalPriceFallback + effectiveShipping - (discount?.amount || 0) - bogoDiscount,
      [totalPriceFallback, effectiveShipping, discount?.amount, bogoDiscount]
    );

    return (
      <div dir={dir} className="lg:sticky lg:top-8">
        <div className="border border-border">
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-border">
            <h2 className="text-xs sm:text-sm font-medium tracking-widest uppercase">
              Order Summary
            </h2>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* BOGO Banner */}
            {bogoDiscount > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-100 border border-emerald-300 text-emerald-900">
                <Gift className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium tracking-wide">
                  {isAr
                    ? `اشتري 1 واحصل على 1 مجاناً — وفّرت ${bogoDiscount} جنيه`
                    : `Buy 1 Get 1 Free — You saved ${bogoDiscount} EGP`}
                </span>
              </div>
            )}



            {/* BOGO Discount Line */}
            {bogoDiscount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-700">
                <span className="tracking-wider uppercase">
                  {isAr ? "خصم اشتري 1 واحصل على 1" : "BOGO Discount"}
                </span>
                <span>-{bogoDiscount} {currency}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium tracking-wider uppercase">
                {t("total")}
              </span>
              <span className="text-xl sm:text-2xl font-light tracking-wider">
                {Math.max(0, total).toLocaleString()} <span className="text-xs tracking-wider uppercase">{currency}</span>
              </span>
            </div>

            {/* Actions */}
            <OrderSummaryActions onCheckoutClick={onCheckoutClick} />
          </div>
        </div>
      </div>
    );
  }
);

OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
