import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";

type Props = {
  dir: "rtl" | "ltr";
};

/** Checkout with an empty bag — same empty state as the cart page. */
export default function EmptyCart({ dir }: Props) {
  const t = useTranslations("Checkout");
  const isAr = dir === "rtl";

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <CheckoutHeader cartLabel={isAr ? "الرجوع للسلة" : "Back to cart"} />
      <div className="flex flex-col items-center px-gutter py-16 text-center sm:py-24">
        <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">{t("emptyCartTitle")}</h1>
        <Button asChild className="mt-8 h-12 px-10">
          <Link href="/products">{t("goShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
