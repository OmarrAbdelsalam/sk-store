"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-gutter py-16 text-center"
      dir={isAr ? "rtl" : "ltr"}
    >
      <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">404</p>
      <h1 className="mt-4 font-display text-[28px] leading-tight text-ink sm:text-[36px]">
        {isAr ? "الصفحة مش موجودة" : "Page not found"}
      </h1>
      <p className="mt-3 max-w-sm font-sans text-[14px] leading-6 text-gray-500">
        {isAr
          ? "الصفحة اللي بتدوري عليها مش موجودة أو اتنقلت."
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <Button asChild className="mt-8 h-12 px-10">
        <Link href="/products">
          {isAr ? "تسوقي الكل" : "Shop all bags"}
          <ArrowRight className="rtl:rotate-180" strokeWidth={1.5} />
        </Link>
      </Button>
      <Link href="/" className="mt-4 font-sans text-[13px] text-ink underline underline-offset-4 transition-opacity duration-fast hover:opacity-60">
        {isAr ? "الرجوع للرئيسية" : "Back to home"}
      </Link>
    </div>
  );
}
