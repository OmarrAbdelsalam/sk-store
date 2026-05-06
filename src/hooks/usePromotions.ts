"use client";

import { useQuery } from "@tanstack/react-query";
import { promotionService, type QuickPromotion } from "@/services/promotions";

/**
 * Fetch all active quick promotions with 5-minute cache
 */
export function useActivePromotions() {
  return useQuery({
    queryKey: ["active-quick-promotions"],
    queryFn: () => promotionService.getActiveQuickPromotions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get promotions applicable to a specific product
 */
export function useProductPromotions(productId: string): QuickPromotion[] {
  const { data: promotions = [] } = useActivePromotions();

  return promotions.filter((promo) => {
    if (!promo.product_ids) return false;
    try {
      const ids: string[] = JSON.parse(promo.product_ids);
      return ids.includes(productId);
    } catch {
      return false;
    }
  });
}
