"use client";

import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { ShoppingBag, Check, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useRef, useEffect } from "react";

import { CONTACT_INFO } from "@/lib/constants";
import { track } from "@/lib/track";

interface AddToCartSectionProps {
  totalPrice: number;
  onAddToCart: () => void | Promise<void>;
  onBuyNow?: () => void;
  disabled?: boolean;
  inlineRef?: React.RefObject<HTMLDivElement | null>;
  productId?: string;
  productName?: string;
}

type ButtonState = "idle" | "loading" | "added";

const AddToCartSection = React.memo(({
  totalPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
  inlineRef,
  productId,
  productName,
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
    router.prefetch(`/cart`);
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

  // Carry the product into the chat so the sales team knows what the question
  // is about without having to ask.
  const whatsappHref = React.useMemo(() => {
    const base = `https://wa.me/${CONTACT_INFO.whatsapp}`;
    if (!productName) return base;
    const message = isAr
      ? `مرحباً، عايزة أسأل عن: ${productName}`
      : `Hi, I'd like to ask about: ${productName}`;
    return `${base}?text=${encodeURIComponent(message)}`;
  }, [productName, isAr]);

  // A product with lots of views and lots of WhatsApp questions but few orders
  // is telling us the page didn't answer something.
  const handleWhatsappClick = useCallback(() => {
    track("whatsapp_click", {
      productId,
      productName,
      value: totalPrice,
    });
  }, [productId, productName, totalPrice]);

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <Loader2 className="animate-spin" strokeWidth={1.25} />
            {isAr ? "جاري الإضافة..." : "Adding..."}
          </>
        );
      case "added":
        return (
          <>
            <Check strokeWidth={1.5} />
            {isAr ? "تمت الإضافة" : "Added"}
          </>
        );
      default:
        return (
          <>
            <ShoppingBag strokeWidth={1.25} />
            {t("addToCart")}
          </>
        );
    }
  };

  // Add to cart = outline; Buy now = the solid primary (clean-theme order).
  const getButtonClasses = () => {
    const base = "h-12 w-full";
    switch (buttonState) {
      case "loading":
        return `${base} cursor-wait`;
      case "added":
        return `${base} border-ink bg-ink text-white hover:bg-ink hover:text-white`;
      default:
        return base;
    }
  };

  const buyNowButton = onBuyNow ? (
    <Button className="h-12 w-full" onClick={() => onBuyNow()} disabled={disabled || buttonState === "loading"}>
      {t("buyNow")}
    </Button>
  ) : null;

  const whatsappButton = (
    <a
      href={whatsappHref}
      onClick={handleWhatsappClick}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto mt-1 inline-flex items-center gap-2 font-sans text-[13px] text-ink/70 underline underline-offset-4 transition-colors duration-fast hover:text-ink"
    >
      <WhatsAppIcon className="size-[18px] text-[#25D366]" />
      {isAr ? "اسألينا على واتساب" : "Ask us on WhatsApp"}
    </a>
  );

  return (
    <>
      
      {/* Mobile button - fixed at bottom, shown only when inline button scrolled out of view */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-background px-gutter pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden transition-transform duration-300 ${showSticky ? "translate-y-0" : "translate-y-full"}`}
        dir={dir}
      >
        <div className={buyNowButton ? "grid grid-cols-2 gap-2" : ""}>
          <Button
            variant="outline"
            className={getButtonClasses()}
            onClick={handleAddToCart}
            onMouseEnter={handleCartHover}
            disabled={disabled || buttonState === "loading"}
          >
            {getButtonContent()}
          </Button>
          {buyNowButton}
        </div>
      </div>

      {/* Mobile inline Add to Cart + WhatsApp - not sticky, in normal flow */}
      <div className="lg:hidden flex flex-col gap-tile" dir={dir}>
        {/* Inline Add to Cart button — observed by IntersectionObserver */}
        <Button
          ref={inlineButtonRef}
          variant="outline"
          className={getButtonClasses()}
          onClick={handleAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled || buttonState === "loading"}
        >
          {getButtonContent()}
        </Button>
        {buyNowButton}

        {whatsappButton}
      </div>

      {/* Desktop - Regular button */}
      <div className="hidden lg:flex lg:flex-col lg:gap-tile" dir={dir}>
        <Button
          variant="outline"
          className={getButtonClasses()}
          onClick={handleAddToCart}
          onMouseEnter={handleCartHover}
          disabled={disabled || buttonState === "loading"}
        >
          {getButtonContent()}
        </Button>
        {buyNowButton}

        {/* Contact Seller */}
        {whatsappButton}
      </div>
    </>
  );
});

AddToCartSection.displayName = "AddToCartSection";

export default AddToCartSection;
