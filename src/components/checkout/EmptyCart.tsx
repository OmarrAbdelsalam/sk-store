import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type Props = {
  dir: "rtl" | "ltr";
};

export default function EmptyCart({ dir }: Props) {
  const t = useTranslations("Checkout");
  
  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("emptyCartTitle")}</h1>
        <Link href="/">
          <Button>{t("goShopping")}</Button>
        </Link>
      </div>
    </div>
  );
}
