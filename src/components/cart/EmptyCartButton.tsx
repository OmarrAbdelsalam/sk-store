"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function EmptyCartButton() {
  const router = useRouter();
  const t = useTranslations("EmptyCart");

  return (
    <Button size="lg" onClick={() => router.push("/")} aria-label={t("cta")}>
      {t("cta")}
    </Button>
  );
}
