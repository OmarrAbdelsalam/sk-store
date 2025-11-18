"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface AddToCartSectionProps {
  totalPrice: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
}

import React from "react";

const AddToCartSection = React.memo(({
  totalPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
}: AddToCartSectionProps) => {
  const t = useTranslations("AddToCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="space-y-6" dir={dir}>
      {/* أزرار الشراء */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="outline"
          className="w-full text-lg py-6"
          onClick={onAddToCart}
          disabled={disabled}
        >
          <ShoppingBag className={`h-5 w-5 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
          {t("addToCart")}
        </Button>
        
        <Button
          size="lg"
          className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
          onClick={onBuyNow}
          disabled={disabled}
        >
          {t("buyNow")}
        </Button>
      </div>

      {/* زر التواصل عبر واتساب */}
      <Button
        size="lg"
        variant="outline"
        className="w-full text-lg py-6 border-green-500 text-green-600 hover:bg-green-50"
        onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
      >
        {t("contactSeller")}
      </Button>
    </div>
  );
});

export default AddToCartSection;
