import { ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export default function EmptyCartContent() {
  const t = useTranslations("EmptyCart");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="text-center space-y-6" dir={dir} aria-live="polite">
      <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
    </div>
  );
}
