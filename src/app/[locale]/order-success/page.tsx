"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Check, Package, ArrowRight, Loader2, Copy, Banknote, Store, Clock, XCircle, RefreshCw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { PaymentStatus } from "@/lib/easykash";
import { formatPrice } from "@/lib/price";
import { cutoutSrc } from "@/lib/cutout";
import { OrderSuccessSkeleton } from "@/components/skeletons";
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
      <div className="min-h-screen bg-background" dir={dir}>
        <p className="pt-8 text-center font-sans text-[13px] text-gray-500" aria-live="polite">
          {isAr ? "جاري تأكيد الدفع..." : "Confirming your payment…"}
        </p>
        <OrderSuccessSkeleton />
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
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="mx-auto max-w-2xl px-gutter py-12 sm:py-section-lg lg:px-gutter-lg">
        <div className="space-y-8 text-center sm:space-y-10">

          {/* Status Icon */}
          <div className="flex justify-center">
            {awaitingPayment ? (
              <div className="flex h-16 w-16 items-center justify-center border border-gray-200 bg-background">
                <Clock className="h-8 w-8 text-warning" strokeWidth={1.25} />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center bg-beige">
                <Check className="h-8 w-8 text-primary" strokeWidth={1.25} />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="space-y-4">
            <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">
              {awaitingPayment
                ? isAr
                  ? "في انتظار الدفع"
                  : "Awaiting payment"
                : t("title")}
            </h1>
            <p className="ds-body text-gray-500">
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
                className="ds-link inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} strokeWidth={1.25} />
                {isAr ? "تحديث حالة الدفع" : "Refresh payment status"}
              </button>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-beige p-6 text-start sm:p-8">
            <div className="mb-4 border-b border-gray-200 pb-3">
              <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
                {t("orderDetails")}
              </h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-1 font-sans text-[13px] text-gray-500">
                    {t("orderNumber")}
                  </p>
                  <p className="font-sans text-[15px] text-ink">
                    {orderData?.orderNumber ? `#${orderData.orderNumber}` : orderNumber ? `#${orderNumber}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-sans text-[13px] text-gray-500">
                    {t("orderDate")}
                  </p>
                  <p className="font-sans text-[15px] text-ink">{orderDate}</p>
                </div>
              </div>

              {orderData?.customerName && (
                <div className="border-t border-gray-200 pt-5">
                  <p className="mb-1 font-sans text-[13px] text-gray-500">
                    {isAr ? "اسم العميل" : "Customer"}
                  </p>
                  <p className="font-sans text-[15px] text-ink">{orderData.customerName}</p>
                  {(orderData.government || orderData.city) && (
                    <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">
                      {[orderData.city, orderData.government].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 pt-5">
                <p className="mb-1 font-sans text-[13px] text-gray-500">
                  {t("shippingInfoTitle")}
                </p>
                <p className="ds-body text-gray-500">
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
            <div className="bg-beige p-6 text-start sm:p-8">
              <div className="mb-4 border-b border-gray-200 pb-3">
                <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
                  {t("orderedItems")}
                </h3>
              </div>
              <div className="space-y-0">
                  {orderData.items.map((item, index) => {
                    const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                    const productName = isAr ? (item.productNameAr || item.productName) : item.productName;
                    return (
                      <div key={index} className="flex items-center gap-4 border-b border-gray-200 py-4 first:pt-0 last:border-0 last:pb-0">
                        <div className="ds-cutout-frame relative aspect-product w-16 flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img
                              src={cutoutSrc(item.image, 256)}
                              alt={productName}
                              className="ds-cutout h-full w-full object-center"
                              onError={(e) => {
                                // processed version failed → show the original
                                const orig = item.image || ""; if (orig && !e.currentTarget.src.endsWith(orig)) e.currentTarget.src = orig;
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-gray-300" strokeWidth={1.25} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-1 font-sans text-[15px] leading-[22px] text-ink">{productName}</h4>
                          <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">
                            {colorName && `${colorName}`}
                            {colorName && item.sizeName && " · "}
                            {item.sizeName}
                            {(colorName || item.sizeName) && " · "}
                            {t("quantity")}: {item.quantity}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-end">
                          <p className="font-sans text-[14px] tabular-nums text-ink">
                            {formatPrice(item.unitPrice, locale)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">
                              {t("subtotal")}: {formatPrice(item.subtotal, locale)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2 border-t border-gray-200 pt-6 font-sans text-[14px] text-ink">
                  {orderData.shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{isAr ? "الشحن" : "Shipping"}</span>
                      <span className="tabular-nums">{formatPrice(orderData.shippingCost, locale)}</span>
                    </div>
                  )}
                  {orderData.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{isAr ? "الخصم" : "Discount"}</span>
                      <span className="tabular-nums">−{formatPrice(orderData.discountAmount, locale)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-baseline justify-between border-t border-gray-200 pt-3 font-semibold">
                    <span>{t("total")}</span>
                    <span className="text-[17px] tabular-nums">
                      {formatPrice(orderData.total, locale)}
                    </span>
                  </div>
                </div>
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 pt-6 sm:flex-row">
            <button
              onClick={() => router.push("/my-orders")}
              className="ds-btn-outline px-10"
            >
              {t("trackOrders")}
            </button>
            <button
              onClick={() => router.push("/products")}
              className="ds-btn-primary px-10"
            >
              {t("continueShopping")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.25} />
            </button>
          </div>

          {/* Customer Support */}
          <div className="border border-gray-200 p-8 text-center">
            <h3 className="mb-3 font-display text-[22px] leading-tight text-ink">
              {t("needHelp")}
            </h3>
            <p className="ds-body mx-auto mb-6 max-w-md text-gray-500">
              {t("needHelpBody")}
            </p>
            <button
              onClick={() => window.open(CONTACT_INFO.whatsappLink, "_blank")}
              className="ds-btn-outline px-8"
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
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="mx-auto max-w-lg px-gutter py-12 sm:py-section-lg lg:px-gutter-lg">
        <div className="space-y-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center border border-gray-200 bg-background">
              <XCircle className="h-8 w-8 text-danger" strokeWidth={1.25} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">
              {isAr ? "لم يتم إتمام الدفع" : "Payment not completed"}
            </h1>
            <p className="ds-body text-gray-500">{body}</p>
            {orderNumber && (
              <p className="font-sans text-[13px] text-gray-500">
                {isAr ? "رقم الطلب" : "Order number"}: #{orderNumber}
              </p>
            )}
            <p className="ds-fine">
              {isAr
                ? "منتجاتك لسه في السلة."
                : "Your items are still in your cart."}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <button
              onClick={onRetry}
              className="ds-btn-primary px-10"
            >
              {isAr ? "إعادة المحاولة" : "Try again"}
            </button>
            {onRecheck && (
              <button
                onClick={onRecheck}
                disabled={isRechecking}
                className="ds-btn-outline px-10"
              >
                <RefreshCw className={`h-4 w-4 ${isRechecking ? "animate-spin" : ""}`} strokeWidth={1.25} />
                {isAr ? "تحديث الحالة" : "Refresh status"}
              </button>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => window.open(CONTACT_INFO.whatsappLink, "_blank")}
              className="ds-link"
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
    <div className="border border-gray-200 bg-background p-6 text-start sm:p-8">
      <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
        <Banknote className="h-4 w-4 text-ink" strokeWidth={1.25} />
        <h3 className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
          {isAr ? "كود الدفع النقدي" : "Cash Payment Code"}
        </h3>
      </div>

      <p className="ds-body mb-5 text-ink">
        {isAr
          ? `ادفع ${formatPrice(total, "ar")} في أقرب فرع ${provider || ""} باستخدام الكود التالي:`
          : `Pay ${formatPrice(total, "en")} at any ${provider || ""} branch using the code below:`}
      </p>

      {/* Voucher */}
      <div className="mb-4 flex items-center justify-between gap-3 bg-beige p-4">
        <div>
          <p className="mb-1 font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
            {isAr ? "كود الدفع" : "Payment Code"}
          </p>
          <p className="font-mono text-display-md tracking-label text-ink">
            {voucher}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`ds-btn h-button gap-1.5 px-4 text-label ${
            copied
              ? "border-gray-200 bg-background text-ink"
              : "bg-primary text-white hover:bg-night"
          }`}
          aria-label={isAr ? "نسخ الكود" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={1.25} />
              {isAr ? "تم النسخ" : "Copied"}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.25} />
              {isAr ? "نسخ" : "Copy"}
            </>
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        {provider && (
          <div className="border border-gray-200 bg-background p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Store className="h-3.5 w-3.5 text-gray-500" strokeWidth={1.25} />
              <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
                {isAr ? "المزود" : "Provider"}
              </p>
            </div>
            <p className="font-sans text-[15px] text-ink">{provider}</p>
          </div>
        )}
        {expiryDate && (
          <div className="border border-gray-200 bg-background p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" strokeWidth={1.25} />
              <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
                {isAr ? "صالح حتى" : "Expires"}
              </p>
            </div>
            <p className="font-sans text-[15px] text-ink">{expiryDate}</p>
          </div>
        )}
      </div>

      {easykashRef && (
        <p className="ds-fine mt-4 text-center">
          {isAr ? "مرجع EasyKash:" : "EasyKash Ref:"}{" "}
          <span className="font-mono font-normal text-ink">{easykashRef}</span>
        </p>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {  return (
    <Suspense fallback={<OrderSuccessSkeleton />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
