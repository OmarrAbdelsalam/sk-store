import { Metadata } from "next";
import {
  siteBrand,
  siteDescriptionAr,
  siteDescriptionEn,
  siteOgImage,
  siteTaglineAr,
  siteTaglineEn,
  siteUrl,
} from "./site";

const siteName = `${siteBrand} | ${siteTaglineAr}`;
const siteDescription = siteDescriptionAr;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "SK Bags",
    "sk bags",
    "شنط هاند ميد",
    "شنط handmade",
    "شنط بريميم",
    "شنط كروشيه",
    "شنط يد",
    "شنط كتف",
    "شنط كروس",
    "شنط نسائية",
    "شنط مصر",
    "handmade bags Egypt",
    "premium handmade bags",
    "crochet bags",
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
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: siteOgImage,
        width: 1200,
        height: 630,
        alt: `${siteBrand} - ${siteTaglineAr}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteBrand} | ${siteTaglineEn}`,
    description: siteDescription,
    images: [siteOgImage],
    creator: "@skbags",
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
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/SK_Logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/SK_Logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export function generateDefaultMetadata(locale = "ar"): Metadata {
  const isAr = locale === "ar";
  const localizedTitle = `${siteBrand} | ${isAr ? siteTaglineAr : siteTaglineEn}`;
  const localizedDescription = isAr ? siteDescriptionAr : siteDescriptionEn;
  const localizedUrl = `${siteUrl}/${locale}`;

  return {
    ...defaultMetadata,
    title: {
      default: localizedTitle,
      template: `%s | ${siteBrand}`,
    },
    description: localizedDescription,
    alternates: {
      canonical: localizedUrl,
      languages: {
        ar: `${siteUrl}/ar`,
        en: `${siteUrl}/en`,
      },
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      locale: isAr ? "ar_EG" : "en_US",
      alternateLocale: isAr ? ["en_US"] : ["ar_EG"],
      url: localizedUrl,
      siteName: siteBrand,
      title: localizedTitle,
      description: localizedDescription,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: localizedTitle,
      description: localizedDescription,
    },
  };
}

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
  const normalizedPath = path === "" || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const localePath = locale ? `/${locale}${normalizedPath}` : normalizedPath || "/";
  const url = `${siteUrl}${localePath}`;
  const ogImage = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : siteOgImage;
  const resolvedDescription =
    description || (locale === "en" ? siteDescriptionEn : siteDescriptionAr);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: resolvedDescription,
    alternates: {
      canonical: url,
      languages: {
        ar: `${siteUrl}/ar${normalizedPath}`,
        en: `${siteUrl}/en${normalizedPath}`,
      },
    },
    openGraph: {
      title,
      description: resolvedDescription,
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
      description: resolvedDescription,
      images: [ogImage],
    },
  };
}
