"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ProductHeaderProps {
  onBack?: () => void;
  productName?: string;
}

const ProductHeader = ({ productName }: ProductHeaderProps) => {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <nav dir={dir} className="ds-gutter ds-label hidden items-center gap-2 py-4 text-gray-500 lg:flex">
      <Link href="/" className="transition-colors duration-fast hover:text-ink">
        {locale === 'ar' ? 'الرئيسية' : 'Home'}
      </Link>
      <span>/</span>
      <Link href="/products" className="transition-colors duration-fast hover:text-ink">
        {locale === 'ar' ? 'المنتجات' : 'Products'}
      </Link>
      <span>/</span>
      <span className="truncate text-ink">
        {productName || <span className="inline-block h-2.5 w-32 animate-pulse bg-gray-100 align-middle" aria-hidden="true" />}
      </span>
    </nav>
  );
};

export default ProductHeader;
