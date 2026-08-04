"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function EmptyCartButton() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("EmptyCart");
  const isAr = locale === "ar";

  return (
    <Button 
      size="lg" 
      onClick={() => router.push("/")} 
      aria-label={t("cta")}
      className="h-12 px-8 text-sm font-bold tracking-wider uppercase rounded-lg
        bg-black text-white hover:bg-gray-800 
        transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
    >
      {t("cta")}
      {isAr ? (
        <ArrowLeft className="w-5 h-5 ms-2 group-hover:-translate-x-1 transition-transform" />
      ) : (
        <ArrowRight className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform" />
      )}
    </Button>
  );
}
