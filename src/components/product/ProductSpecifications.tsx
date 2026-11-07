"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { highlightDescription } from "@/components/product/ProductInfo";

interface ProductSpecificationsProps {
  product: {
    longDescription?: string;
    materials?: string;
    care?: string;
    shipping?: string;
    returnExchange?: string;
    category: string;
  };
}

type TabKey = "services" | "description" | "details" | "care";

/**
 * PDP information tabs (DESIGN_SYSTEM.md › Product page): `text-button`
 * labels, the active one underlined, content in `.ds-fine`.
 */
export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const t = useTranslations("ProductSpecifications");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const hasDescription = !!product.longDescription?.trim();
  // Details only when there is something real to say.
  const hasDetails = !!(product.category?.trim() || product.materials?.trim());
  const [active, setActive] = useState<TabKey>(hasDescription ? "description" : "services");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "services", label: isAr ? "الخدمات" : "Services" },
    ...(hasDescription ? [{ key: "description" as const, label: t("descriptionTitle") }] : []),
    ...(hasDetails ? [{ key: "details" as const, label: isAr ? "التفاصيل" : "Details" }] : []),
    { key: "care", label: isAr ? "العناية" : "Care" },
  ];

  return (
    <div dir={dir}>
      <div role="tablist" className="flex flex-wrap gap-x-4 gap-y-2">
        {tabs.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`pdp-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`pdp-panel-${tab.key}`}
              onClick={() => setActive(tab.key)}
              className={cn(
                "font-sans text-button tracking-button uppercase text-ink underline-offset-4 transition-opacity duration-fast",
                selected ? "underline" : "hover:opacity-60"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`pdp-panel-${active}`}
        aria-labelledby={`pdp-tab-${active}`}
        className="ds-fine mt-4 flex flex-col gap-3"
      >
        {active === "services" && (
          <>
            <div>
              <p className="text-ink">{t("shippingTitle")}</p>
              <p>{product.shipping || t("shippingText")}</p>
            </div>
            <div>
              <p className="text-ink">{t("returnExchangeTitle")}</p>
              <p>{product.returnExchange || t("returnExchangeText")}</p>
            </div>
          </>
        )}

        {active === "description" && (
          <p>
            {hasDescription ? highlightDescription(product.longDescription!) : t("noDescription")}
          </p>
        )}

        {active === "details" && (
          <>
            {product.category && (
              <p>
                <span className="text-ink">{isAr ? "الفئة: " : "Category: "}</span>
                {product.category}
              </p>
            )}
            {product.materials && (
              <p>
                <span className="text-ink">{isAr ? "الخامة: " : "Material: "}</span>
                {product.materials}
              </p>
            )}
          </>
        )}

        {active === "care" && <p>{product.care || t("noCare")}</p>}
      </div>
    </div>
  );
}
