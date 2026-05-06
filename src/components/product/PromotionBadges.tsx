"use client";

import { Gift, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { useProductPromotions } from "@/hooks/usePromotions";

interface PromotionBadgesProps {
  productId: string;
}

export default function PromotionBadges({ productId }: PromotionBadgesProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const promotions = useProductPromotions(productId);

  if (promotions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {promotions.map((promo) => {
        if (promo.promo_type === "buy_x_get_y_free") {
          return (
            <span
              key={promo.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <Gift className="w-3.5 h-3.5" />
              {isAr ? "اشتري 1 واحصل على 1 مجاناً" : "Buy 1 Get 1 Free"}
            </span>
          );
        }

        if (promo.promo_type === "free_gift_min_amount") {
          const badgeText = isAr
            ? promo.badge_text_ar || "هدية مجانية"
            : promo.badge_text_en || "Free Gift";

          return (
            <span
              key={promo.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {badgeText}
            </span>
          );
        }

        return null;
      })}
    </div>
  );
}
