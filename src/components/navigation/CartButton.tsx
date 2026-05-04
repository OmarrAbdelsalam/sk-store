"use client";

import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, lazy, Suspense } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

const CartItem = lazy(() => import("@/components/cart/CartItem"));
const EmptyCart = lazy(() => import("@/components/cart/EmptyCart"));
const OrderSummary = lazy(() => import("@/components/cart/OrderSummary"));

interface CartButtonProps {
  isMobile?: boolean;
  className?: string;
}

function CartSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const CartButton = ({ isMobile = false, className = "" }: CartButtonProps) => {
  const locale = useLocale();
  const t = useTranslations("Cart");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  
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
  
  // Get cart items count - will be 0 during SSR or if cart is unavailable
  const cartItemsCount = mounted && cart ? cart.getTotalItems() : 0;
  const { items, isLoading, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = cart || {};

  // Don't render Sheet until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        aria-label="Cart"
      >
        <ShoppingBag className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          aria-label={cartItemsCount > 0 ? `Cart (${cartItemsCount} items)` : 'Cart'}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
              {cartItemsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent 
        side={locale === "ar" ? "left" : "right"} 
        className="w-[80%] sm:w-[420px] overflow-y-auto bg-background p-0"
      >
        {/* Hidden title for accessibility */}
        <SheetTitle className="sr-only">{t("title")}</SheetTitle>
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{t("title")}</h2>
              {cartItemsCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {getTotalItems?.()} {locale === "ar" ? "منتج" : "items"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6 space-y-6">
          {isLoading ? (
            <CartSkeleton />
          ) : !items || items.length === 0 ? (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <EmptyCart />
            </Suspense>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                <Suspense fallback={<CartSkeleton />}>
                  {items.map((item, index) => (
                    <div 
                      key={item.id || `cart-item-${index}`}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CartItem
                        item={{ ...item, itemId: item.id }}
                        onUpdateQuantity={(itemId, qty) => updateQuantity!(String(itemId), qty)}
                        onRemove={(itemId) => removeFromCart!(String(itemId))}
                        maxQuantity={item.availableStock ?? 999}
                      />
                    </div>
                  ))}
                </Suspense>
              </div>

              {/* Order Summary */}
              <div className="pt-6">
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
                  <OrderSummary
                    totalItemsFallback={getTotalItems?.() ?? 0}
                    totalPriceFallback={getTotalPrice?.() ?? 0}
                    onCheckoutClick={() => setOpen(false)}
                  />
                </Suspense>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};