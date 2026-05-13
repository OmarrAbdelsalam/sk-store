"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import EmptyCart from "@/components/checkout/EmptyCart";
import { useRouter } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { useLocale, useTranslations } from "next-intl";
import { getShippingPrice, type CheckoutFormData } from "@/lib/checkout-utils";
import { API_ROUTES } from "@/lib/api-routes";

export default function Checkout() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const { items, getTotalPrice, clearCart, bogoDiscount, freeShippingApplied, appliedPromotions } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mounted, setMounted] = useState(false);
  const [discount, setDiscount] = useState<{ 
    amount: number; 
    percentage: number; 
    code: string;
    originalTotal: number;
    finalTotal: number;
  } | null>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('checkout_form_data');
        if (saved) {
          const data = JSON.parse(saved);
          if (data.governorate) {
            setSelectedGovernorate(data.governorate);
            const price = freeShippingApplied ? 0 : getShippingPrice(data.governorate, data.city || "");
            setShippingPrice(price);
          }
        }
      } catch (error) {
        console.error('Error loading saved governorate:', error);
      }
    }
  }, [freeShippingApplied]);

  // Update shipping price when governorate changes
  useEffect(() => {
    if (selectedGovernorate) {
      const price = freeShippingApplied ? 0 : getShippingPrice(selectedGovernorate, "");
      setShippingPrice(price);
    } else {
      setShippingPrice(0);
    }
  }, [selectedGovernorate, freeShippingApplied]);

  // Prefetch order-success page
  useEffect(() => {
    router.prefetch(`/${locale}/order-success`);
  }, [locale, router]);

  const nf = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale]
  );

  const handleSubmit = async (formData: CheckoutFormData & { paymentMethod: string }) => {
    setIsProcessing(true);
    const shipping = freeShippingApplied ? 0 : getShippingPrice(formData.governorate, formData.city);
    setShippingPrice(shipping);

    try {
      const sessionId = getOrCreateSessionId();
      
      if (items.length === 0) {
        throw new Error(isAr ? "السلة فارغة" : "Cart is empty");
      }
      
      const subtotal = getTotalPrice();
      const discountAmt = discount?.amount || 0;
      const bogoAmt = bogoDiscount || 0;
      const total = subtotal + shipping - discountAmt - bogoAmt;
      
      const payload = {
        sessionId,
        customerName: formData.name,
        phoneNumber: formData.phone,
        government: formData.governorate,
        city: formData.city,
        detailedAddress: formData.detailedAddress,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          nameAr: item.nameAr,
          image: item.image,
          colorId: item.colorId,
          colorName: item.colorName,
          sizeId: item.sizeId,
          sizeName: item.sizeName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        shippingCost: shipping,
        discountAmount: discountAmt,
        discountCode: discount?.code,
        bogoDiscount: bogoDiscount || 0,
        appliedPromotions: appliedPromotions || [],
        total,
      };

      // Save order summary to localStorage BEFORE API call
      try {
        localStorage.setItem('last_order_data', JSON.stringify({
          orderNumber: null,
          sessionId,
          customerName: formData.name,
          government: formData.governorate,
          city: formData.city,
          subtotal,
          shippingCost: shipping,
          discountAmount: discountAmt,
          total,
          items: items.map(item => ({
            productName: item.nameEn || item.name,
            productNameAr: item.nameAr || item.name,
            colorNameEn: item.colorName,
            colorNameAr: item.colorName,
            sizeName: item.sizeName,
            quantity: item.quantity,
            unitPrice: parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
            subtotal: (parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0) * item.quantity,
            image: item.image,
          })),
        }));
      } catch {}

      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      const res = await fetch(API_ROUTES.orders.create(), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      
      if (!res.ok || !response.succeeded) {
        const errorMsg = response.message || `Order API failed with status ${res.status}`;
        throw new Error(errorMsg);
      }

      try { 
        const saved = localStorage.getItem('last_order_data');
        if (saved) {
          const data = JSON.parse(saved);
          data.orderNumber = response.data?.orderNumber || response.data?.order_number || null;
          localStorage.setItem('last_order_data', JSON.stringify(data));
        }
      } catch {}
      
      setOrderCompleted(true);
      setOrderError(null);
      clearCart();
      const orderNum = response.data?.orderNumber || response.data?.order_number;
      router.push(`/${locale}/order-success${orderNum ? `?order=${orderNum}` : ''}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : typeof error === "string" ? error : t("genericErrorDesc");
      console.error('Order error:', message);
      setOrderError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen" dir={dir}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-px w-full bg-border" />
            <div className="h-8 w-48 bg-muted" />
            <div className="h-px w-full bg-border" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading while order is being processed or completed
  if (orderCompleted || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center space-y-6">
          <div className="animate-spin h-10 w-10 border-2 border-foreground border-t-transparent mx-auto" />
          <p className="text-sm tracking-widest uppercase text-muted-foreground">
            {orderCompleted ? t("redirecting") : t("processingOrder")}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <EmptyCart dir={dir} />;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.push(`/${locale}/cart`)} 
          className="hidden sm:inline-flex items-center gap-2 text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors mb-6"
          aria-label={t("backToCart")}
        >
          {isAr ? (
            <ArrowRight className="h-4 w-4" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          {t("backToCart")}
        </button>

        {/* Page Title */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">{t("checkoutTitle")}</h1>
          <div className="h-px w-16 bg-foreground mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Order Summary - shows last on mobile, first on desktop (right side) */}
          <div className="order-last lg:order-last lg:col-span-5 lg:sticky lg:top-24 lg:h-fit">
            <CheckoutOrderSummary 
              items={items} 
              totalPrice={getTotalPrice()} 
              shippingPrice={shippingPrice}
              discount={discount}
              onDiscountChange={setDiscount}
              disabled={isProcessing}
              phoneNumber={phoneNumber}
              freeShippingApplied={freeShippingApplied}
              bogoDiscount={bogoDiscount}
            />
          </div>

          {/* Form - shows first on mobile */}
          <div className="order-first lg:order-first lg:col-span-7 bg-[#F0EBE3] p-5 sm:p-8 border border-[#d4c9bc] rounded-sm">
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-sm mb-6">
                {orderError}
              </div>
            )}
            <CheckoutForm
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              totalAmount={nf.format(getTotalPrice() + shippingPrice - (discount?.amount || 0) - (bogoDiscount || 0))}
              onGovernorateChange={setSelectedGovernorate}
              onPhoneChange={setPhoneNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
