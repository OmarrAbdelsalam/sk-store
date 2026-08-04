/**
 * The live storefront.
 *
 * Hardcoded rather than read from the environment, because everything the
 * customer is sent — the link back from the payment gateway, the order email,
 * the cart recovery link — is built from it, and a missing NEXT_PUBLIC_SITE_URL
 * on the host silently turned every one of those into `http://localhost:3000`.
 * A deploy is not the place to discover that.
 */
export const PRODUCTION_SITE_URL = "https://sk-bags.com";

// Only development reads the environment, so a local server still links to
// itself. Production always addresses the real domain.
export const siteUrl =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"
    : PRODUCTION_SITE_URL;

export const siteBrand = "SK Bags";

export const siteTaglineAr = "شنط هاند ميد بريميم بتوصيل لكل أنحاء مصر";
export const siteTaglineEn = "Premium handmade bags delivered across Egypt";

export const siteDescriptionAr =
  "SK Bags براند مصري متخصص في شنط هاند ميد بريميم بتصميمات أنيقة وخامات عالية الجودة، مع توصيل لكل أنحاء مصر.";

export const siteDescriptionEn =
  "SK Bags is an Egyptian brand for premium handmade bags, crafted with elegant designs and high-quality materials, with delivery across Egypt.";

export const siteOgImage = "https://shahdkarem-bags.vercel.app/opengraph-image";
export const siteLogo = `${siteUrl}/SK_Logo.svg`;

// No public email address on purpose: customer contact runs through WhatsApp,
// and the order mailbox is send-only. Publishing an address nobody reads is
// worse than publishing none.
export const siteContact = {
  phone: "01016887251",
  phoneInternational: "+20-10-1688-7251",
  whatsapp: "201016887251",
};
