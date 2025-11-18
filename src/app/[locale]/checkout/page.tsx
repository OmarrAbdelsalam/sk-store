"use client";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import PersonalInfoForm from "@/components/checkout/PersonalInfoForm";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrCreateSessionId } from "@/lib/session";
import { useLocale, useTranslations } from "next-intl";

/* ======================= Types ======================= */
type CheckoutFormData = {
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

/* ======================= Data ======================= */
// نفس قائمة المحافظات (AR/EN)
const egyptGovernorates: string[] = [
  "القاهرة","الجيزة","القليوبية","الدقهلية","البحيرة","الغربية","المنوفية","كفر الشيخ","دمياط",
  "المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان","بني سويف","الفيوم","الوادي الجديد",
  "الإسكندرية","البحر الأحمر","مطروح","شمال سيناء","جنوب سيناء","بورسعيد","الإسماعيلية","الشرقية",
  "Cairo","Giza","Qalyubia","Dakahlia","Beheira","Gharbia","Menoufia","Kafr El-Sheikh","Damietta",
  "Minya","Assiut","Sohag","Qena","Luxor","Aswan","Beni Suef","Fayoum","New Valley",
  "Alexandria","Red Sea","Matrouh","North Sinai","South Sinai","Port Said","Ismailia","Sharqia"
] as const;

// مجموعات السيرفر (AR/EN) لحساب الشحن تقريبياً محلياً
const deltaGovs = [
  "qalyubia","menoufia","gharbia","dakahlia","kafr el-sheikh","sharqia","beheira","damietta","cairo","giza","alexandria",
  "القليوبية","المنوفية","الغربية","الدقهلية","كفر الشيخ","الشرقية","البحيرة","دمياط","القاهرة","الجيزة","الإسكندرية"
];
const canalGovs = ["suez","ismailia","port said","السويس","الإسماعيلية","بورسعيد"];
const upperGovs = ["beni suef","fayoum","minya","assiut","sohag","qena","بني سويف","الفيوم","المنيا","أسيوط","سوهاج","قنا"];
const luxorAndAswan = ["luxor","aswan","الأقصر","اسوان","أسوان"];
const borderGovs = ["matrouh","north sinai","south sinai","new valley","red sea","sinai","مطروح","شمال سيناء","جنوب سيناء","الوادي الجديد","البحر الأحمر","سيناء"];

/* ======================= Utils ======================= */
// حساب الشحن بنفس منطق السيرفر التقريبي
function getServerLikeShipping(governorate: string, city: string): number {
  const v = (governorate || city || "").toLowerCase().trim();
  const containsAny = (arr: string[]) => arr.some((g) => v.includes(g.toLowerCase()));
  if (containsAny(deltaGovs)) return 75;
  if (containsAny(canalGovs)) return 85;
  if (containsAny(upperGovs)) return 85;
  if (containsAny(luxorAndAswan)) return 100;
  if (containsAny(borderGovs)) return 150;
  return 90; // default
}

/* ======================= Component ======================= */
const Checkout = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoggedIn] = useState<boolean>(false); // لو عندك Auth فعلي بدّله

  // Load saved data from localStorage
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('checkout_form_data');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
      }
    }
    return {
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
      notes: "",
    };
  });

  const shippingPrice = useMemo(
    () => getServerLikeShipping(formData.governorate, formData.city),
    [formData.governorate, formData.city]
  );

  const nf = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale]
  );

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Save to localStorage
      try {
        localStorage.setItem('checkout_form_data', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving checkout data:', error);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const customerName = `${formData.firstName} ${formData.lastName}`.trim();
      const sessionId = getOrCreateSessionId();

      const payload = {
        sessionId,
        customerName,
        phoneNumber: formData.phone,
        whatsAppNumber: formData.whatsAppNumber || formData.phone,
        government: formData.governorate, // ابعت نص المحافظة كما هو
        city: formData.city,
        area: formData.area,
        street: formData.street || formData.detailedAddress,
        buildingNo: formData.buildingNo,
        apartment: formData.apartment,
        notes: formData.notes,
      };

      const res = await fetch("https://scrubstore.runasp.net/api/Orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Order API failed with status ${res.status}`);
      }

      const response = await res.json();
      
      // Save order response data
      try {
        localStorage.setItem('last_order_data', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error saving order data:', error);
      }

      clearCart();

      toast({
        title: t("orderSuccessTitle"),
        description: t("orderSuccessDesc", {
          shipping: nf.format(shippingPrice),
          currency: "EGP",
        }),
        duration: 5000,
      });

      router.push("/order-success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : t("genericErrorDesc");
      toast({
        title: t("genericErrorTitle"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center" dir={dir}>
        <h1 className="text-3xl font-bold mb-4">{t("emptyCartTitle")}</h1>
        <Link href="/"><Button>{t("goShopping")}</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/cart")}
          className="mb-8"
          aria-label={t("backToCart")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToCart")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t("checkoutTitle")}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoggedIn && (
                <PersonalInfoForm formData={formData} onInputChange={handleInputChange} />
              )}

              <ShippingAddressForm
                formData={formData}
                egyptGovernorates={egyptGovernorates as unknown as string[]} // فرضاً أن الـ prop يقبل string[]
                onInputChange={handleInputChange}
              />

              <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                {isProcessing
                  ? t("processing")
                  : t("confirmOrder", {
                      total: nf.format(getTotalPrice() + shippingPrice),
                      currency: "EGP",
                    })}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <CheckoutOrderSummary
              items={items}
              totalPrice={getTotalPrice()}
              shippingPrice={shippingPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
