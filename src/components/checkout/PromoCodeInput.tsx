"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
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
  phoneNumber?: string;
}

export default function PromoCodeInput({ 
  onDiscountApplied, 
  onDiscountRemoved, 
  appliedDiscount,
  disabled = false,
  phoneNumber,
}: PromoCodeInputProps) {
  const t = useTranslations("PromoCode");
  const locale = useLocale();
  const isAr = locale === "ar";
  
  const [promoCode, setPromoCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * A code that arrived by email is applied without being typed.
   *
   * CartRestorer parks it in localStorage when the customer follows the link
   * from a cart reminder; by the time they reach checkout the basket has
   * settled, which is what validation needs. Cleared on the first attempt
   * either way, so a code that turns out to be expired isn't retried forever.
   */
  const autoApplied = useRef(false);
  useEffect(() => {
    if (autoApplied.current || appliedDiscount || disabled) return;

    let pending: string | null = null;
    try {
      pending = localStorage.getItem("pending_promo_code");
    } catch {
      return;
    }
    if (!pending) return;

    autoApplied.current = true;
    try {
      localStorage.removeItem("pending_promo_code");
    } catch {}

    (async () => {
      setIsApplying(true);
      try {
        const sessionId = getOrCreateSessionId();
        const result = await applyDiscount(sessionId, pending!.trim(), phoneNumber);
        if (result.succeeded) {
          onDiscountApplied({
            amount: result.discountValue || 0,
            percentage: result.discountPercentage || 0,
            code: pending!.trim(),
            originalTotal: result.originalTotal || 0,
            finalTotal: result.finalTotal || 0,
          });
        } else {
          // Show it in the field rather than silently dropping it — the
          // customer was promised this code in an email.
          setPromoCode(pending!.trim());
          setErrorMessage(result.message);
        }
      } catch {
        setPromoCode(pending!.trim());
      } finally {
        setIsApplying(false);
      }
    })();
    // Runs once on mount; re-running on every prop change would re-apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setErrorMessage(t("enterCode"));
      return;
    }

    setErrorMessage(null);
    setIsApplying(true);
    try {
      const sessionId = getOrCreateSessionId();
      const result = await applyDiscount(sessionId, promoCode.trim(), phoneNumber);

      if (result.succeeded) {
        onDiscountApplied({
          amount: result.discountValue || 0,
          percentage: result.discountPercentage || 0,
          code: promoCode.trim(),
          originalTotal: result.originalTotal || 0,
          finalTotal: result.finalTotal || 0
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
      {/* Error message */}
      {errorMessage && (
        <div className="p-3 border border-red-300 bg-red-50/50">
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Applied discount */}
      {appliedDiscount && (
        <div className="space-y-3">
          {/* Remove button */}
          <div className="flex justify-end">
            <button
              onClick={handleRemoveDiscount}
              className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
              disabled={disabled || isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isAr ? "جاري الإزالة..." : "Removing..."}
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" />
                  {isAr ? "إزالة الخصم" : "Remove"}
                </>
              )}
            </button>
          </div>

          {/* Discount details */}
          <DiscountBreakdown discount={appliedDiscount} />
        </div>
      )}

      {/* Promo code input */}
      {!appliedDiscount && (
        <div className="space-y-2.5">
          <Label htmlFor="promo-code" className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
            {t("label")}
          </Label>
          <div className="flex gap-0">
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
              className="uppercase rounded-none border-border bg-transparent h-11 text-sm focus-visible:ring-1 focus-visible:ring-foreground border-r-0"
              maxLength={20}
            />
            <button
              onClick={handleApplyPromoCode}
              disabled={isApplying || !promoCode.trim() || disabled}
              className="h-11 px-5 bg-foreground text-background text-xs font-medium tracking-wider uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("applying")}
                </>
              ) : (
                t("apply")
              )}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t("hint")}
          </p>
        </div>
      )}
    </div>
  );
}
