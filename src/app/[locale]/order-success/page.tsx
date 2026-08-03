"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Check, Package, ArrowRight, Loader2, Copy, Banknote, Store, Clock, XCircle, RefreshCw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { PaymentStatus } from "@/lib/easykash";
import { CONTACT_INFO } from "@/lib/constants";

/** The callback races the customer's browser back from the gateway, so give it
 *  a few seconds to land before deciding the payment didn't go through. */
const POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type OrderItem = {
  productName: string;
  productNameAr?: string;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
};

type OrderData = {
  orderNumber: string | null;
  customerName?: string;
  government?: string;
  city?: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod?: string;
  easykashVoucher?: string;
  easykashProvider?: string;
  easykashExpiry?: string;
  easykashRef?: string;
  easykashCustomerRef?: string | number;
  items: OrderItem[];
};

/**
 * Shapes the status endpoint's response for display. It intentionally carries
 * no customer name or address — those stay in this browser's own cached copy —
 * so any key the server didn't send is dropped rather than written as
 * `undefined` over the cached value.
 */
function mapOrderRow(order: any): Partial<OrderData> {
  const num = (v: any) => (v === null || v === undefined ? undefined : Number(v));

  const mapped: Partial<OrderData> = {
    orderNumber: order.order_number,
    subtotal: num(order.subtotal),
    shippingCost: num(order.shipping_cost),
    discountAmount: num(order.discount_amount),
    total: num(order.total),
    easykashVoucher: order.easykash_voucher,
    easykashProvider: order.easykash_provider,
    easykashExpiry: order.easykash_expiry,
    easykashRef: order.easykash_ref,
    items: (order.items || []).map((item: any) => ({
      productName: item.product_name,
      productNameAr: item.product_name_ar,
      colorNameEn: item.color_name,
      colorNameAr: item.color_name,
      sizeName: item.size_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.total_price),
      image: item.product_image,
    })),
  };

  for (const key of Object.keys(mapped) as (keyof OrderData)[]) {
    const value = mapped[key];
    if (value === undefined || (typeof value === "number" && Number.isNaN(value))) {
      delete mapped[key];
    }
  }

  return mapped;
}

async function fetchPaymentStatus(
  ref: string
): Promise<{ status: PaymentStatus; order: any } | null> {
  try {
    const res = await fetch(
      `/api/payments/easykash/status?ref=${encodeURIComponent(ref)}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    if (!res.ok || !json.succeeded || !json.data) return null;
    return { status: json.data.paymentStatus as PaymentStatus, order: json.data.order };
  } catch {
    return null;
  }
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("OrderSuccess");
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "unknown">("unknown");
  const [isLoading, setIsLoading] = useState(true);
  const [isRechecking, setIsRechecking] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Whether `paymentStatus` came from the server or is just our fallback guess.
  const [serverAnswered, setServerAnswered] = useState(false);

  // EasyKash appends ?status=…&providerRefNum=…&customerReference=…&voucher=…
  // to the redirect. `ref` is kept for links created before that was relied on,
  // and `order` is the internal link used elsewhere in the app.
  const refParam = searchParams.get("customerReference") ?? searchParams.get("ref");
  const orderNumber = searchParams.get("order");
  const paymentRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    const loadOrder = async () => {
      setIsLoading(true);

      let saved: OrderData | null = null;
      try {
        const raw = localStorage.getItem("last_order_data");
        if (raw) saved = JSON.parse(raw);
      } catch {}

      // Render the summary cached at checkout immediately, then let the server
      // response correct it — the payment status still comes from the server only.
      if (saved && !cancelled) setOrderData(saved);

      const ref =
        refParam ??
        (saved?.easykashCustomerRef != null ? String(saved.easykashCustomerRef) : null);
      paymentRef.current = ref;

      try {
        if (ref) {
          let answered = false;

          for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
            if (cancelled) return;
            const result = await fetchPaymentStatus(ref);

            if (result) {
              if (cancelled) return;
              answered = true;
              setServerAnswered(true);
              // Merge, don't replace: the API deliberately omits customer name and
              // address (PII), so keep whatever this browser cached at checkout.
              setOrderData((current) => ({ ...(current || {}), ...mapOrderRow(result.order) } as OrderData));
              setPaymentStatus(result.status);
              // "unpaid" means nothing has come back for this order yet — every
              // other status is an answer, so stop polling.
              if (result.status !== "unpaid") return;
            }

            if (attempt < POLL_ATTEMPTS - 1) await sleep(POLL_DELAY_MS);
          }

          // Never reaching our own endpoint says nothing about the payment, so
          // hold at "pending" and let the customer refresh rather than telling
          // someone who just paid that it failed.
          if (!cancelled) setPaymentStatus(answered ? "unpaid" : "pending");
          return;
        }

        // Without a payment reference there is nothing to verify against. The
        // orders table is not readable from the browser — customer names,
        // phones and addresses live there — so this page shows only what the
        // checkout cached locally and makes no claim about the payment.
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, refParam]);

  // The order is real once the payment settled or a cash voucher was issued —
  // only then is it safe to drop the cart. A declined or abandoned payment keeps
  // it intact so the customer can retry without rebuilding the order.
  const cartCleared = useRef(false);
  useEffect(() => {
    // serverAnswered guards the fallback: if the status endpoint was never
    // reachable we hold at "pending" without knowing anything, and emptying the
    // cart on a guess would strand a customer whose payment actually failed.
    // "pending" covers two opposite situations, and only one of them means the
    // customer is done with the cart:
    //   - a cash voucher was issued (Fawry/Aman) — they hold a code and owe us
    //     money, so the cart's job is over
    //   - the payment page was opened and abandoned — EasyKash reports the
    //     transaction as NEW, which maps to "pending" too
    // Emptying the cart on the second case is what wipes a customer's basket
    // for doing nothing wrong. The voucher is the only thing that tells them
    // apart.
    const hasVoucher = Boolean(orderData?.easykashVoucher);
    const settled =
      serverAnswered &&
      (paymentStatus === "paid" ||
        paymentStatus === "delivered" ||
        (paymentStatus === "pending" && hasVoucher));

    if (settled && !cartCleared.current) {
      cartCleared.current = true;
      clearCart();
      try {
        localStorage.removeItem("last_order_data");
      } catch {}
    }
  }, [paymentStatus, serverAnswered, orderData?.easykashVoucher, clearCart]);

  const recheckPayment = useCallback(async () => {
    if (!paymentRef.current || isRechecking) return;
    setIsRechecking(true);
    const result = await fetchPaymentStatus(paymentRef.current);
    if (result) {
      setServerAnswered(true);
      setOrderData((current) => ({ ...(current || {}), ...mapOrderRow(result.order) } as OrderData));
      setPaymentStatus(result.status);
    }
    setIsRechecking(false);
  }, [isRechecking]);

  const orderDate = mounted
    ? (() => {
        try {
          return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date());
        } catch {
          return new Date().toLocaleDateString();
        }
      })()
    : "";

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir={dir}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          {isAr ? "جاري تأكيد الدفع..." : "Confirming your payment..."}
        </p>
      </div>
    );
  }

  // The redirect is only a hint — a payment that never completed must not be
  // dressed up as a confirmed order.
  const paymentFailed =
    paymentStatus === "unpaid" ||
    paymentStatus === "failed" ||
    paymentStatus === "expired";

  if (paymentFailed) {
    return (
      <PaymentFailed
        status={paymentStatus}
        isAr={isAr}
        dir={dir}
        orderNumber={orderData?.orderNumber || null}
        onRetry={() => router.push("/checkout")}
        onRecheck={paymentRef.current ? recheckPayment : undefined}
        isRechecking={isRechecking}
      />
    );
  }

  const awaitingPayment = paymentStatus === "pending";

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-8 sm:space-y-10">

          {/* Status Icon */}
          <div className="flex justify-center">
            {awaitingPayment ? (
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center shadow-sm">
                <Clock className="h-10 w-10 text-amber-600" strokeWidth={2} />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center shadow-sm">
                <Check className="h-10 w-10 text-[#2E7D32]" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">
              {awaitingPayment
                ? isAr
                  ? "في انتظار الدفع"
                  : "Awaiting payment"
                : t("title")}
            </h1>
            <div className="h-px w-12 bg-foreground mx-auto" />
            <p className="text-sm text-muted-foreground tracking-wider">
              {awaitingPayment
                ? isAr
                  ? "تم تسجيل طلبك ولم يتم تأكيد الدفع بعد. لو دفعت بالفعل، هيتم التأكيد خلال دقائق."
                  : "Your order is saved but the payment hasn't been confirmed yet. If you've already paid, it will be confirmed shortly."
                : t("subtitle")}
            </p>
            {awaitingPayment && (
              <button
                onClick={recheckPayment}
                disabled={isRechecking}
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gray-900 underline underline-offset-4 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} />
                {isAr ? "تحديث حالة الدفع" : "Refresh payment status"}
              </button>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-[#F0EBE3]/40 rounded-[32px] p-6 sm:p-8 border border-[#d4c9bc] text-start shadow-sm">
            <div className="pb-4 mb-4 border-b border-[#d4c9bc]/60">
              <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                {t("orderDetails")}
              </h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {t("orderNumber")}
                  </p>
                  <p className="text-sm font-medium">
                    {orderData?.orderNumber ? `#${orderData.orderNumber}` : orderNumber ? `#${orderNumber}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {t("orderDate")}
                  </p>
                  <p className="text-sm font-medium">{orderDate}</p>
                </div>
              </div>

              {orderData?.customerName && (
                <div className="border-t border-[#d4c9bc]/60 pt-5">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {isAr ? "اسم العميل" : "Customer"}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{orderData.customerName}</p>
                  {(orderData.government || orderData.city) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[orderData.city, orderData.government].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-[#d4c9bc]/60 pt-5">
                <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                  {t("shippingInfoTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("shippingInfoBody")}
                </p>
              </div>
            </div>
          </div>

          {/* EasyKash Voucher — shown when payment was made via Fawry/Aman */}
          {orderData?.easykashVoucher && (
            <EasyKashVoucherCard
              voucher={orderData.easykashVoucher}
              provider={orderData.easykashProvider}
              expiryDate={orderData.easykashExpiry}
              easykashRef={orderData.easykashRef}
              total={orderData.total}
              isAr={isAr}
            />
          )}

          {/* Ordered Items */}
          {orderData && orderData.items && orderData.items.length > 0 && (
            <div className="bg-[#F0EBE3]/40 rounded-[32px] p-6 sm:p-8 border border-[#d4c9bc] text-start shadow-sm">
              <div className="pb-4 mb-4 border-b border-[#d4c9bc]/60">
                <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                  {t("orderedItems")}
                </h3>
              </div>
              <div className="space-y-0">
                  {orderData.items.map((item, index) => {
                    const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                    const productName = isAr ? (item.productNameAr || item.productName) : item.productName;
                    return (
                      <div key={index} className="flex gap-4 items-center py-4 border-b border-[#d4c9bc]/40 last:border-0 last:pb-0 first:pt-0">
                        <div className="relative w-16 h-20 bg-white rounded-[16px] overflow-hidden flex-shrink-0 shadow-sm border border-[#d4c9bc]/50">
                          {item.image ? (
                            <img src={item.image} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-1">{productName}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {colorName && `${colorName}`}
                            {colorName && item.sizeName && " · "}
                            {item.sizeName}
                            {(colorName || item.sizeName) && " · "}
                            {t("quantity")}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <p className="text-sm font-medium">
                            {item.unitPrice.toLocaleString()} {isAr ? "جنيه" : "EGP"}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("subtotal")}: {item.subtotal.toLocaleString()} {isAr ? "جنيه" : "EGP"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="mt-6 pt-6 border-t border-[#d4c9bc]/60 space-y-3">
                  {orderData.shippingCost > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="tracking-wider uppercase text-xs">{isAr ? "الشحن" : "Shipping"}</span>
                      <span>{orderData.shippingCost.toLocaleString()} {isAr ? "جنيه" : "EGP"}</span>
                    </div>
                  )}
                  {orderData.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="tracking-wider uppercase text-xs">{isAr ? "الخصم" : "Discount"}</span>
                      <span>- {orderData.discountAmount.toLocaleString()} {isAr ? "جنيه" : "EGP"}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#d4c9bc]">
                    <span className="text-sm font-bold tracking-wider uppercase text-gray-900">{t("total")}</span>
                    <span className="text-2xl font-bold text-gray-900 tracking-wider">
                      {orderData.total.toLocaleString()} <span className="text-sm font-medium tracking-wider uppercase">{isAr ? "جنيه" : "EGP"}</span>
                    </span>
                  </div>
                </div>
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button
              onClick={() => router.push("/my-orders")}
              className="h-14 px-10 rounded-full border border-gray-900 text-gray-900 bg-white text-sm font-bold tracking-widest uppercase
                transition-all duration-300 hover:bg-[#F0EBE3]"
            >
              {t("trackOrders")}
            </button>
            <button
              onClick={() => router.push("/")}
              className="h-14 px-10 rounded-full bg-black text-white text-sm font-bold tracking-widest uppercase
                transition-all duration-300 hover:bg-black hover:-translate-y-1 shadow-md hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              {t("continueShopping")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Customer Support */}
          <div className="bg-[#F0EBE3]/20 rounded-[32px] p-8 text-center border border-[#d4c9bc]">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-3 text-gray-900">
              {t("needHelp")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {t("needHelpBody")}
            </p>
            <button
              onClick={() => window.open(CONTACT_INFO.whatsappLink, "_blank")}
              className="h-12 px-8 rounded-full bg-[#25D366] text-white text-xs font-bold tracking-widest uppercase
                transition-all duration-300 hover:bg-[#1EBE5D] hover:-translate-y-1 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
            >
              {t("contactWhatsApp")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Payment Failed ───────────────────────────────────────────────────────────

function PaymentFailed({
  status,
  isAr,
  dir,
  orderNumber,
  onRetry,
  onRecheck,
  isRechecking,
}: {
  status: PaymentStatus | "unknown";
  isAr: boolean;
  dir: string;
  orderNumber: string | null;
  onRetry: () => void;
  onRecheck?: () => void;
  isRechecking: boolean;
}) {
  const body =
    status === "expired"
      ? isAr
        ? "انتهت صلاحية رابط الدفع قبل إتمام العملية."
        : "The payment link expired before the payment was completed."
      : status === "failed"
      ? isAr
        ? "تم رفض عملية الدفع. لم يتم خصم أي مبلغ."
        : "The payment was declined. You have not been charged."
      : isAr
      ? "لم نستلم تأكيد الدفع. لو كنت لسه بتدفع، جرب تحديث الحالة بعد شوية."
      : "We haven't received a payment confirmation. If you're still paying, refresh the status in a moment.";

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center shadow-sm">
              <XCircle className="h-10 w-10 text-red-600" strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-light tracking-wider uppercase">
              {isAr ? "لم يتم إتمام الدفع" : "Payment not completed"}
            </h1>
            <div className="h-px w-12 bg-foreground mx-auto" />
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            {orderNumber && (
              <p className="text-xs tracking-wider uppercase text-muted-foreground">
                {isAr ? "رقم الطلب" : "Order number"}: #{orderNumber}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "منتجاتك لسه في السلة."
                : "Your items are still in your cart."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button
              onClick={onRetry}
              className="h-14 px-10 rounded-full bg-black text-white text-sm font-bold tracking-widest uppercase
                transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl"
            >
              {isAr ? "إعادة المحاولة" : "Try again"}
            </button>
            {onRecheck && (
              <button
                onClick={onRecheck}
                disabled={isRechecking}
                className="h-14 px-10 rounded-full border border-gray-900 text-gray-900 bg-white text-sm font-bold tracking-widest uppercase
                  transition-all duration-300 hover:bg-[#F0EBE3] disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRechecking ? "animate-spin" : ""}`} />
                {isAr ? "تحديث الحالة" : "Refresh status"}
              </button>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => window.open(CONTACT_INFO.whatsappLink, "_blank")}
              className="text-xs tracking-widest uppercase text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {isAr ? "تواصل معنا على واتساب" : "Contact us on WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EasyKash Voucher Card ────────────────────────────────────────────────────

function EasyKashVoucherCard({
  voucher,
  provider,
  expiryDate,
  easykashRef,
  total,
  isAr,
}: {
  voucher: string;
  provider?: string;
  expiryDate?: string;
  easykashRef?: string;
  total: number;
  isAr: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 sm:p-8 text-start shadow-sm">
      <div className="pb-4 mb-4 border-b border-amber-200/80 flex items-center gap-2">
        <Banknote className="w-4 h-4 text-amber-700" />
        <h3 className="text-sm font-bold tracking-widest uppercase text-amber-900">
          {isAr ? "كود الدفع النقدي" : "Cash Payment Code"}
        </h3>
      </div>

      <p className="text-sm text-amber-800 mb-5">
        {isAr
          ? `ادفع ${total.toLocaleString()} جنيه في أقرب فرع ${provider || ""} باستخدام الكود التالي:`
          : `Pay ${total.toLocaleString()} EGP at any ${provider || ""} branch using the code below:`}
      </p>

      {/* Voucher */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between gap-3 border border-amber-200 mb-4">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
            {isAr ? "كود الدفع" : "Payment Code"}
          </p>
          <p className="text-2xl font-bold tracking-widest text-gray-900 font-mono">
            {voucher}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-amber-900 text-white hover:bg-amber-800"
          }`}
          aria-label={isAr ? "نسخ الكود" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {isAr ? "تم النسخ" : "Copied"}
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              {isAr ? "نسخ" : "Copy"}
            </>
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {provider && (
          <div className="bg-white rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                {isAr ? "المزود" : "Provider"}
              </p>
            </div>
            <p className="font-semibold text-gray-900">{provider}</p>
          </div>
        )}
        {expiryDate && (
          <div className="bg-white rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                {isAr ? "صالح حتى" : "Expires"}
              </p>
            </div>
            <p className="font-semibold text-gray-900">{expiryDate}</p>
          </div>
        )}
      </div>

      {easykashRef && (
        <p className="mt-4 text-center text-[11px] text-amber-700">
          {isAr ? "مرجع EasyKash:" : "EasyKash Ref:"}{" "}
          <span className="font-mono font-semibold">{easykashRef}</span>
        </p>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
