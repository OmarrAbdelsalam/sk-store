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
  inlineRef?: React.RefObject<HTMLDivElement | null>;
}

type ButtonState = "idle" | "loading" | "added";

const AddToCartSection = React.memo(({
  totalPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
  inlineRef,
}: AddToCartSectionProps) => {
  const t = useTranslations("AddToCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";
  const router = useRouter();
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inlineButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  // Show sticky bar only when the sentinel element is scrolled out of view
  useEffect(() => {
    // Use the externally provided ref (e.g. product info section) if available,
    // otherwise fall back to the inline button itself
    const el: Element | null = inlineRef?.current ?? inlineButtonRef.current;
    if (!el) return;

    let observer: IntersectionObserver;

    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowSticky(!isVisible);

      observer = new IntersectionObserver(
        ([entry]) => {
          setShowSticky(!entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [inlineRef]);

  // Prefetch cart page on hover
  const handleCartHover = React.useCallback(() => {
    router.prefetch(`/${locale}/cart`);
  }, [locale, router]);

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
    const base = "w-full text-sm font-medium h-11 rounded-full transition-all duration-300 shadow-md border border-transparent";
    switch (buttonState) {
      case "loading":
        return `${base} bg-gray-700 text-white cursor-wait`;
      case "added":
        return `${base} bg-emerald-700 text-white border-emerald-600`;
      default:
        return `${base} bg-[#2D2A26] hover:bg-black text-white border-white/10 hover:scale-[1.02]`;
    }
  };

  return (
    <>
      
      {/* Mobile button - fixed at bottom, shown only when inline button scrolled out of view */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-4 pt-3 pb-5 lg:hidden shadow-[0_-8px_20px_rgba(0,0,0,0.06)] transition-transform duration-300 ${showSticky ? "translate-y-0" : "translate-y-full"}`}
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

      {/* Mobile WhatsApp and inline Add to Cart - not sticky, in normal flow */}
      <div className="lg:hidden mt-4 flex flex-col gap-3 pb-4" dir={dir}>
        <a
          href="https://wa.me/201234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base font-medium h-14 rounded-full bg-[#075E54] hover:bg-[#064d44] text-white hover:text-white border-none shadow-md transition-all duration-300"
          >
            {isAr ? "اسألينا على واتساب" : "Ask Us on WhatsApp"}
          </Button>
        </a>
        
        {/* Inline Add to Cart button — observed by IntersectionObserver */}
        <Button
          ref={inlineButtonRef}
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

        {/* Contact Seller */}
        <a
          href="https://wa.me/201234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base font-medium h-14 rounded-full bg-[#075E54] hover:bg-[#064d44] text-white hover:text-white border-none shadow-md transition-all duration-300"
          >
            {isAr ? "اسألينا على واتساب" : "Ask Us on WhatsApp"}
          </Button>
        </a>
      </div>
    </>
  );
});

AddToCartSection.displayName = "AddToCartSection";

export default AddToCartSection;
