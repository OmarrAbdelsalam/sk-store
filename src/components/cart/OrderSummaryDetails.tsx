import { useTranslations, useLocale } from "next-intl";
import { useMemo } from "react";
import { Package, Truck, Tag, Receipt } from "lucide-react";

interface OrderSummaryDetailsProps {
  items: number;
  subtotal: number;
  total: number;
  currency?: string;
  discount?: {
    amount: number;
    percentage: number;
    code: string;
  } | null;
}

export default function OrderSummaryDetails({ 
  items, 
  subtotal, 
  total, 
  currency = "EGP",
  discount 
}: OrderSummaryDetailsProps) {
  const t = useTranslations("OrderSummary");
  const tPromo = useTranslations("PromoCode");
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
    <div className="space-y-4">
      {/* عدد المنتجات */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>{t("itemsCount", { count: items })}</span>
        </div>
        <span className="font-medium">
          {nf.format(subtotal)} {currency}
        </span>
      </div>

      {/* الشحن */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Truck className="w-4 h-4" />
          <span>{t("shipping")}</span>
        </div>
        <span className="text-sm text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
          {t("shippingNote")}
        </span>
      </div>

      {/* الخصم */}
      {discount && (
        <div className="flex items-center justify-between py-2 bg-green-50 dark:bg-green-950/20 
          -mx-2 px-2 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Tag className="w-4 h-4" />
            <span>{tPromo("discount")} ({discount.percentage}%)</span>
          </div>
          <span className="font-medium text-green-600 dark:text-green-400">
            -{nf.format(discount.amount)} {currency}
          </span>
        </div>
      )}

      {/* الإجمالي */}
      <div className="border-t-2 border-dashed border-border/50 pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">{t("total")}</span>
          </div>
          <div className="text-end">
            <span className="text-2xl font-bold text-primary">
              {nf.format(total)}
            </span>
            <span className="text-sm text-muted-foreground ms-1">{currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
