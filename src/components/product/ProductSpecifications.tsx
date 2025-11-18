"use client";

import { useLocale, useTranslations } from "next-intl";

interface ProductSpecificationsProps {
  product: {
    longDescription?: string;
    materials?: string;
    care?: string;
    category: string;
  };
}

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const t = useTranslations("ProductSpecifications");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="mt-12 space-y-8" dir={dir}>
      {/* Materials & Care Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">{t("materialsCareTitle")}</h3>
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {product.materials || t("noMaterials")}
          </p>
          <p className="text-muted-foreground">
            {product.care || t("noCare")}
          </p>
        </div>
      </div>

      {/* Shipping & Returns Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">{t("shippingReturnsTitle")}</h3>
        <p className="text-muted-foreground leading-relaxed">{t("shippingReturnsText")}</p>
      </div>
    </div>
  );
};

export default ProductSpecifications;
