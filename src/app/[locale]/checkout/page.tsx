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

  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
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
            const price = getShippingPrice(data.governorate, data.city || "");
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
      const price = getShippingPrice(selectedGovernorate, "");
      console.log('Governorate selected:', selectedGovernorate, 'Price:', price);
      setShippingPrice(price);
    } else {
      setShippingPrice(0);
    }
  }, [selectedGovernorate]);

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
    const shipping = getShippingPrice(formData.governorate, formData.city);
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
        total,
      };

      console.log('Sending order payload:', payload);

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

      try { localStorage.setItem('last_order_data', JSON.stringify(response.data)); } catch {}
      
      // Mark order as completed before clearing cart to prevent EmptyCart flash
      setOrderCompleted(true);
      
      // Server automatically clears cart after order, just clear local state
      clearCart(); // Clear from local state
      router.push(`/${locale}/order-success`);
    } catch (error) {
      const message = error instanceof Error ? error.message : typeof error === "string" ? error : t("genericErrorDesc");
      console.error('Order error:', message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen" dir={dir}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-32 bg-muted rounded" />
            <div className="h-8 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading while order is being processed or completed (navigating to success page)
  if (orderCompleted || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">
            {orderCompleted ? t("redirecting") : t("processingOrder")}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <EmptyCart dir={dir} />;

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-2 sm:py-8">
        {/* زر الرجوع */}
        <Button 
          variant="ghost" 
          onClick={() => router.push("/cart")} 
          className="mb-2 sm:mb-6 hover:bg-secondary/50 rounded-xl group" 
          aria-label={t("backToCart")}
        >
          {isAr ? (
            <ArrowRight className="h-4 w-4 me-2 group-hover:translate-x-1 transition-transform" />
          ) : (
            <ArrowLeft className="h-4 w-4 me-2 group-hover:-translate-x-1 transition-transform" />
          )}
          {t("backToCart")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="space-y-3 sm:space-y-6">
            {/* العنوان */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">{t("checkoutTitle")}</h1>
            </div>
            
            <CheckoutForm
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              totalAmount={nf.format(getTotalPrice() + shippingPrice - (discount?.amount || 0))}
              onGovernorateChange={setSelectedGovernorate}
            />
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <CheckoutOrderSummary 
              items={items} 
              totalPrice={getTotalPrice()} 
              shippingPrice={shippingPrice}
              discount={discount}
              onDiscountChange={setDiscount}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
