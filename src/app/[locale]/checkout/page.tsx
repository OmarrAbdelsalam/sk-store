"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import EmptyCart from "@/components/checkout/EmptyCart";
import { useRouter } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { useLocale, useTranslations } from "next-intl";
import { getShippingPrice, type CheckoutFormData } from "@/lib/checkout-utils";
import { API_ROUTES } from "@/lib/api-routes";
// clearCartAPI not needed - server clears cart automatically after order

export default function Checkout() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const { items, getTotalPrice, clearCart, bogoDiscount, freeShippingApplied, appliedPromotions, discountCode, discountAmount } = useCart();
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
    
    // Load saved governorate from localStorage and calculate shipping
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
  }, []);

  // Update shipping price when governorate changes
  useEffect(() => {
    if (selectedGovernorate) {
      const price = freeShippingApplied ? 0 : getShippingPrice(selectedGovernorate, "");
      console.log('Governorate selected:', selectedGovernorate, 'Price:', price, 'Free shipping:', freeShippingApplied);
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
      
      // Check if cart has items
      if (items.length === 0) {
        throw new Error(isAr ? "السلة فارغة" : "Cart is empty");
      }
      
      console.log('Cart items before order:', items);
      
      // Calculate totals
      const subtotal = getTotalPrice();
      const discountAmt = discount?.amount || 0;
      const total = subtotal + shipping - discountAmt;
      
      const payload = {
        sessionId,
        customerName: formData.name,
        phoneNumber: formData.phone,
        government: formData.governorate,
        city: formData.city,
        detailedAddress: formData.detailedAddress,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        // Include cart details
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

      console.log('Sending order payload:', payload);

      // Save order summary to localStorage BEFORE API call so it's available on success page
      try {
        localStorage.setItem('last_order_data', JSON.stringify({
          orderNumber: null, // will be updated after API response
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
      console.log('Order API response:', response);
      
      // Check if the API returned an error
      if (!res.ok || !response.succeeded) {
        const errorMsg = response.message || `Order API failed with status ${res.status}`;
        throw new Error(errorMsg);
      }

      try { 
        // Update order number after successful API response
        const saved = localStorage.getItem('last_order_data');
        if (saved) {
          const data = JSON.parse(saved);
          data.orderNumber = response.data?.orderNumber || response.data?.order_number || null;
          localStorage.setItem('last_order_data', JSON.stringify(data));
        }
      } catch {}
      
      // Mark order as completed before clearing cart to prevent EmptyCart flash
      setOrderCompleted(true);
      setOrderError(null);
      
      // Server automatically clears cart after order, just clear local state
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

  // Show loading while order is being processed or completed (navigating to success page)
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
          onClick={() => router.push("/cart")} 
          className="hidden sm:inline-flex items-center gap-2 text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors mb-8 sm:mb-12"
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
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">{t("checkoutTitle")}</h1>
          <div className="h-px w-16 bg-foreground mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          <div className="order-first lg:order-last lg:col-span-5 lg:sticky lg:top-8 lg:h-fit">
            <CheckoutOrderSummary 
              items={items} 
              totalPrice={getTotalPrice()} 
              shippingPrice={shippingPrice}
              discount={discount}
              onDiscountChange={setDiscount}
              disabled={isProcessing}
              phoneNumber={phoneNumber}
              freeShippingApplied={freeShippingApplied}
            />
          </div>

          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {orderError}
              </div>
            )}
            <CheckoutForm
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              totalAmount={nf.format(getTotalPrice() + shippingPrice - (discount?.amount || 0))}
              onGovernorateChange={setSelectedGovernorate}
              onPhoneChange={setPhoneNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
