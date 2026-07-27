"use client";

import { useState } from "react";
import { X, Copy, Check, Banknote, Clock, Store, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type EasyKashPaymentResult = {
  voucher: string;
  expiryDate: string;
  provider: string;
  easykashRef: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the user confirms they have noted the code and wants to finalize the order */
  onConfirm: () => void;
  result: EasyKashPaymentResult | null;
  isLoading: boolean;
  error: string | null;
  totalAmount: string;
  isAr: boolean;
};

export default function EasyKashModal({
  isOpen,
  onClose,
  onConfirm,
  result,
  isLoading,
  error,
  totalAmount,
  isAr,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (result?.voucher) {
      navigator.clipboard.writeText(result.voucher).catch(() => {
        /* ignore clipboard errors on some browsers */
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e0d8]">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-foreground" />
            <h2 className="text-sm font-medium tracking-wider uppercase">
              {isAr ? "الدفع النقدي عبر EasyKash" : "Cash Payment via EasyKash"}
            </h2>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-sm transition-colors"
              aria-label={isAr ? "إغلاق" : "Close"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Amount */}
        <div className="px-6 py-3 bg-[#F0EBE3] border-b border-[#e8e0d8]">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider uppercase text-muted-foreground">
              {isAr ? "المبلغ المطلوب" : "Amount to pay"}
            </span>
            <span className="text-lg font-semibold">
              {totalAmount} {isAr ? "جنيه" : "EGP"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-foreground/60" />
              <p className="text-sm text-muted-foreground tracking-wider">
                {isAr ? "جاري إنشاء كود الدفع..." : "Generating payment code..."}
              </p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
              <button
                onClick={onClose}
                className="w-full h-11 border border-foreground text-foreground text-sm tracking-wider uppercase rounded-full hover:bg-muted transition-colors"
              >
                {isAr ? "حاول مرة أخرى" : "Try Again"}
              </button>
            </div>
          )}

          {/* Success — show voucher */}
          {!isLoading && !error && result && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground text-center">
                {isAr
                  ? `ادفع هذا المبلغ في أقرب فرع ${result.provider}`
                  : `Pay this amount at any ${result.provider} branch`}
              </p>

              {/* Voucher code */}
              <div className="bg-[#F0EBE3] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                    {isAr ? "كود الدفع" : "Payment Code"}
                  </p>
                  <p className="text-2xl font-bold tracking-widest text-gray-900 font-mono">
                    {result.voucher}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all",
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                  aria-label={isAr ? "نسخ الكود" : "Copy code"}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {isAr ? "تم النسخ" : "Copied"}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {isAr ? "نسخ" : "Copy"}
                    </>
                  )}
                </button>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Store className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                      {isAr ? "مزود الخدمة" : "Provider"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{result.provider}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                      {isAr ? "صالح حتى" : "Expires"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{result.expiryDate}</p>
                </div>
              </div>

              {/* Ref */}
              <p className="text-center text-[11px] text-muted-foreground">
                {isAr ? "مرجع EasyKash:" : "EasyKash Ref:"}{" "}
                <span className="font-mono">{result.easykashRef}</span>
              </p>

              {/* Confirm CTA */}
              <button
                onClick={handleConfirm}
                disabled={confirmed}
                className={cn(
                  "w-full h-12 bg-foreground text-background text-sm font-medium tracking-widest uppercase rounded-full transition-all",
                  "hover:bg-foreground/90",
                  confirmed && "opacity-50 cursor-not-allowed"
                )}
              >
                {confirmed ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isAr ? "جاري تأكيد الطلب..." : "Confirming order..."}
                  </span>
                ) : isAr ? (
                  "تأكيد الطلب"
                ) : (
                  "Confirm Order"
                )}
              </button>

              <p className="text-[11px] text-muted-foreground text-center">
                {isAr
                  ? "سيتم تأكيد طلبك بعد إتمام الدفع في الفرع"
                  : "Your order will be confirmed once you pay at the branch"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
