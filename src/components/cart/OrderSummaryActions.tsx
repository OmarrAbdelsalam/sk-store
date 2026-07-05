"use client";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { memo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

const OrderSummaryActions = memo(({ onCheckoutClick }: { onCheckoutClick?: () => void }) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("OrderSummary");
  const [isValidating, setIsValidating] = useState(false);

  const validateStockAndCheckout = async () => {
    setIsValidating(true);
    try {
      if (onCheckoutClick) onCheckoutClick();
      router.push(`/${locale}/checkout`);
    } catch (error) {
      console.error("Error navigating to checkout:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      <button
        className="w-full h-14 rounded-full bg-[#2D2A26] hover:bg-black text-white text-sm font-medium tracking-widest uppercase
          transition-all duration-300 hover:scale-[1.02] shadow-xl border border-white/10
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          inline-flex items-center justify-center gap-2"
        onClick={validateStockAndCheckout}
        disabled={isValidating}
        aria-label={t("goCheckout")}
      >
        {isValidating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
          </>
        ) : (
          <>
            {t("goCheckout")}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
});

OrderSummaryActions.displayName = "OrderSummaryActions";

export default OrderSummaryActions;
