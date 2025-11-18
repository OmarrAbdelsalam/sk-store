"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

const EmptyCart = () => {
  const router = useRouter();
  const t = useTranslations("EmptyCart");
  const locale = useLocale();
  const dir = useMemo(() => (locale === "ar" ? "rtl" : "ltr"), [locale]);

  return (
    <div className="text-center space-y-6" dir={dir} aria-live="polite">
      <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      <Button size="lg" onClick={() => router.push("/")} aria-label={t("cta")}>
        {t("cta")}
      </Button>
    </div>
  );
};

export default EmptyCart;
