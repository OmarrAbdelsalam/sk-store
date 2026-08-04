"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutForm, { type CheckoutSubmitData, type PaymentPlan } from "@/components/checkout/CheckoutForm";
import EmptyCart from "@/components/checkout/EmptyCart";
import { useRouter } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { useLocale, useTranslations } from "next-intl";
import { getShippingPrice, type CheckoutFormData } from "@/lib/checkout-utils";
import { API_ROUTES } from "@/lib/api-routes";
import { track, saveCartSnapshot, flushEvents } from "@/lib/track";

export default function Checkout() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const { items, getTotalPrice, bogoDiscount, freeShippingApplied, appliedPromotions } = useCart();
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

  useEffect(() => {
    setMounted(true);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("checkout_form_data");
        if (saved) {
          const data = JSON.parse(saved);
          if (data.governorate) {
            setSelectedGovernorate(data.governorate);
            const price = freeShippingApplied
              ? 0
              : getShippingPrice(data.governorate, data.city || "");
            setShippingPrice(price);
          }
        }
      } catch {}
    }
  }, [freeShippingApplied]);

  useEffect(() => {
    if (selectedGovernorate) {
      setShippingPrice(
        freeShippingApplied ? 0 : getShippingPrice(selectedGovernorate, "")
      );
    } else {
      setShippingPrice(0);
    }
  }, [selectedGovernorate, freeShippingApplied]);

  useEffect(() => {
    router.prefetch(`/order-success`);
  }, [locale, router]);

  // Coming back from the gateway restores this page from the bfcache with its
  // state intact, which would leave the customer staring at the "Redirecting…"
  // spinner forever. `persisted` marks exactly that restore.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsProcessing(false);
        setOrderCompleted(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const computedTotal = useMemo(() => {
    const subtotal = getTotalPrice();
    const discountAmt = discount?.amount || 0;
    const bogoAmt = bogoDiscount || 0;
    return subtotal + shippingPrice - discountAmt - bogoAmt;
  }, [getTotalPrice, shippingPrice, discount, bogoDiscount]);

  /**
   * Main checkout handler:
   * 1. Create order in DB with status=pending, payment_status=unpaid
   * 2. Call EasyKash Direct Payment API to get the hosted payment URL
   * 3. Redirect customer to EasyKash payment page
   * 4. EasyKash redirects back to /order-success?ref=...&paymentType=...
   * 5. Callback webhook updates payment_status when payment completes
   */
  const handleSubmit = async (formData: CheckoutSubmitData) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setIsProcessing(true);
    setOrderError(null);

    const shipping = freeShippingApplied
      ? 0
      : getShippingPrice(formData.governorate, formData.city);
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
      const { paymentPlan } = formData;

      const depositAmount =
        paymentPlan === "deposit"
          ? parseFloat((total * 0.5).toFixed(2))
          : total;
      const remainingAmount =
        paymentPlan === "deposit" ? total - depositAmount : 0;

      // ── Step 1: Create order in DB ──────────────────────────────────────
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36);

      const orderPayload = {
        sessionId,
        customerName: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        // Stored on the order so the confirmation and follow-up emails go out
        // in the language the customer actually shopped in.
        locale,
        government: formData.governorate,
        city: formData.city,
        detailedAddress: formData.detailedAddress,
        notes: formData.notes,
        paymentMethod: "easykash",
        paymentPlan,
        depositAmount,
        remainingAmount,
        items: items.map((item) => ({
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
        bogoDiscount: bogoAmt,
        appliedPromotions: appliedPromotions || [],
        total,
      };

      const orderRes = await fetch(API_ROUTES.orders.create(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.succeeded) {
        throw new Error(
          orderData.message || `Order creation failed (${orderRes.status})`
        );
      }

      const orderNumber = orderData.data?.orderNumber || orderData.data?.order_number;

      // Allocated by a database sequence when the order was inserted, so it's
      // unique and already stored — the callback can always find its way back.
      const customerRef = orderData.data?.easykashCustomerRef;

      if (!customerRef) {
        throw new Error(
          isAr
            ? "تعذر إنشاء مرجع الدفع"
            : "Could not create a payment reference"
        );
      }

      // Save summary for order-success page
      try {
        localStorage.setItem(
          "last_order_data",
          JSON.stringify({
            orderNumber,
            sessionId,
            customerName: formData.name,
            government: formData.governorate,
            city: formData.city,
            subtotal,
            shippingCost: shipping,
            discountAmount: discountAmt,
            total,
            paymentPlan,
            depositAmount,
            remainingAmount,
            easykashCustomerRef: customerRef,
            items: items.map((item) => ({
              productName: item.nameEn || item.name,
              productNameAr: item.nameAr || item.name,
              colorNameEn: item.colorName,
              colorNameAr: item.colorName,
              sizeName: item.sizeName,
              quantity: item.quantity,
              unitPrice:
                parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0,
              subtotal:
                (parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0) *
                item.quantity,
              image: item.image,
            })),
          })
        );
      } catch {}

      // ── Step 2: Create EasyKash Direct Payment link ─────────────────────
      const payRes = await fetch("/api/payments/easykash/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The reference is all the server needs — it reads the amount, buyer and
        // payment plan from the order it already stored. Sending an amount from
        // here would just be a number the server ignores.
        body: JSON.stringify({
          customerReference: customerRef,
          locale,
        }),
      });

      const payData = await payRes.json();

      if (!payRes.ok || !payData.succeeded || !payData.data?.paymentUrl) {
        throw new Error(
          payData.message ||
            (isAr
              ? "فشل في إنشاء رابط الدفع"
              : "Failed to create payment link")
        );
      }

      // ── Step 4: Redirect to EasyKash hosted page ───────────────────────
      // The cart stays put until /order-success confirms the payment server-side —
      // if the customer cancels or the card is declined they come back to a full cart.
      setOrderCompleted(true);

      // Last thing we can observe before the customer leaves for the gateway.
      // Anyone who stops here is an unpaid order with a known phone and email —
      // the most recoverable group there is.
      track("payment_started", {
        orderId: orderData.data?.id,
        value: total,
      });
      saveCartSnapshot({ stage: "payment_started" });
      flushEvents();

      // Full same-tab redirect: popup blockers kill window.open here (this runs
      // after an await, so it's no longer a trusted user gesture), and 3-D Secure
      // redirect chains break out of iframes anyway.
      window.location.href = payData.data.paymentUrl;
    } catch (error: any) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : t("genericErrorDesc");
      console.error("Checkout error:", message);
      setOrderError(message);
      setIsProcessing(false);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

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

  if (orderCompleted || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={dir}>
        <div className="text-center space-y-6">
          <div className="animate-spin h-10 w-10 border-2 border-foreground border-t-transparent mx-auto" />
          <p className="text-sm tracking-widest uppercase text-muted-foreground">
            {orderCompleted
              ? isAr
                ? "جاري التحويل لبوابة الدفع..."
                : "Redirecting to payment gateway..."
              : t("processingOrder")}
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
          onClick={() => router.push(`/cart`)}
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">
            {t("checkoutTitle")}
          </h1>
          <div className="h-px w-16 bg-foreground mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Order Summary */}
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

          {/* Form */}
          <div className="order-first lg:order-first lg:col-span-7 bg-[#F0EBE3]/40 p-5 sm:p-8 border border-[#d4c9bc] rounded-[32px]">
            {orderError && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-700 text-sm rounded-sm mb-6">
                {orderError}
              </div>
            )}
            <CheckoutForm
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              totalPrice={computedTotal}
              totalAmount={nf.format(computedTotal)}
              shippingCost={shippingPrice}
              onGovernorateChange={setSelectedGovernorate}
              onPhoneChange={setPhoneNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
