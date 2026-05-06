// Discount API - uses Supabase via promotionService
import { promotionService } from "@/services/promotions";
import { getLocalCart, applyDiscountToCart, removeDiscountFromCart } from "@/lib/localStorage";
import { getOrCreateSessionId } from "@/lib/session";

export interface DiscountResponse {
  succeeded: boolean;
  message: string;
  discountValue?: number;
  discountPercentage?: number;
  discountAmount?: number;
  originalTotal?: number;
  finalTotal?: number;
}

// Apply discount code - validates against Supabase with session + phone context
export const applyDiscount = async (
  sessionId: string,
  code: string,
  phoneNumber?: string
): Promise<DiscountResponse> => {
  try {
    const cart = getLocalCart();
    const subtotal = cart.subtotal;

    const result = await promotionService.validatePromoCode(code, subtotal, {
      sessionId: sessionId || getOrCreateSessionId(),
      phoneNumber: phoneNumber,
    });

    if (!result.valid) {
      return {
        succeeded: false,
        message: result.errorMessage || "Invalid promo code",
      };
    }

    // Apply to local cart
    applyDiscountToCart(code.toUpperCase(), result.discountAmount!);

    const percentage =
      result.discountType === "percentage"
        ? result.discountValue!
        : Math.round((result.discountAmount! / subtotal) * 100);

    return {
      succeeded: true,
      message: "Promo code applied successfully",
      discountValue: result.discountAmount,
      discountPercentage: percentage,
      discountAmount: result.discountAmount,
      originalTotal: subtotal,
      finalTotal: subtotal - result.discountAmount!,
    };
  } catch (error) {
    console.error("Error applying discount:", error);
    return {
      succeeded: false,
      message: "An error occurred while applying the promo code",
    };
  }
};

// Remove discount
export const removeDiscount = async (_sessionId?: string): Promise<DiscountResponse> => {
  try {
    removeDiscountFromCart();
    return { succeeded: true, message: "Discount removed" };
  } catch {
    return { succeeded: false, message: "Failed to remove discount" };
  }
};

export const deleteDiscount = removeDiscount;
