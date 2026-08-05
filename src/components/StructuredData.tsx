import Script from "next/script";
import {
  siteBrand,
  siteContact,
  siteDescriptionAr,
  siteDescriptionEn,
  siteLogo,
  siteTaglineAr,
  siteTaglineEn,
  siteUrl,
} from "@/lib/site";

interface OrganizationSchemaProps {
  locale?: string;
}

export function OrganizationSchema({ locale = "ar" }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteBrand,
    alternateName: locale === "ar" ? "اس كي باجز" : siteBrand,
    slogan: locale === "ar" ? siteTaglineAr : siteTaglineEn,
    url: siteUrl,
    logo: siteLogo,
    description: locale === "ar" ? siteDescriptionAr : siteDescriptionEn,
    telephone: siteContact.phoneInternational,
    areaServed: {
      "@type": "Country",
      name: locale === "ar" ? "مصر" : "Egypt",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteContact.phoneInternational,
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
      areaServed: "EG",
    },
    sameAs: [
      "https://www.instagram.com/skbags/",
      "https://www.facebook.com/skbags/",
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  locale?: string;
}

export function WebsiteSchema({ locale = "ar" }: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: locale === "ar" ? `${siteBrand} - شنط هاند ميد بريميم` : siteBrand,
    url: siteUrl,
    description: locale === "ar" ? siteDescriptionAr : siteDescriptionEn,
    inLanguage: locale === "ar" ? "ar-EG" : "en-US",
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = "EGP",
  availability = "InStock",
  brand = siteBrand,
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    },
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  locale?: string;
}

export function FAQSchema({ locale = "ar" }: FAQSchemaProps) {
  const faqs = locale === "ar" ? [
    {
      question: "ما هي مدة التوصيل؟",
      answer: "كل شنطة تُصنع خصيصًا لطلبك وتُخاط يدويًا بعد الطلب، لذلك يصل الطلب خلال 7-10 أيام من تاريخ تأكيد الطلب لجميع أنحاء مصر.",
    },
    {
      question: "هل يمكن استرجاع أو استبدال المنتج؟",
      answer: "نعم، يمكن الاسترجاع والاستبدال خلال 14 يوماً من الاستلام بشرط أن تكون القطعة بحالتها الأصلية. يتحمل العميل مصاريف الشحن إلا في حالة وجود عيب صناعة.",
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نوفر الدفع عند الاستلام لجميع المحافظات في مصر.",
    },
    {
      question: "كيف يمكنني التواصل معكم؟",
      answer: `يمكنك التواصل معنا عبر الواتساب على رقم ${siteContact.phone}.`,
    },
    {
      question: "هل المنتجات أصلية؟",
      answer: "نعم، منتجات SK Bags هاند ميد ومصنوعة من خامات عالية الجودة مع اهتمام بالتفاصيل والتشطيب.",
    },
    {
      question: "هل التوصيل متاح لكل المحافظات؟",
      answer: "نعم، نوفر التوصيل لكل أنحاء مصر.",
    },
  ] : [
    {
      question: "What is the delivery time?",
      answer: "Every bag is made for your order and stitched by hand after you order, so delivery takes 7-10 days from order confirmation, anywhere in Egypt.",
    },
    {
      question: "Can I return or exchange the product?",
      answer: "Yes, returns and exchanges are available within 14 days of receipt, provided the item is in its original condition. The customer bears shipping costs except in case of manufacturing defect.",
    },
    {
      question: "What payment methods are available?",
      answer: "We offer cash on delivery for all governorates in Egypt.",
    },
    {
      question: "How can I contact you?",
      answer: `You can contact us via WhatsApp at ${siteContact.phone}.`,
    },
    {
      question: "Are the products original?",
      answer: "Yes, SK Bags products are handmade from high-quality materials with careful finishing and attention to detail.",
    },
    {
      question: "Do you deliver across Egypt?",
      answer: "Yes, delivery is available across Egypt.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ReviewSchemaProps {
  productName: string;
  ratingValue?: number;
  reviewCount?: number;
  bestRating?: number;
}

export function ReviewSchema({
  productName,
  ratingValue = 4.5,
  reviewCount = 89,
  bestRating = 5,
}: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: bestRating.toString(),
      worstRating: "1",
    },
  };

  return (
    <Script
      id="review-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
