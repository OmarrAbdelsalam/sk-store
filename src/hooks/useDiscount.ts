"use client";

import { useState, useCallback } from "react";
import { promotionService } from "@/services/promotions";
import { applyDiscountToCart, removeDiscountFromCart } from "@/lib/localStorage";

export interface DiscountData {
  amount: number;
  percentage: number;
  code: string;
  promoCodeId: string;
  originalTotal: number;
  finalTotal: number;
}

export function useDiscount() {
  const [discount, setDiscount] = useState<DiscountData | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyDiscountCode = useCallback(
    async (code: string, cartSubtotal: number) => {
      if (!code.trim()) {
        setError("Please enter a discount code");
        return false;
      }

      setIsApplying(true);
      setError(null);

      try {
        const result = await promotionService.validatePromoCode(
          code.trim().toUpperCase(),
          cartSubtotal
        );

        if (result.valid && result.discountAmount !== undefined) {
          const discountData: DiscountData = {
            amount: result.discountAmount,
            percentage:
              result.discountType === "percentage" ? result.discountValue ?? 0 : 0,
            code: code.trim().toUpperCase(),
            promoCodeId: result.promoCodeId ?? "",
            originalTotal: cartSubtotal,
            finalTotal: cartSubtotal - result.discountAmount,
          };

          setDiscount(discountData);

          // Apply to localStorage cart
          applyDiscountToCart(discountData.code, discountData.amount);

          return true;
        } else {
          // Map errorCode to user-facing messages
          let message = result.errorMessage ?? "Invalid or expired promo code";
          setError(message);
          return false;
        }
      } catch {
        setError("Network error occurred while applying discount code");
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    []
  );

  const removeDiscount = useCallback(() => {
    setDiscount(null);
    setError(null);
    removeDiscountFromCart();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    discount,
    isApplying,
    error,
    applyDiscountCode,
    removeDiscount,
    clearError,
  };
}
