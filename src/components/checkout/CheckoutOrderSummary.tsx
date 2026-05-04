"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Package, ShoppingBag, Truck, Tag, Receipt } from "lucide-react";
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
}

const CheckoutOrderSummary = memo(({ 
  items, 
  totalPrice, 
  shippingPrice, 
  discount, 
  onDiscountChange,
  disabled = false 
}: CheckoutOrderSummaryProps) => {
  const t = useTranslations("CheckoutSummary");
  const tPromo = useTranslations("PromoCode");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  // استخدم finalTotal من API إذا كان متوفر، وإلا احسبه يدوياً
  const finalTotal = discount?.finalTotal 
    ? discount.finalTotal + shippingPrice 
    : totalPrice + shippingPrice - (discount?.amount || 0);

  return (
    <div className="sticky top-8" dir={dir}>
      <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 sm:px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{t("title")}</h2>
            <span className="ms-auto text-sm text-muted-foreground">
              {items.length} {isAr ? "منتج" : "items"}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* قائمة المنتجات */}
          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 p-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-luxury-cream to-luxury-platinum rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "/yhouse-logo.png"}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  {/* badge الكمية */}
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("quantity")}: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-sm whitespace-nowrap">{item.price}</p>
              </div>
            ))}
          </div>

          {/* كود الخصم */}
          <div className="pt-2 border-t border-border/50">
            <PromoCodeInput
              onDiscountApplied={(discountData) => onDiscountChange?.(discountData)}
              onDiscountRemoved={() => onDiscountChange?.(null)}
              appliedDiscount={discount}
              disabled={disabled}
            />
          </div>

          {/* ملخص الأسعار */}
          <div className="pt-4 border-t border-border/50 space-y-3">
            {/* المجموع الفرعي */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="w-4 h-4" />
                <span className="text-sm">{t("subtotal")}</span>
              </div>
              <span className="font-medium">{totalPrice.toFixed(2)} {t("currency")}</span>
            </div>

            {/* الشحن */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-4 h-4" />
                <span className="text-sm">{t("shipping")}</span>
              </div>
              {shippingPrice > 0 ? (
                <span className="font-medium">{shippingPrice} {t("currency")}</span>
              ) : (
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {t("shippingNote")}
                </span>
              )}
            </div>

            {/* الخصم */}
            {discount && (
              <div className="flex items-center justify-between py-2 bg-green-50 dark:bg-green-950/20 -mx-2 px-2 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">{tPromo("discount")} ({discount.percentage}%)</span>
                </div>
                <span className="font-medium text-green-600 dark:text-green-400">
                  -{discount.amount.toFixed(2)} {t("currency")}
                </span>
              </div>
            )}

            {/* الإجمالي */}
            <div className="border-t-2 border-dashed border-border/50 pt-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-lg">{t("total")}</span>
                </div>
                <div className="text-end">
                  <span className="text-2xl font-bold text-primary">
                    {finalTotal.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ms-1">{t("currency")}</span>
                </div>
              </div>
            </div>

            {/* طريقة الدفع */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg">
              <Banknote className="h-4 w-4" />
              <span>{t("paymentMethod")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CheckoutOrderSummary.displayName = "CheckoutOrderSummary";
export default CheckoutOrderSummary;
