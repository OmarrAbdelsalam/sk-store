"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import Link from "next/link";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import { CheckoutSkeleton } from "@/components/skeletons";
import { CONTACT_INFO } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import CheckoutOrderSummary, { payableNowOf } from "@/components/checkout/CheckoutOrderSummary";
import CheckoutForm, { type CheckoutSubmitData, type PaymentPlan } from "@/components/checkout/CheckoutForm";
import EmptyCart from "@/components/checkout/EmptyCart";
import { useRouter } from "next/navigation";
import { getOrCreateSessionId } from "@/lib/session";
import { useLocale, useTranslations } from "next-intl";
import { getShippingPrice, type CheckoutFormData } from "@/lib/checkout-utils";
import { API_ROUTES } from "@/lib/api-routes";
import { track, saveCartSnapshot, flushEvents } from "@/lib/track";
import { formatAmount } from "@/lib/price";

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
  const [summaryOpen, setSummaryOpen] = useState(false);
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

  const nf = { format: formatAmount };

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

  const cartLabel = isAr ? "الرجوع للسلة" : "Back to cart";

  if (!mounted) return <CheckoutSkeleton />;

  if (orderCompleted || isProcessing) {
    return (
      <div className="min-h-screen bg-white" dir={dir}>
        <CheckoutHeader cartLabel={cartLabel} />
        <div className="flex min-h-[60vh] items-center justify-center px-gutter">
          <div className="space-y-5 text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-gray-200 border-t-ink" />
            <p className="font-sans text-[14px] text-gray-500">
              {orderCompleted
                ? isAr
                  ? "جاري التحويل لبوابة الدفع..."
                  : "Redirecting to the payment page…"
                : t("processingOrder")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <EmptyCart dir={dir} />;

  const summaryProps = {
    items,
    totalPrice: getTotalPrice(),
    shippingPrice,
    shippingKnown: !!selectedGovernorate,
    discount,
    onDiscountChange: setDiscount,
    disabled: isProcessing,
    phoneNumber,
    freeShippingApplied,
    bogoDiscount,
  };
  const payableNow = payableNowOf({
    totalPrice: getTotalPrice(),
    shippingPrice,
    discount,
    bogoDiscount,
  });

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <CheckoutHeader cartLabel={cartLabel} />

      {/* Phone: collapsible "Show order summary" bar with the total */}
      <div className="border-b border-gray-200 bg-beige lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          aria-expanded={summaryOpen}
          aria-controls="mobile-order-summary"
          className="flex w-full items-center justify-between gap-4 px-gutter py-4"
        >
          <span className="flex items-center gap-1.5 font-sans text-[14px] text-ink">
            <ShoppingBag className="size-[18px]" strokeWidth={1.25} />
            {summaryOpen
              ? isAr ? "إخفاء ملخص الطلب" : "Hide order summary"
              : isAr ? "عرض ملخص الطلب" : "Show order summary"}
            <ChevronDown
              className={`size-4 transition-transform duration-300 ${summaryOpen ? "rotate-180" : ""}`}
              strokeWidth={1.5}
            />
          </span>
          <span className="font-sans text-[17px] font-semibold tabular-nums text-ink">
            {nf.format(payableNow)} <span className="text-[12px] font-normal text-gray-500">{isAr ? "ج.م" : "EGP"}</span>
          </span>
        </button>
        <div
          id="mobile-order-summary"
          className={`grid transition-[grid-template-rows] duration-300 ease-brand ${summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="px-gutter pb-6 pt-2">
              <CheckoutOrderSummary {...summaryProps} />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:min-h-[calc(100vh-84px)] lg:grid-cols-2">
        {/* Form column — content hugs the centre line */}
        <div className="lg:flex lg:justify-end">
          <div className="w-full px-gutter pb-12 pt-8 lg:max-w-[600px] lg:px-[38px] lg:pt-[38px]">
            {orderError && (
              <div role="alert" className="mb-6 border border-danger bg-white p-4 font-sans text-[14px] leading-5 text-danger">
                {orderError}
              </div>
            )}
            <CheckoutForm
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              totalPrice={computedTotal}
              totalAmount={nf.format(computedTotal)}
              shippingCost={shippingPrice}
              freeShipping={freeShippingApplied}
              onGovernorateChange={setSelectedGovernorate}
              onPhoneChange={setPhoneNumber}
            />

            {/* Footer links (Shopify keeps these under the form) */}
            <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-4 font-sans text-[12px] leading-4">
              <Link href="/cart" className="text-ink underline underline-offset-2 transition-opacity duration-fast hover:opacity-60">
                {isAr ? "الرجوع للسلة" : "Return to cart"}
              </Link>
              <Link href="/products" className="text-ink underline underline-offset-2 transition-opacity duration-fast hover:opacity-60">
                {isAr ? "كملي تسوق" : "Continue shopping"}
              </Link>
              <a
                href={CONTACT_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-2 transition-opacity duration-fast hover:opacity-60"
              >
                {isAr ? "محتاجة مساعدة؟ واتساب" : "Need help? WhatsApp us"}
              </a>
            </nav>
          </div>
        </div>

        {/* Summary column — gray, full height, content sticks while scrolling */}
        <aside className="hidden border-s border-gray-200 bg-beige lg:block" aria-label={isAr ? "ملخص الطلب" : "Order summary"}>
          <div className="sticky top-0 w-full max-w-[520px] px-[38px] py-[38px]">
            <CheckoutOrderSummary {...summaryProps} />
          </div>
        </aside>
      </div>
    </div>
  );
}
