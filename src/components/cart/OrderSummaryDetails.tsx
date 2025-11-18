import { useTranslations, useLocale } from "next-intl";
import { useMemo } from "react";

interface OrderSummaryDetailsProps {
  items: number;
  subtotal: number;
  total: number;
  currency?: string;
}

export default function OrderSummaryDetails({ 
  items, 
  subtotal, 
  total, 
  currency = "EGP" 
}: OrderSummaryDetailsProps) {
  const t = useTranslations("OrderSummary");
  const locale = useLocale();

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>{t("itemsCount", { count: items })}</span>
        <span>
          {nf.format(subtotal)} {currency}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>{t("shipping")}</span>
          <span className="text-muted-foreground text-sm">
            {t("shippingNote")}
          </span>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between font-semibold text-lg">
          <span>{t("total")}</span>
          <span>
            {nf.format(total)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
