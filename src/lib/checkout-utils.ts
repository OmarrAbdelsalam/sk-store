export const egyptGovernorates = ["القاهرة","الجيزة","القليوبية","الدقهلية","البحيرة","الغربية","المنوفية","كفر الشيخ","دمياط","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","بني سويف","الفيوم","الوادي الجديد","الإسكندرية","البحر الأحمر","مطروح","شمال سيناء","جنوب سيناء","بورسعيد","الإسماعيلية","الشرقية","Cairo","Giza","Qalyubia","Dakahlia","Beheira","Gharbia","Menoufia","Kafr El-Sheikh","Damietta","Minya","Assiut","Sohag","Qena","Luxor","Aswan","Beni Suef","Fayoum","New Valley","Alexandria","Red Sea","Matrouh","North Sinai","South Sinai","Port Said","Ismailia","Sharqia"];

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
