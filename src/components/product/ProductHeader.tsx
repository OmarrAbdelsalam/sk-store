"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

interface ProductHeaderProps {
  onBack: () => void;
}

const ProductHeader = ({ onBack }: ProductHeaderProps) => {
  const locale = useLocale();
  const t = useTranslations("ProductHeader");
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir}>
      <Button
        variant="ghost"
        onClick={onBack}
        className={clsx("mb-0 md:mb-8", dir === "rtl" ? "ml-0" : "mr-0")}
        aria-label={t("back")}
      >
        <ArrowLeft
          className={clsx(
            "h-4 w-4",
            dir === "rtl" ? "ml-2 rotate-180" : "mr-2"
          )}
        />
        <span>{t("back")}</span>
      </Button>
    </div>
  );
};

export default ProductHeader;
