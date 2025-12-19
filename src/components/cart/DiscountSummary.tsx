"use client";

import { useLocale, useTranslations } from "next-intl";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscountSummaryProps {
  discount: {
    amount: number;
    percentage: number;
    code: string;
  };
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export default function DiscountSummary({ 
  discount, 
  onRemove, 
  showRemoveButton = false 
}: DiscountSummaryProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations("PromoCode");

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              {discount.code}
            </p>
            <p className="text-xs text-green-600">
              {discount.percentage}% {isAr ? "خصم" : "discount"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-700">
            -{discount.amount.toFixed(2)} {isAr ? "جنيه" : "EGP"}
          </span>
          
          {showRemoveButton && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}