import { ShoppingBag, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function EmptyCartContent() {
  const t = useTranslations("EmptyCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="text-center py-12" dir={dir} aria-live="polite">
      {/* أيقونة متحركة */}
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="relative p-6 bg-gradient-to-br from-secondary to-secondary/50 rounded-full">
          <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground" />
        </div>
        {/* نجوم صغيرة للتزيين */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary/40 animate-bounce" />
        <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-primary/30 animate-bounce delay-150" />
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t("title")}</h1>
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
        {t("subtitle")}
      </p>
    </div>
  );
}
