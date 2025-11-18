"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { getItemsNumber, getItemsPrice } from "@/lib/api/cart";
import { useLocale, useTranslations } from "next-intl";

type OrderSummaryProps = {
  totalItemsFallback: number;
  totalPriceFallback: number;
  shippingPrice?: number;
  currency?: string; // افتراضي "EGP"
};

const OrderSummary = ({
  totalItemsFallback,
  totalPriceFallback,
  shippingPrice = 0,
  currency = "EGP",
}: OrderSummaryProps) => {
  const router = useRouter();
  const t = useTranslations("OrderSummary");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [serverItems, setServerItems] = useState<number | null>(null);
  const [serverPrice, setServerPrice] = useState<number | null>(null);

  useEffect(() => {
    const sid = getOrCreateSessionId();
    Promise.all([getItemsNumber(sid), getItemsPrice(sid)])
      .then(([n, p]) => {
        if (typeof n === "number") setServerItems(n);
        if (typeof p === "number") setServerPrice(p);
      })
      .catch(() => {
        // تجاهل الفشل ونستخدم fallback
      });
  }, []);

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const items = serverItems ?? totalItemsFallback;
  const subtotal = serverPrice ?? totalPriceFallback;
  const total = subtotal + shippingPrice;

  return (
    <Card className="sticky top-8" dir={dir}>
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{t("itemsCount", { count: items })}</span>
            <span>
              {nf.format(subtotal)} {currency}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span>{t("shipping")}</span>
              <span className="text-muted-foreground text-sm">
                {t("shippingNote")}
              </span>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>{t("total")}</span>
              <span>
                {nf.format(total)} {currency}
              </span>
            </div>
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
