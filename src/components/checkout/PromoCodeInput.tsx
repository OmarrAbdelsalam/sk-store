"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, X, Loader2, AlertCircle } from "lucide-react";
import { applyDiscount, deleteDiscount } from "@/lib/api/discount";
import { getOrCreateSessionId } from "@/lib/session";
import DiscountBreakdown from "@/components/ui/DiscountBreakdown";

interface PromoCodeInputProps {
  onDiscountApplied: (discount: { 
    amount: number; 
    percentage: number; 
    code: string;
    originalTotal: number;
    finalTotal: number;
  }) => void;
  onDiscountRemoved: () => void;
  appliedDiscount?: { 
    amount: number; 
    percentage: number; 
    code: string;
    originalTotal: number;
    finalTotal: number;
  } | null;
  disabled?: boolean;
}

export default function PromoCodeInput({ 
  onDiscountApplied, 
  onDiscountRemoved, 
  appliedDiscount,
  disabled = false 
}: PromoCodeInputProps) {
  const t = useTranslations("PromoCode");
  const locale = useLocale();
  const isAr = locale === "ar";
  
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setErrorMessage(t("enterCode"));
      return;
    }

    setErrorMessage(null);
    setIsApplying(true);
    try {
      const sessionId = getOrCreateSessionId();
      const result = await applyDiscount(sessionId, promoCode.trim());

      if (result.succeeded && result.data) {
        onDiscountApplied({
          amount: result.data.discountValue,
          percentage: result.data.discountPercentage,
          code: promoCode.trim(),
          originalTotal: result.data.originalTotal,
          finalTotal: result.data.finalTotal
        });
        
        setPromoCode("");
        setErrorMessage(null);
      } else {
        // عرض رسالة خطأ عامة
        setErrorMessage(t("invalidCodeDesc"));
      }
    } catch (error) {
      setErrorMessage(t("networkError"));
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async () => {
    setIsRemoving(true);
    setErrorMessage(null);
    try {
      const sessionId = getOrCreateSessionId();
      const result = await deleteDiscount(sessionId);

      if (result.succeeded) {
        onDiscountRemoved();
      } else {
        setErrorMessage(result.message || t("removeError"));
      }
    } catch (error) {
      setErrorMessage(t("networkError"));
    } finally {
      setIsRemoving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isApplying && !appliedDiscount) {
      handleApplyPromoCode();
    }
  };

  const clearError = () => {
    if (errorMessage) setErrorMessage(null);
  };

  return (
    <div className="space-y-3">
      {/* رسالة الخطأ */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* عرض الخصم المطبق */}
      {appliedDiscount && (
        <div className="space-y-3">
          {/* زر الإزالة */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveDiscount}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={disabled || isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  {isAr ? "جاري الإزالة..." : "Removing..."}
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-1" />
                  {isAr ? "إزالة الخصم" : "Remove Discount"}
                </>
              )}
            </Button>
          </div>

          {/* تفاصيل الخصم */}
          <DiscountBreakdown discount={appliedDiscount} />
        </div>
      )}

      {/* إدخال كود الخصم */}
      {!appliedDiscount && (
        <div className="space-y-2">
          <Label htmlFor="promo-code" className="text-sm font-medium">
            {t("label")}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${
                isAr ? "right-3" : "left-3"
              }`} />
              <Input
                id="promo-code"
                type="text"
                placeholder={t("placeholder")}
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  clearError();
                }}
                onKeyPress={handleKeyPress}
                disabled={isApplying || disabled}
                className={`${isAr ? "pr-10" : "pl-10"} uppercase`}
                maxLength={20}
              />
            </div>
            <Button
              onClick={handleApplyPromoCode}
              disabled={isApplying || !promoCode.trim() || disabled}
              className="px-6"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("applying")}
                </>
              ) : (
                t("apply")
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("hint")}
          </p>
        </div>
      )}
    </div>
  );
}