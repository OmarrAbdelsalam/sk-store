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
// clearCartAPI not needed - server clears cart automatically after order

export default function Checkout() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [discount, setDiscount] = useState<{ amount: number; percentage?: number; code: string } | null>(null);

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

  const handleSubmit = async (formData: CheckoutFormData) => {
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
      
      // Validate stock before placing order
      const { getCart } = await import("@/lib/api/cart");
      const { getProductById } = await import("@/lib/api/products");
      
      const cartData = await getCart(sessionId);
      const cartItems = cartData.items || [];
      
      const stockIssues: Array<{ name: string; requested: number; available: number }> = [];
      
      for (const item of cartItems) {
        try {
          const product = await getProductById(item.productId);
          
          let availableStock = 0;
          if (product.hasSizes && item.sizeId) {
            const variant = product.variants.find(
              v => v.colorId === item.colorId && v.sizeId === item.sizeId
            );
            availableStock = variant?.quantity ?? 0;
          } else if (item.colorId) {
            const variant = product.variants.find(v => v.colorId === item.colorId);
            availableStock = variant?.quantity ?? 0;
          } else if (product.variants.length > 0) {
            availableStock = product.variants[0]?.quantity ?? 0;
          }
          
          if (item.quantity > availableStock) {
            const productName = isAr 
              ? (product.nameAr || product.nameEn || `Product ${item.productId}`)
              : (product.nameEn || product.nameAr || `Product ${item.productId}`);
            
            stockIssues.push({
              name: productName,
              requested: item.quantity,
              available: availableStock
            });
          }
        } catch (error) {
          console.error(`Error validating product ${item.productId}:`, error);
        }
      }
      
      if (stockIssues.length > 0) {
        const messages = stockIssues.map(issue => {
          if (issue.available === 0) {
            return isAr 
              ? `${issue.name}: غير متوفر (نفذت الكمية)`
              : `${issue.name}: Out of stock`;
          } else {
            return isAr
              ? `${issue.name}: طلبت ${issue.requested} لكن المتاح فقط ${issue.available}`
              : `${issue.name}: Requested ${issue.requested} but only ${issue.available} available`;
          }
        });
        
        throw new Error(
          isAr 
            ? `بعض المنتجات غير متوفرة بالكمية المطلوبة:\n${messages.join('\n')}`
            : `Some products are not available in requested quantity:\n${messages.join('\n')}`
        );
      }
      
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

      console.log('Sending order payload:', payload);

      const res = await fetch("https://scrubstore.runasp.net/api/Orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      
      // Server automatically clears cart after order, just clear local state
      clearCart(); // Clear from local state
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
            <h1 className="text-2xl md:text-3xl font-bold">{t("checkoutTitle")}</h1>
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
