"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

interface AddToCartSectionProps {
  totalPrice: number;
  onAddToCart: () => void;
  onBuyNow?: () => void;
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

  // Prefetch cart page on hover
  const handleCartHover = React.useCallback(() => {
    router.prefetch(`/${locale}/cart`);
  }, [locale, router]);

  return (
    <>
      
      {/* Fixed Add to Cart button at bottom - Mobile only */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 lg:hidden shadow-lg"
        dir={dir}
      >
        <Button
          size="lg"
          className="w-full text-lg py-6 bg-black hover:bg-black/90 text-white"
          onClick={onAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled}
        >
          <ShoppingBag className={`h-5 w-5 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
          {t("addToCart")}
        </Button>
      </div>

      {/* Desktop - Regular button */}
      <div className="hidden lg:block" dir={dir}>
        <Button
          size="lg"
          className="w-full text-lg py-6 bg-black hover:bg-black/90 text-white"
          onClick={onAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled}
        >
          <ShoppingBag className={`h-5 w-5 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
          {t("addToCart")}
        </Button>
      </div>
    </>
  );
});

AddToCartSection.displayName = "AddToCartSection";

export default AddToCartSection;
