"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo } from "react";

const OrderSummaryActions = memo(() => {
  const router = useRouter();
  const t = useTranslations("OrderSummary");

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        onClick={() => router.push("/checkout")}
        aria-label={t("goCheckout")}
      >
        {t("goCheckout")}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push("/")}
        aria-label={t("continueShopping")}
      >
        {t("continueShopping")}
      </Button>
    </>
  );
});

OrderSummaryActions.displayName = "OrderSummaryActions";

export default OrderSummaryActions;
