"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Loader2, Tag } from "lucide-react";
import { applyDiscount, deleteDiscount } from "@/lib/api/discount";
import { getOrCreateSessionId } from "@/lib/session";

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

  // Shopify checkout: one row — floating-label field + Apply (gray until
  // there is something to apply). An applied code shows as a removable tag.
  return (
    <div>
      {!appliedDiscount && (
        <div className="flex gap-3">
          <div className="relative min-w-0 flex-1">
            <input
              id="promo-code"
              type="text"
              placeholder={isAr ? "كود الخصم" : "Discount code"}
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                clearError();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleKeyPress(e);
                }
              }}
              disabled={isApplying || disabled}
              maxLength={20}
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? "promo-code-msg" : undefined}
              className={`peer h-[52px] w-full rounded-none border bg-white px-3 font-sans text-[16px] uppercase text-ink outline-none transition-[border-color,box-shadow] duration-fast placeholder:normal-case placeholder:text-gray-500 hover:border-gray-400 focus:border-ink focus:ring-1 focus:ring-ink disabled:bg-gray-50 md:text-[14px] [&:not(:placeholder-shown)]:pb-1 [&:not(:placeholder-shown)]:pt-[18px] ${
                errorMessage ? "border-danger focus:border-danger focus:ring-danger" : "border-gray-300"
              }`}
            />
            <label
              htmlFor="promo-code"
              className="pointer-events-none absolute start-3 top-[7px] font-sans text-[12px] leading-4 text-gray-500 transition-[opacity,transform] duration-fast peer-placeholder-shown:translate-y-1 peer-placeholder-shown:opacity-0"
            >
              {isAr ? "كود الخصم" : "Discount code"}
            </label>
          </div>
          <button
            type="button"
            onClick={handleApplyPromoCode}
            disabled={isApplying || !promoCode.trim() || disabled}
            className="flex h-[52px] shrink-0 items-center justify-center gap-2 border border-ink bg-ink px-5 font-sans text-[13px] font-semibold text-white transition-colors duration-fast hover:bg-night disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
          >
            {isApplying && <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />}
            {t("apply")}
          </button>
        </div>
      )}

      {errorMessage && (
        <p id="promo-code-msg" className="mt-1.5 font-sans text-[13px] leading-5 text-danger">
          {errorMessage}
        </p>
      )}

      {appliedDiscount && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center gap-2 bg-gray-200 ps-2.5 pe-1 font-sans text-[13px] font-semibold uppercase tracking-[0.04em] text-ink">
            <Tag className="size-3.5" strokeWidth={1.5} />
            {appliedDiscount.code}
            <button
              type="button"
              onClick={handleRemoveDiscount}
              disabled={disabled || isRemoving}
              aria-label={isAr ? "إزالة الخصم" : "Remove discount"}
              className="flex size-6 items-center justify-center text-gray-600 transition-colors duration-fast hover:text-ink disabled:opacity-50"
            >
              {isRemoving ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <X className="size-3.5" strokeWidth={1.75} />
              )}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
