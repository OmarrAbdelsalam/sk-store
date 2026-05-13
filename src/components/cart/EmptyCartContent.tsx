import { ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function EmptyCartContent() {
  const t = useTranslations("EmptyCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="text-center py-12" dir={dir} aria-live="polite">
      {/* أيقونة بسيطة */}
      <div className="relative inline-block mb-8">
        <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ShoppingBag className="h-20 w-20 text-gray-500 dark:text-gray-500" strokeWidth={1.5} />
        </div>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">{t("title")}</h1>
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
        {t("subtitle")}
      </p>
    </div>
  );
}
