"use client";
import { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale, useTranslations } from "next-intl";
import OrderSummaryDetails from "./OrderSummaryDetails";
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
};

const OrderSummary = memo(({
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
    <Card className="sticky top-8" dir={dir}>
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>

        <OrderSummaryDetails
          items={totalItemsFallback}
          subtotal={totalPriceFallback}
          total={total}
          currency={currency}
          discount={discount}
        />

        <OrderSummaryActions />
      </CardContent>
    </Card>
  );
});

OrderSummary.displayName = "OrderSummary";

export default OrderSummary;
