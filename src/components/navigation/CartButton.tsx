"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useLocale } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface CartButtonProps {
  isMobile?: boolean;
  className?: string;
}

export const CartButton = ({ isMobile = false, className = "" }: CartButtonProps) => {
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
    router.push(`/${locale}/cart`);
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`relative ${isBouncing ? "animate-cart-bounce" : ""}`}
      aria-label={cartItemsCount > 0 ? `Cart (${cartItemsCount} items)` : 'Cart'}
      onClick={handleClick}
    >
      <ShoppingBag className="h-5 w-5" />
      {cartItemsCount > 0 && (
        <span 
          ref={badgeRef}
          className={`absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold transition-transform duration-300 ${isBouncing ? "animate-badge-pop" : ""}`}
        >
          {cartItemsCount}
        </span>
      )}
    </Button>
  );
};