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

const shippingRates: Record<string, number> = {
  "qalyubia,menoufia,gharbia,dakahlia,kafr,sharqia,beheira,damietta,cairo,giza,alexandria,القليوبية,المنوفية,الغربية,الدقهلية,الشرقية,البحيرة,دمياط,القاهرة,الجيزة,الإسكندرية": 75,
  "suez,ismailia,port,السويس,الإسماعيلية,بورسعيد": 85,
  "beni,fayoum,minya,assiut,sohag,qena,بني,الفيوم,المنيا,أسيوط,سوهاج,قنا": 85,
  "luxor,aswan,الأقصر,اسوان,أسوان": 100,
  "matrouh,sinai,valley,red,مطروح,سيناء,الوادي,البحر": 150
};

export function getShippingPrice(governorate: string, city: string): number {
  const v = (governorate || city || "").toLowerCase();
  for (const [keys, price] of Object.entries(shippingRates)) {
    if (keys.split(',').some(k => v.includes(k))) return price;
  }
  return 90;
}

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsAppNumber: string;
  governorate: string;
  city: string;
  area: string;
  street: string;
  buildingNo: string;
  apartment: string;
  detailedAddress: string;
  notes: string;
};

export const emptyFormData: CheckoutFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  whatsAppNumber: "",
  governorate: "",
  city: "",
  area: "",
  street: "",
  buildingNo: "",
  apartment: "",
  detailedAddress: "",
  notes: ""
};
