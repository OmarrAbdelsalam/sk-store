"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ProductHeaderProps {
  onBack: () => void;
  productName?: string;
}

const ProductHeader = ({ productName }: ProductHeaderProps) => {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="flex items-center gap-2 text-sm mb-6 text-gray-500 font-medium">
      <Link href="/" className="hover:text-black transition-colors">
        {locale === 'ar' ? 'الرئيسية' : 'Home'}
      </Link>
      <span>/</span>
      <Link href="/products" className="hover:text-black transition-colors">
        {locale === 'ar' ? 'المنتجات' : 'Products'}
      </Link>
      <span>/</span>
      <span className="text-black truncate max-w-[200px] md:max-w-none">
        {productName || (locale === 'ar' ? 'جاري التحميل...' : 'Loading...')}
      </span>
    </div>
  );
};

export default ProductHeader;
