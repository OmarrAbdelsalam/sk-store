"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const t = useTranslations("ProductSpecifications");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="mt-12" dir={dir}>
      <Accordion type="single" collapsible className="w-full" defaultValue="materials-care">
        {/* Materials & Care - مفتوح افتراضياً */}
        <AccordionItem value="materials-care">
          <AccordionTrigger className="text-lg font-semibold">
            {t("materialsCareTitle")}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-muted-foreground">
              <p>{product.materials || t("noMaterials")}</p>
              <p>{product.care || t("noCare")}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shipping */}
        <AccordionItem value="shipping">
          <AccordionTrigger className="text-lg font-semibold">
            {t("shippingTitle")}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground leading-relaxed">
              {product.shipping || t("shippingText")}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Return & Exchange */}
        <AccordionItem value="return-exchange">
          <AccordionTrigger className="text-lg font-semibold">
            {t("returnExchangeTitle")}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground leading-relaxed">
              {product.returnExchange || t("returnExchangeText")}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
