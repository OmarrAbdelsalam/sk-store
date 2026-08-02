// Governorates with both Arabic and English names
export const egyptGovernoratesAr = [
  "القاهرة",
  "الجيزة", 
  "الإسكندرية",
  "القليوبية",
  "الدقهلية",
  "الشرقية",
  "البحيرة",
  "الغربية",
  "المنوفية",
  "كفر الشيخ",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "المنيا",
  "بني سويف",
  "الفيوم",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
  "شمال سيناء",
  "جنوب سيناء"
];

export const egyptGovernoratesEn = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Dakahlia",
  "Sharqia",
  "Beheira",
  "Gharbia",
  "Menoufia",
  "Kafr El-Sheikh",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "Minya",
  "Beni Suef",
  "Fayoum",
  "Assiut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai"
];

// For backward compatibility
export const egyptGovernorates = egyptGovernoratesAr;

/**
 * Courier tariff (El-Tayar express).
 *
 * Anything not listed by the courier ships at the default rate — Giza, Red Sea,
 * New Valley, Matrouh and Sinai fall here.
 */
export const DEFAULT_SHIPPING_PRICE = 100;

const SHIPPING_TARIFF: {
  price: number;
  governorates: string[];
  /** Extra spellings, e.g. a city given instead of its governorate. */
  aliases?: string[];
}[] = [
  {
    price: 85,
    governorates: ["Dakahlia", "Gharbia", "Kafr El-Sheikh"],
    // Mansoura is Dakahlia's capital and gets typed in place of it often enough
    // to be worth matching.
    aliases: ["المنصورة", "Mansoura", "El Mansoura"],
  },
  {
    price: 100,
    governorates: [
      "Cairo",
      "Alexandria",
      "Qalyubia",
      "Beheira",
      "Sharqia",
      "Menoufia",
      "Ismailia",
      "Suez",
      "Port Said",
      "Damietta",
    ],
  },
  {
    price: 130,
    governorates: [
      "Fayoum",
      "Beni Suef",
      "Minya",
      "Assiut",
      "Sohag",
      "Qena",
      "Luxor",
      "Aswan",
    ],
  },
];

/**
 * Arabic is written inconsistently — أ/إ/آ for ا, ة for ه, ى for ي — and a
 * mismatch here silently falls through to the default rate, so every spelling
 * has to collapse to the same key.
 */
function normalize(value: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "") // diacritics + tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

// Built once: every Arabic and English spelling mapped to its price.
const SHIPPING_BY_NAME: Map<string, number> = (() => {
  const map = new Map<string, number>();

  for (const { price, governorates, aliases } of SHIPPING_TARIFF) {
    for (const nameEn of governorates) {
      map.set(normalize(nameEn), price);
      const index = egyptGovernoratesEn.indexOf(nameEn);
      if (index !== -1) {
        map.set(normalize(egyptGovernoratesAr[index]), price);
      }
    }
    for (const alias of aliases || []) {
      map.set(normalize(alias), price);
    }
  }

  return map;
})();

export function getShippingPrice(governorate: string, city: string): number {
  const value = normalize(governorate || city || "");
  if (!value) return DEFAULT_SHIPPING_PRICE;

  const exact = SHIPPING_BY_NAME.get(value);
  if (exact !== undefined) return exact;

  // The value may carry extra words ("محافظة الغربية", "Cairo Governorate").
  for (const [name, price] of SHIPPING_BY_NAME) {
    if (value.includes(name)) return price;
  }

  return DEFAULT_SHIPPING_PRICE;
}

export type CheckoutFormData = {
  name: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  notes: string;
};

export const emptyFormData: CheckoutFormData = {
  name: "",
  phone: "",
  email: "",
  governorate: "",
  city: "",
  detailedAddress: "",
  notes: ""
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * Deliberately permissive — it only rejects what is certainly not an address.
 * A stricter pattern rejects valid real-world addresses, and the cost of a
 * wrongly blocked checkout is far higher than the cost of a bad address.
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
