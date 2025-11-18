"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

interface AddToCartSectionProps {
  totalPrice: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
}

const AddToCartSection = React.memo(({
  totalPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
}: AddToCartSectionProps) => {
  const t = useTranslations("AddToCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const router = useRouter();

  // Prefetch cart page on hover (for both buttons now)
  const handleCartHover = React.useCallback(() => {
    router.prefetch(`/${locale}/cart`);
  }, [locale, router]);

  return (
    <div className="space-y-6" dir={dir}>
      {/* أزرار الشراء */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="outline"
          className="w-full text-lg py-6"
          onClick={onAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled}
        >
          <ShoppingBag className={`h-5 w-5 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
          {t("addToCart")}
        </Button>
        
        <Button
          size="lg"
          className="w-full text-lg py-6 bg-primary hover:bg-primary/90"
          onClick={onBuyNow}
          onMouseEnter={handleCartHover}
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
