"use client";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { memo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

const OrderSummaryActions = memo(({ onCheckoutClick }: { onCheckoutClick?: () => void }) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("OrderSummary");
  const tCart = useTranslations("Cart");
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
    <div className="space-y-3">
      <button
        className="w-full h-12 bg-foreground text-background text-xs font-medium tracking-widest uppercase
          transition-all duration-300 hover:bg-foreground/90 active:scale-[0.99]
          disabled:opacity-50 disabled:cursor-not-allowed
          inline-flex items-center justify-center gap-2"
        onClick={validateStockAndCheckout}
        disabled={isValidating}
        aria-label={t("goCheckout")}
      >
        {isValidating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {tCart("validating")}
          </>
        ) : (
          <>
            {t("goCheckout")}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <button
        className="w-full h-11 border border-foreground text-foreground text-xs font-medium tracking-widest uppercase
          transition-all duration-200 hover:bg-foreground hover:text-background"
        onClick={() => {
          if (onCheckoutClick) onCheckoutClick();
          router.push(`/${locale}/products`);
        }}
        aria-label={t("continueShopping")}
      >
        {t("continueShopping")}
      </button>
    </div>
  );
});

OrderSummaryActions.displayName = "OrderSummaryActions";

export default OrderSummaryActions;
