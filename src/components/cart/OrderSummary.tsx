"use client";
import { memo, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import OrderSummaryDetails from "./OrderSummaryDetails";
import OrderSummaryActions from "./OrderSummaryActions";
import { ShoppingBag } from "lucide-react";

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
};

const OrderSummary = memo(
  ({
    totalItemsFallback,
    totalPriceFallback,
    shippingPrice = 0,
    currency = "EGP",
    discount,
  }: OrderSummaryProps) => {
    const t = useTranslations("OrderSummary");
    const locale = useLocale();
    const dir = locale === "ar" ? "rtl" : "ltr";

    const total = useMemo(
      () => totalPriceFallback + shippingPrice - (discount?.amount || 0),
      [totalPriceFallback, shippingPrice, discount?.amount]
    );

    return (
      <div className="sticky top-[100px]" dir={dir}>
        {/* كارد ملخص الطلب */}
        <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">{t("title")}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <OrderSummaryDetails
              items={totalItemsFallback}
              subtotal={totalPriceFallback}
              total={total}
              currency={currency}
              discount={discount}
            />

            <OrderSummaryActions />
          </div>
        </div>
      </div>
    );
  }
);

OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
