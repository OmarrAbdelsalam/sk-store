import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scrubhousev1.vercel.app";
const siteName = "HouseScrub - هاوس سكراب | السكراب الطبي رقم واحد في مصر";
const siteDescription = "HouseScrub - السكراب الطبي رقم واحد في مصر. متجر متخصص في بيع الزي الطبي الفاخر والإكسسوارات الطبية عالية الجودة. توصيل لجميع أنحاء مصر خلال 3-7 أيام. فروع في المنصورة وطنطا. للتواصل: 01501881005";
const phoneNumber = "+20-150-188-1005";
const whatsappNumber = "201501881005";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | الزي الطبي الفاخر`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "زي طبي",
    "سكراب طبي",
    "ملابس طبية",
    "إكسسوارات طبية",
    "زي تمريض",
    "medical scrubs",
    "medical uniforms",
    "healthcare apparel",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName,
    title: `${siteName} | الزي الطبي الفاخر`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/yhouse-logo.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} Logo`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | الزي الطبي الفاخر`,
    description: siteDescription,
    images: [`${siteUrl}/yhouse-logo.png`],
    creator: "@housescrub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/yhouse-logo.png", sizes: "any" }, // مؤقت - استبدل بـ favicon.ico
      { url: "/yhouse-logo.png", sizes: "192x192", type: "image/png" }, // مؤقت - استبدل بـ icon-192.png
    ],
    apple: [
      { url: "/yhouse-logo.png", sizes: "180x180", type: "image/png" }, // مؤقت - استبدل بـ apple-icon.png
    ],
    shortcut: "/yhouse-logo.png", // مؤقت
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export function generatePageMetadata({
  title,
  description,
  image,
  path = "",
  locale = "ar",
}: {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  locale?: string;
}): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/yhouse-logo.png`;

  return {
    title,
    description: description || siteDescription,
    alternates: {
      canonical: url,
      languages: {
        ar: `${siteUrl}/ar${path}`,
        en: `${siteUrl}/en${path}`,
      },
    },
    openGraph: {
      title,
      description: description || siteDescription,
      url,
      siteName,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || siteDescription,
      images: [ogImage],
    },
  };
}
