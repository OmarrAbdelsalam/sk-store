"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NotFound() {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === "ar";

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-4"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 404 number */}
      <p className="text-[120px] sm:text-[160px] font-light leading-none tracking-tighter text-foreground/8 select-none">
        404
      </p>

      {/* Divider */}
      <div className="h-px w-16 bg-foreground mb-8 -mt-4" />

      {/* Heading */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-widest uppercase text-foreground mb-4 text-center">
        {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground tracking-wider text-center max-w-xs mb-10">
        {isAr
          ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها"
          : "The page you're looking for doesn't exist or has been moved"}
      </p>

      {/* CTA */}
      <button
        onClick={() => router.push(`/${locale}`)}
        className="inline-flex items-center gap-2.5 h-12 px-10 rounded-full bg-foreground text-background text-xs font-medium tracking-widest uppercase hover:bg-foreground/90 transition-all hover:scale-[1.02] shadow-md"
      >
        {isAr ? (
          <>
            {isAr ? "العودة للرئيسية" : "Back to Home"}
            <ArrowLeft className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </>
        )}
      </button>
    </div>
  );
}
