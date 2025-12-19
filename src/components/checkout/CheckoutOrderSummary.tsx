"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { memo } from "react";
import { useTranslations, useLocale } from "next-intl";
import PromoCodeInput from "./PromoCodeInput";

interface CartItem {
  id: number;
  name: string;
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

  // استخدم finalTotal من API إذا كان متوفر، وإلا احسبه يدوياً
  const finalTotal = discount?.finalTotal 
    ? discount.finalTotal + shippingPrice 
    : totalPrice + shippingPrice - (discount?.amount || 0);

  return (
    <Card dir={dir}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-luxury-cream rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-muted-foreground text-sm">{t("quantity")}: {item.quantity}</p>
              </div>
            </div>
            <p className="font-medium">{item.price}</p>
          </div>
        ))}

        {/* كود الخصم */}
        <div className="border-t pt-4">
          <PromoCodeInput
            onDiscountApplied={(discountData) => onDiscountChange?.(discountData)}
            onDiscountRemoved={() => onDiscountChange?.(null)}
            appliedDiscount={discount}
            disabled={disabled}
          />
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>{t("subtotal")}</span>
            <span>{totalPrice.toFixed(2)} {t("currency")}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("shipping")}</span>
            {shippingPrice > 0 ? (
              <span>{shippingPrice} {t("currency")}</span>
            ) : (
              <span className="text-sm text-muted-foreground">{t("shippingNote")}</span>
            )}
          </div>
          {discount && (
            <div className="flex justify-between text-green-600">
              <span>{tPromo("discount")}</span>
              <span>-{discount.amount.toFixed(2)} {t("currency")}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>{t("total")}</span>
            <span>{finalTotal.toFixed(2)} {t("currency")}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <span>{t("paymentMethod")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CheckoutOrderSummary.displayName = "CheckoutOrderSummary";
export default CheckoutOrderSummary;
