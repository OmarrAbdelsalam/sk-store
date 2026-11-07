"use client";

import { Gift, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { useProductPromotions } from "@/hooks/usePromotions";
import { Badge } from "@/components/ui/badge";

interface PromotionBadgesProps {
  productId: string;
}

export default function PromotionBadges({ productId }: PromotionBadgesProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const promotions = useProductPromotions(productId);

  if (promotions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-tile">
      {promotions.map((promo) => {
        if (promo.promo_type === "buy_x_get_y_free") {
          return (
            <Badge key={promo.id} variant="primary" className="gap-1">
              <Gift className="h-3 w-3" strokeWidth={1.25} />
              {isAr ? "اشتري 1 واحصل على 1 مجاناً" : "Buy 1 Get 1 Free"}
            </Badge>
          );
        }

        if (promo.promo_type === "free_gift_min_amount") {
          const badgeText = isAr
            ? promo.badge_text_ar || "هدية مجانية"
            : promo.badge_text_en || "Free Gift";

          return (
            <Badge key={promo.id} variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" strokeWidth={1.25} />
              {badgeText}
            </Badge>
          );
        }

        return null;
      })}
    </div>
  );
}
