// معلومات الاتصال والعنوان
export const CONTACT_INFO = {
  // Single contact number for the whole store — storefront, footer,
  // order-success and admin follow-ups all read from here.
  phone: "01016887251",
  phoneFormatted: "+20 10 1688 7251",
  phoneInternational: "+20-10-1688-7251",
  whatsapp: "201016887251",
  whatsappLink: "https://wa.me/201016887251",

  email: "info@skbags.com",
  
  locations: {
    ar: [
      {
        city: "المنصورة",
        region: "الدقهلية",
        country: "مصر",
      },
      {
        city: "طنطا",
        region: "الغربية",
        country: "مصر",
      },
    ],
    en: [
      {
        city: "Mansoura",
        region: "Dakahlia",
        country: "Egypt",
      },
      {
        city: "Tanta",
        region: "Gharbia",
        country: "Egypt",
      },
    ],
  },
  
  social: {
    // أضف روابط السوشيال ميديا هنا
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

// معلومات الشحن
export const SHIPPING_INFO = {
  // Made to order, not shipped from stock — the window covers the making, not
  // just the courier. Keep in step with `shippingText`/`shippingInfoBody` in
  // messages/*.json, the FAQ answers in StructuredData, and DELIVERY_WINDOW in
  // email-templates: a customer who sees two different numbers believes the
  // shorter one.
  deliveryTime: {
    ar: "7-10 أيام",
    en: "7-10 days",
  },
  coverage: {
    ar: "جميع أنحاء مصر",
    en: "All over Egypt",
  },
};

// سياسة الإرجاع
export const RETURN_POLICY = {
  period: {
    ar: "14 يوماً",
    en: "14 days",
  },
  conditions: {
    ar: "بشرط أن تكون القطعة بحالتها الأصلية",
    en: "Provided the item is in its original condition",
  },
};
