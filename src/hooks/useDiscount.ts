"use client";

import { useState, useCallback } from 'react';
import { applyDiscount } from '@/lib/api/discount';
import { getOrCreateSessionId } from '@/lib/session';

export interface DiscountData {
  amount: number;
  percentage: number;
  code: string;
  originalTotal: number;
  finalTotal: number;
}

export function useDiscount() {
  const [discount, setDiscount] = useState<DiscountData | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyDiscountCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return false;
    }

    setIsApplying(true);
    setError(null);

    try {
      const sessionId = getOrCreateSessionId();
      const result = await applyDiscount(sessionId, code.trim());

      if (result.succeeded) {
        const discountData: DiscountData = {
          amount: result.discountValue || 0,
          percentage: result.discountPercentage || 0,
          code: code.trim(),
          originalTotal: result.originalTotal || 0,
          finalTotal: result.finalTotal || 0
        };
        
        setDiscount(discountData);
        return true;
      } else {
        setError(result.message || 'Invalid or expired discount code');
        return false;
      }
    } catch (error) {
      setError('Network error occurred while applying discount code');
      return false;
    } finally {
      setIsApplying(false);
    }
  }, []);

  const removeDiscount = useCallback(() => {
    setDiscount(null);
    setError(null);
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
    clearError
  };
}