import { OrganizationSchema, WebsiteSchema, FAQSchema } from "./StructuredData";

interface SEOHeadProps {
  locale: string;
}

export default function SEOHead({ locale }: SEOHeadProps) {
  return (
    <>
      <OrganizationSchema locale={locale} />
      <WebsiteSchema locale={locale} />
      <FAQSchema locale={locale} />
    </>
  );
}
