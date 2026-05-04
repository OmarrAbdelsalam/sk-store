// Discount API utilities for frontend-only store
import { applyDiscount as applyDiscountLocal } from "@/lib/api/cart";

export interface DiscountResponse {
  succeeded: boolean;
  message: string;
  discountValue?: number;
  discountPercentage?: number;
  discountAmount?: number;
  originalTotal?: number;
  finalTotal?: number;
}

// Apply discount code
export const applyDiscount = async (sessionId: string, code: string): Promise<DiscountResponse> => {
  try {
    const result = await applyDiscountLocal(code);
    return {
      succeeded: result.success,
      message: result.message || '',
      discountValue: result.discountAmount,
      discountPercentage: result.discountAmount,
      discountAmount: result.discountAmount,
      originalTotal: 0,
      finalTotal: 0,
    };
  } catch (error) {
    return {
      succeeded: false,
      message: 'حدث خطأ في تطبيق كود الخصم',
    };
  }
};

// Remove discount
export const removeDiscount = async (sessionId: string): Promise<DiscountResponse> => {
  try {
    const { removeDiscount: removeDiscountLocal } = await import("@/lib/api/cart");
    await removeDiscountLocal();
    return {
      succeeded: true,
      message: 'تم إزالة الخصم بنجاح',
    };
  } catch (error) {
    return {
      succeeded: false,
      message: 'حدث خطأ في إزالة الخصم',
    };
  }
};

export const deleteDiscount = removeDiscount;
