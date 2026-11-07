"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface CartButtonProps {
  isMobile?: boolean;
  className?: string;
  isTransparent?: boolean;
  /** Desktop header: render "CART (n)" as a tracked label instead of an icon. */
  showLabel?: boolean;
}

export const CartButton = ({ isMobile = false, className = "", isTransparent = false, showLabel = false }: CartButtonProps) => {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  
  // Always call useCart (hooks must be called unconditionally)
  let cart;
  try {
    cart = useCart();
  } catch (error) {
    console.error('Cart context not available:', error);
  }
  
  // Mark component as mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for cart-item-added event to trigger bounce
  useEffect(() => {
    const handleCartAdded = () => {
      setIsBouncing(true);
      // Remove bounce class after animation completes
      setTimeout(() => {
        setIsBouncing(false);
      }, 600);
    };

    window.addEventListener("cart-item-added", handleCartAdded);
    return () => window.removeEventListener("cart-item-added", handleCartAdded);
  }, []);
  
  // Get cart items count - will be 0 during SSR or if cart is unavailable
  const cartItemsCount = mounted && cart ? cart.getTotalItems() : 0;

  const handleClick = () => {
    router.push(`/cart`);
  };

  const ariaLabel = cartItemsCount > 0 ? `Cart (${cartItemsCount} items)` : "Cart";

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        className={`flex items-center gap-2 font-sans text-fine font-semibold transition-opacity duration-fast hover:opacity-70 ${isBouncing ? "animate-cart-bounce" : ""} ${className}`}
      >
        <ShoppingBag className="size-5" strokeWidth={1.25} />
        {t("cart")}
        {cartItemsCount > 0 && (
          <span className={isBouncing ? "inline-block animate-badge-pop" : ""}> ({cartItemsCount})</span>
        )}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      // Over the hero the focus ring is white and flush, not an ink ring on a
      // white offset box.
      className={`relative ${isTransparent ? "focus-visible:ring-white focus-visible:ring-offset-0" : ""} ${isBouncing ? "animate-cart-bounce" : ""} ${className}`}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      <ShoppingBag className="!size-[22px]" strokeWidth={1.25} />
      {cartItemsCount > 0 && (
        <span
          ref={badgeRef}
          className={`absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill px-1 font-sans text-[10px] font-semibold leading-none tracking-normal transition-colors duration-300 ${
            // Transparent header over the hero: white bubble, dark number.
            isTransparent ? "bg-white text-ink [text-shadow:none]" : "bg-primary text-white"
          } ${isBouncing ? "animate-badge-pop" : ""}`}
        >
          {cartItemsCount}
        </span>
      )}
    </Button>
  );
};
