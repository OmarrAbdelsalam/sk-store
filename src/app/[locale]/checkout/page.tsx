"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import EmptyCart from "@/components/checkout/EmptyCart";
import { useRouter } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { useLocale, useTranslations } from "next-intl";
import { getShippingPrice, type CheckoutFormData } from "@/lib/checkout-utils";

export default function Checkout() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const dir = locale === "ar" ? "rtl" : "ltr";

  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(90);

  // Prefetch order-success page
  useEffect(() => {
    router.prefetch(`/${locale}/order-success`);
  }, [locale, router]);

  const nf = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale]
  );

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsProcessing(true);
    const shipping = getShippingPrice(formData.governorate, formData.city);
    setShippingPrice(shipping);

    try {
      const sessionId = getOrCreateSessionId();
      const payload = {
        sessionId,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        phoneNumber: formData.phone,
        whatsAppNumber: formData.whatsAppNumber || formData.phone,
        government: formData.governorate,
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

      if (!res.ok) throw new Error(`Order API failed with status ${res.status}`);

      const response = await res.json();
      try { localStorage.setItem('last_order_data', JSON.stringify(response.data)); } catch {}
      
      // Clear cart and navigate immediately for better UX
      clearCart();
      router.push(`/${locale}/order-success`);
      
      // Show toast after navigation starts
      setTimeout(() => {
        toast({
          title: t("orderSuccessTitle"),
          description: t("orderSuccessDesc", { shipping: nf.format(shipping), currency: "EGP" }),
          duration: 5000,
        });
      }, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : typeof error === "string" ? error : t("genericErrorDesc");
      toast({ title: t("genericErrorTitle"), description: message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return <EmptyCart dir={dir} />;

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/cart")} className="mb-8" aria-label={t("backToCart")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToCart")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t("checkoutTitle")}</h1>
            <CheckoutForm
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              totalAmount={nf.format(getTotalPrice() + shippingPrice)}
            />
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <CheckoutOrderSummary items={items} totalPrice={getTotalPrice()} shippingPrice={shippingPrice} />
          </div>
        </div>
      </div>
    </div>
  );
}
