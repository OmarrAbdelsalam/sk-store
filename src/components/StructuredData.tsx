import Script from "next/script";

interface OrganizationSchemaProps {
  locale?: string;
}

export function OrganizationSchema({ locale = "ar" }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HouseScrub",
    alternateName: locale === "ar" ? "هاوس سكراب" : "HouseScrub",
    slogan: locale === "ar" ? "السكراب الطبي رقم واحد في مصر" : "Egypt's #1 Medical Scrubs Store",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://scrubhousev1.vercel.app",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://scrubhousev1.vercel.app"}/yhouse-logo.png`,
    description:
      locale === "ar"
        ? "السكراب الطبي رقم واحد في مصر. متجر متخصص في بيع الزي الطبي الفاخر والإكسسوارات الطبية عالية الجودة. توصيل لجميع أنحاء مصر خلال 3-7 أيام عمل."
        : "Egypt's #1 Medical Scrubs Store. Specialized in luxury medical scrubs and high-quality medical accessories. Delivery to all parts of Egypt within 3-7 business days.",
    telephone: "+20-150-188-1005",
    email: "info@housescrub.com",
    address: [
      {
        "@type": "PostalAddress",
        addressLocality: locale === "ar" ? "المنصورة" : "Mansoura",
        addressRegion: locale === "ar" ? "الدقهلية" : "Dakahlia",
        addressCountry: "EG",
      },
      {
        "@type": "PostalAddress",
        addressLocality: locale === "ar" ? "طنطا" : "Tanta",
        addressRegion: locale === "ar" ? "الغربية" : "Gharbia",
        addressCountry: "EG",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+20-150-188-1005",
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
      areaServed: "EG",
    },
    sameAs: [
      // Add your social media links here
      // "https://facebook.com/housescrub",
      // "https://instagram.com/housescrub",
      // "https://twitter.com/housescrub",
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scrubhousev1.vercel.app";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HouseScrub - هاوس سكراب",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
  brand = "HouseScrub",
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
      answer: "التوصيل لجميع أنحاء مصر خلال 3-7 أيام عمل من تاريخ تأكيد الطلب.",
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
      answer: "يمكنك التواصل معنا عبر الواتساب على رقم 01501881005 أو عبر البريد الإلكتروني info@housescrub.com",
    },
    {
      question: "هل المنتجات أصلية؟",
      answer: "نعم، جميع منتجاتنا أصلية 100% ومصنوعة من خامات عالية الجودة مخصصة للاستخدام الطبي.",
    },
    {
      question: "أين مقر الشركة؟",
      answer: "لدينا فروع في المنصورة وطنطا، ونوفر التوصيل لجميع أنحاء مصر.",
    },
  ] : [
    {
      question: "What is the delivery time?",
      answer: "Delivery to all parts of Egypt within 3-7 business days from order confirmation.",
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
      answer: "You can contact us via WhatsApp at 01501881005 or via email at info@housescrub.com",
    },
    {
      question: "Are the products original?",
      answer: "Yes, all our products are 100% original and made from high-quality materials designed for medical use.",
    },
    {
      question: "Where is the company located?",
      answer: "We have branches in Mansoura and Tanta, and we deliver to all parts of Egypt.",
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
