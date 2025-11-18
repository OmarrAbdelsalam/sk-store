"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PersonalInfoForm from "./PersonalInfoForm";
import ShippingAddressForm from "./ShippingAddressForm";
import { egyptGovernorates, type CheckoutFormData, emptyFormData } from "@/lib/checkout-utils";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

type Props = {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isProcessing: boolean;
  totalAmount: string;
  isLoggedIn?: boolean;
};

export default function CheckoutForm({ onSubmit, isProcessing, totalAmount, isLoggedIn = false }: Props) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('checkout_form_data');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return emptyFormData;
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try { localStorage.setItem('checkout_form_data', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isLoggedIn && (
        <PersonalInfoForm formData={formData} onInputChange={handleInputChange} />
      )}

      <ShippingAddressForm
        formData={formData}
        egyptGovernorates={egyptGovernorates}
        onInputChange={handleInputChange}
      />

      <Button 
        type="submit" 
        size="lg" 
        className="w-full" 
        disabled={isProcessing}
        onMouseEnter={() => router.prefetch(`/${locale}/order-success`)}
      >
        {isProcessing ? t("processing") : t("confirmOrder", { total: totalAmount, currency: "EGP" })}
      </Button>
    </form>
  );
}
