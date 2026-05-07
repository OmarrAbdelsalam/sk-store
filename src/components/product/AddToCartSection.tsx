"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useRef, useEffect } from "react";

interface AddToCartSectionProps {
  totalPrice: number;
  onAddToCart: () => void | Promise<void>;
  onBuyNow?: () => void;
  disabled?: boolean;
}

type ButtonState = "idle" | "loading" | "added";

const AddToCartSection = React.memo(({
  totalPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
}: AddToCartSectionProps) => {
  const t = useTranslations("AddToCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const router = useRouter();
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [bottomOffset, setBottomOffset] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prefetch cart page on hover
  const handleCartHover = React.useCallback(() => {
    router.prefetch(`/${locale}/cart`);
  }, [locale, router]);

  // Push button up when footer comes into view
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const handleScroll = () => {
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (footerRect.top < windowHeight) {
        // Footer is visible — push button up by how much footer is showing
        setBottomOffset(windowHeight - footerRect.top);
      } else {
        setBottomOffset(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (buttonState !== "idle") return;

    setButtonState("loading");

    // Short delay then trigger actual add
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      await onAddToCart();
      setButtonState("added");

      // Reset back to idle after 2 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setButtonState("idle");
      }, 2000);
    } catch {
      setButtonState("idle");
    }
  }, [buttonState, onAddToCart]);

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <Loader2 className={`h-5 w-5 animate-spin ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {isAr ? "جاري الإضافة..." : "Adding..."}
          </>
        );
      case "added":
        return (
          <>
            {isAr ? "تمت الإضافة ✓" : "Added to Cart ✓"}
          </>
        );
      default:
        return (
          <>
            <ShoppingBag className={`h-5 w-5 ${dir === "rtl" ? "ml-2" : "mr-2"}`} />
            {t("addToCart")}
          </>
        );
    }
  };

  const getButtonClasses = () => {
    const base = "w-full text-lg py-6 transition-all duration-300";
    switch (buttonState) {
      case "loading":
        return `${base} bg-gray-700 text-white cursor-wait`;
      case "added":
        return `${base} bg-emerald-700 hover:bg-emerald-700 text-white`;
      default:
        return `${base} bg-black hover:bg-black/90 text-white`;
    }
  };

  return (
    <>
      
      {/* Mobile button - fixed at bottom, stops above footer */}
      <div 
        className="fixed left-0 right-0 z-50 bg-background border-t border-border p-4 lg:hidden shadow-lg transition-[bottom] duration-100"
        style={{ bottom: `${bottomOffset}px` }}
        dir={dir}
      >
        <Button
          size="lg"
          className={getButtonClasses()}
          onClick={handleAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled || buttonState === "loading"}
        >
          {getButtonContent()}
        </Button>
      </div>

      {/* Desktop - Regular button */}
      <div className="hidden lg:block" dir={dir}>
        <Button
          size="lg"
          className={getButtonClasses()}
          onClick={handleAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled || buttonState === "loading"}
        >
          {getButtonContent()}
        </Button>
      </div>
    </>
  );
});

AddToCartSection.displayName = "AddToCartSection";

export default AddToCartSection;
