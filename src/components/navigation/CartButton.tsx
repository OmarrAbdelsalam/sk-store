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
  isTransparent?: boolean;
}

export const CartButton = ({ isMobile = false, className = "", isTransparent = false }: CartButtonProps) => {
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
      className={`relative hover:bg-transparent transition-all px-2 ${isTransparent ? "text-white hover:text-white/80 hover:bg-white/10" : "hover:opacity-70"} ${isBouncing ? "animate-cart-bounce" : ""} ${className}`}
      aria-label={cartItemsCount > 0 ? `Cart (${cartItemsCount} items)` : 'Cart'}
      onClick={handleClick}
    >
      <ShoppingBag className="h-6 w-6" strokeWidth={1.2} color={isTransparent ? "white" : "black"} />
      {cartItemsCount > 0 && (
        <span 
          ref={badgeRef}
          className={`absolute -top-1 -right-1 ${isTransparent ? 'bg-white text-black border-transparent' : 'bg-black text-white border-white'} text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-md border-[1.5px] transition-transform duration-300 ${isBouncing ? "animate-badge-pop" : ""}`}
        >
          {cartItemsCount}
        </span>
      )}
    </Button>
  );
};
