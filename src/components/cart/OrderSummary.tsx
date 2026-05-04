"use client";
import { memo, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
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
};

const OrderSummary = memo(
  ({
    totalItemsFallback,
    totalPriceFallback,
    shippingPrice = 0,
    currency = "EGP",
    discount,
    onCheckoutClick,
  }: OrderSummaryProps) => {
    const t = useTranslations("OrderSummary");
    const locale = useLocale();
    const dir = locale === "ar" ? "rtl" : "ltr";

    const total = useMemo(
      () => totalPriceFallback + shippingPrice - (discount?.amount || 0),
      [totalPriceFallback, shippingPrice, discount?.amount]
    );

    return (
      <div dir={dir} className="space-y-6">
        {/* Total Only */}
        <div className="flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-lg font-bold text-foreground">
            {t("total")}
          </span>
          <span className="text-2xl font-bold text-foreground">
            {total.toLocaleString()} <span className="text-base">{currency}</span>
          </span>
        </div>

        {/* Actions */}
        <OrderSummaryActions onCheckoutClick={onCheckoutClick} />
      </div>
    );
  }
);

OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
