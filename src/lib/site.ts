export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const siteBrand = "SK Bags";

export const siteTaglineAr = "شنط هاند ميد بريميم بتوصيل لكل أنحاء مصر";
export const siteTaglineEn = "Premium handmade bags delivered across Egypt";

export const siteDescriptionAr =
  "SK Bags براند مصري متخصص في شنط هاند ميد بريميم بتصميمات أنيقة وخامات عالية الجودة، مع توصيل لكل أنحاء مصر.";

export const siteDescriptionEn =
  "SK Bags is an Egyptian brand for premium handmade bags, crafted with elegant designs and high-quality materials, with delivery across Egypt.";

export const siteOgImage = `${siteUrl}/opengraph-image`;
export const siteLogo = `${siteUrl}/SK_Logo.svg`;

export const siteContact = {
  phone: "01501881005",
  phoneInternational: "+20-150-188-1005",
  whatsapp: "201501881005",
  email: "info@skbags.com",
};
