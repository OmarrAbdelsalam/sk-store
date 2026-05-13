import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  dir: "rtl" | "ltr";
};

export default function EmptyCart({ dir }: Props) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  
  return (
    <div className="min-h-screen" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider uppercase mb-4">{t("emptyCartTitle")}</h1>
        <div className="h-px w-16 bg-foreground mx-auto mb-8" />
        <Link href={`/${locale}`}>
          <button className="h-12 px-10 bg-foreground text-background text-xs font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors">
            {t("goShopping")}
          </button>
        </Link>
      </div>
    </div>
  );
}
