"use client";

import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  egyptGovernoratesAr,
  egyptGovernoratesEn,
  type CheckoutFormData,
  emptyFormData,
  isValidEmail,
} from "@/lib/checkout-utils";
import { track, saveCartSnapshot } from "@/lib/track";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutHeading, CheckoutInput, CheckoutSelect } from "@/components/checkout/CheckoutField";
import { AcceptedPaymentBrands } from "@/components/checkout/PaymentBrands";
import { formatAmount } from "@/lib/price";

export type PaymentPlan = "full" | "deposit";

const PAYMENT_PLANS: PaymentPlan[] = ["full", "deposit"];

export type CheckoutSubmitData = CheckoutFormData & {
  paymentPlan: PaymentPlan;
  // populated after EasyKash redirect returns
  easykashCustomerRef?: string;
};

type Props = {
  onSubmit: (data: CheckoutSubmitData) => Promise<void>;
  isProcessing: boolean;
  /** Raw numeric total (number) */
  totalPrice: number;
  /** Formatted string for display */
  totalAmount: string;
  /** Shipping portion of totalPrice — excluded from the deposit */
  shippingCost: number;
  onGovernorateChange?: (governorate: string) => void;
  onPhoneChange?: (phone: string) => void;
  /** A promotion made delivery free. */
  freeShipping?: boolean;
};

const isValidPhone = (value: string): boolean => {
  if (!value) return true;
  return /^\+?\d*$/.test(value);
};

const CheckoutForm = memo(
  ({
    onSubmit,
    isProcessing,
    totalPrice,
    totalAmount,
    shippingCost,
    onGovernorateChange,
    onPhoneChange,
    freeShipping = false,
  }: Props) => {
    const t = useTranslations("Checkout");
    const locale = useLocale();
    const router = useRouter();
    const isAr = locale === "ar";

    const governoratesList = useMemo(
      () => (locale === "ar" ? egyptGovernoratesAr : egyptGovernoratesEn),
      [locale]
    );

    const [formData, setFormData] = useState<CheckoutFormData>(() => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("checkout_form_data");
          if (saved) return { ...emptyFormData, ...JSON.parse(saved) };
        } catch {}
      }
      return emptyFormData;
    });

    const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("full");
    const [phoneError, setPhoneError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // ── Abandoned checkout capture ───────────────────────────────────────────
    // Everything typed here is saved before the order is submitted, so someone
    // who leaves at the payment step is still reachable. Sent on blur only —
    // per keystroke would be noise, and the server drops half-typed values.
    const formRef = useRef(formData);
    formRef.current = formData;
    const announcedContact = useRef(false);

    useEffect(() => {
      track("begin_checkout", { value: totalPrice });
      saveCartSnapshot({ stage: "checkout_viewed" });
      // Intentionally once per mount: this is the "reached checkout" funnel step,
      // not a price-change event.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const captureProgress = useCallback(() => {
      const f = formRef.current;
      const hasPhone = (f.phone || "").replace(/\D/g, "").length >= 10;
      const hasEmail = isValidEmail(f.email || "");
      const hasContact = hasPhone || hasEmail;

      const stage = f.governorate
        ? "address_entered"
        : hasContact
          ? "contact_entered"
          : "checkout_viewed";

      saveCartSnapshot({
        customerName: f.name,
        phone: f.phone,
        email: f.email,
        government: f.governorate,
        city: f.city,
        address: f.detailedAddress,
        stage,
      });

      // The moment they become reachable — the step that decides whether an
      // abandoned checkout is recoverable or just a statistic.
      if (hasContact && !announcedContact.current) {
        announcedContact.current = true;
        track("contact_info_entered", {
          props: { has_phone: hasPhone, has_email: hasEmail },
        });
      }
    }, []);

    // Money is always shown to two decimals with grouping. `toLocaleString()`
    // with no options renders 687.5 as "687.5", which reads like a typo in the
    // one place on the page where the customer is deciding whether to trust us.
    const money = formatAmount;

    // Shipping is never charged online — it is collected on delivery under both
    // plans. So everything paid up front is a share of the goods value only.
    const goodsTotal = Math.max(0, totalPrice - shippingCost);
    const depositAmount = parseFloat((goodsTotal * 0.5).toFixed(2));
    /** What this plan actually charges now. */
    const onlineCharge = paymentPlan === "deposit" ? depositAmount : goodsTotal;
    const remainingAmount = parseFloat((totalPrice - onlineCharge).toFixed(2));

    const handleInputChange = useCallback(
      (field: string, value: string) => {
        setFormData((prev) => {
          const updated = { ...prev, [field]: value };
          try {
            localStorage.setItem("checkout_form_data", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        if (field === "governorate" && onGovernorateChange) {
          onGovernorateChange(value);
        }
      },
      [onGovernorateChange]
    );

    const handlePhoneChange = useCallback(
      (value: string) => {
        if (isValidPhone(value)) {
          handleInputChange("phone", value);
          setPhoneError(false);
          if (onPhoneChange) onPhoneChange(value);
        } else {
          setPhoneError(true);
        }
      },
      [handleInputChange, onPhoneChange]
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPaymentError(null);

      if (!isValidEmail(formData.email || "")) {
        setEmailError(true);
        setPaymentError(
          isAr
            ? "من فضلك أدخلي بريد إلكتروني صحيح."
            : "Please enter a valid email address."
        );
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        return;
      }

      setIsRedirecting(true);
      saveCartSnapshot({ stage: "order_submitted" });

      try {
        // First save the order, get a customerReference back
        // We pass paymentPlan so the order API can record it
        await onSubmit({ ...formData, paymentPlan });
        // onSubmit handles redirect to EasyKash and back
      } catch (err: any) {
        setPaymentError(
          err?.message ||
            (isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Try again.")
        );
        setIsRedirecting(false);
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    };

    // The button always states the amount about to be charged — which is the
    // deposit, not the order total, when that plan is selected.
    const chargeLabel = isAr
      ? `ادفع الآن · ${money(onlineCharge)} ج.م`
      : `Pay now · ${money(onlineCharge)} EGP`;

    const governorateOptions = governoratesList.map((g) => ({ value: g, label: g }));
    const deliveryNote = isAr
      ? "شغل يدوي بيتعمل مخصوص لطلبك — بيوصل خلال 7-10 أيام"
      : "Handmade to order — arrives in 7–10 days";

    return (
      <form onSubmit={handleSubmit} className="space-y-9">
        {paymentError && (
          <div role="alert" className="flex items-start gap-2.5 border border-danger bg-white p-4 font-sans text-[14px] leading-5 text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            {paymentError}
          </div>
        )}

        {/* ── Contact ─────────────────────────────────────── */}
        <section aria-labelledby="checkout-contact">
          <CheckoutHeading id="checkout-contact">{isAr ? "بيانات التواصل" : "Contact"}</CheckoutHeading>
          <CheckoutInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            label={isAr ? "البريد الإلكتروني" : "Email"}
            value={formData.email || ""}
            onChange={(e) => {
              handleInputChange("email", e.target.value);
              if (emailError) setEmailError(false);
            }}
            onBlur={() => {
              const value = (formRef.current.email || "").trim();
              setEmailError(value.length > 0 && !isValidEmail(value));
              captureProgress();
            }}
            className="text-start"
            error={
              emailError
                ? isAr
                  ? "اكتبي بريد إلكتروني صحيح، مثال: name@example.com"
                  : "Enter a valid email, e.g. name@example.com"
                : null
            }
            hint={isAr ? "هنبعتلك تأكيد الطلب عليه" : "We'll send your order confirmation here"}
            required
          />
        </section>

        {/* ── Delivery ────────────────────────────────────── */}
        <section aria-labelledby="checkout-delivery">
          <CheckoutHeading id="checkout-delivery">{isAr ? "التوصيل" : "Delivery"}</CheckoutHeading>

          <div className="space-y-3">
            <CheckoutSelect
              id="country"
              label={isAr ? "الدولة" : "Country/Region"}
              value="EG"
              options={[{ value: "EG", label: isAr ? "مصر" : "Egypt" }]}
              onChange={() => {}}
            />

            <CheckoutInput
              id="name"
              autoComplete="name"
              label={isAr ? "الاسم بالكامل" : "Full name"}
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={captureProgress}
              required
            />

            <CheckoutInput
              id="detailedAddress"
              autoComplete="street-address"
              label={isAr ? "العنوان (الشارع، رقم العمارة، الدور، الشقة)" : "Address (street, building, floor, apartment)"}
              value={formData.detailedAddress || ""}
              onChange={(e) => handleInputChange("detailedAddress", e.target.value)}
              onBlur={captureProgress}
              required
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CheckoutInput
                id="city"
                autoComplete="address-level2"
                label={isAr ? "المدينة / المنطقة" : "City / Area"}
                value={formData.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                onBlur={captureProgress}
                required
              />
              <CheckoutSelect
                id="governorate"
                autoComplete="address-level1"
                label={isAr ? "المحافظة" : "Governorate"}
                placeholder={isAr ? "اختاري المحافظة" : "Select governorate"}
                value={formData.governorate || ""}
                options={governorateOptions}
                onChange={(e) => {
                  handleInputChange("governorate", e.target.value);
                  // formRef still holds the old value on this tick.
                  setTimeout(captureProgress, 0);
                }}
                required
              />
            </div>

            <CheckoutInput
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              label={isAr ? "رقم الموبايل" : "Phone"}
              value={formData.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={captureProgress}
              className="text-start"
              endAdornment={<Phone className="size-4" strokeWidth={1.25} />}
              error={phoneError ? (isAr ? "أرقام فقط" : "Numbers only") : null}
              hint={isAr ? "المندوب هيتواصل معاكي عليه" : "The courier will call this number"}
              required
            />

            <CheckoutInput
              id="notes"
              label={isAr ? "ملاحظات للتوصيل (اختياري)" : "Delivery notes (optional)"}
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>
        </section>

        {/* ── Shipping method ─────────────────────────────── */}
        <section aria-labelledby="checkout-shipping">
          <CheckoutHeading id="checkout-shipping">{isAr ? "طريقة الشحن" : "Shipping method"}</CheckoutHeading>
          {formData.governorate ? (
            <div className="flex items-start justify-between gap-4 border border-ink bg-beige px-4 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span aria-hidden="true" className="mt-px flex size-[18px] shrink-0 rounded-full border-[5px] border-ink bg-white" />
                <div className="min-w-0">
                  <p className="font-sans text-[14px] leading-5 text-ink">
                    {isAr ? `توصيل لـ ${formData.governorate}` : `Standard delivery · ${formData.governorate}`}
                  </p>
                  <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">{deliveryNote}</p>
                </div>
              </div>
              <div className="shrink-0 text-end">
                <p className="font-sans text-[14px] font-semibold leading-5 tabular-nums text-ink">
                  {freeShipping || shippingCost === 0
                    ? isAr ? "مجاني" : "Free"
                    : `${money(shippingCost)} ${isAr ? "ج.م" : "EGP"}`}
                </p>
                {!freeShipping && shippingCost > 0 && (
                  <p className="mt-0.5 font-sans text-[12px] leading-4 text-gray-500">
                    {isAr ? "يُدفع عند الاستلام" : "Paid on delivery"}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="bg-beige px-4 py-4 font-sans text-[14px] leading-5 text-gray-500">
              {isAr
                ? "اختاري المحافظة عشان تظهر طرق الشحن المتاحة."
                : "Enter your shipping address to view available shipping methods."}
            </p>
          )}
        </section>

        {/* ── Payment ─────────────────────────────────────── */}
        <section aria-labelledby="checkout-payment">
          <CheckoutHeading id="checkout-payment" className="mb-1">{isAr ? "الدفع" : "Payment"}</CheckoutHeading>
          <p className="mb-3.5 font-sans text-[14px] leading-5 text-gray-500">
            {isAr ? "كل المعاملات مؤمنة ومشفرة." : "All transactions are secure and encrypted."}
          </p>

          {/* A real radiogroup: arrow keys move between options, Space selects. */}
          <div
            role="radiogroup"
            aria-label={isAr ? "طريقة الدفع" : "Payment method"}
            className="border border-gray-300 bg-white"
          >
            {PAYMENT_PLANS.map((plan, i) => {
              const selected = paymentPlan === plan;
              const isFull = plan === "full";

              return (
                <div key={plan} className={cn(i > 0 && "border-t border-gray-300")}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setPaymentPlan(plan)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                        e.preventDefault();
                        setPaymentPlan("deposit");
                      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        setPaymentPlan("full");
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-4 text-start transition-colors duration-fast",
                      "focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ink",
                      selected ? "bg-beige" : "hover:bg-gray-50"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-[18px] shrink-0 rounded-full border bg-white transition-[border-width,border-color] duration-fast",
                        selected ? "border-[5px] border-ink" : "border-gray-400"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-sans text-[14px] leading-5 text-ink">
                        {isFull
                          ? isAr ? "دفع كامل أونلاين" : "Pay in full"
                          : isAr ? "دفع 50% مقدم" : "Pay a 50% deposit"}
                      </span>
                      {/* Always Arabic: the buyers are Egyptian even on the
                          English store, and this is where the money terms are
                          explained. dir is explicit so the numbers sit right. */}
                      <span
                        dir="rtl"
                        className={cn("mt-0.5 block font-sans text-[13px] leading-5 text-gray-500", isAr ? "text-right" : "text-left")}
                      >
                        {isFull
                          ? "ادفع كامل قيمة الطلب الآن — طلبك يتجهز ويوصلك أسرع"
                          : `ادفع ${money(depositAmount)} ج.م الآن، والباقي عند الاستلام`}
                      </span>
                    </span>
                    <span className="shrink-0 font-sans text-[14px] font-semibold tabular-nums text-ink">
                      {money(isFull ? goodsTotal : depositAmount)}
                      <span className="ms-1 text-[12px] font-normal text-gray-500">{isAr ? "ج.م" : "EGP"}</span>
                    </span>
                  </button>

                  {/* Panel under the chosen option (Shopify's "you'll be
                      redirected" box). */}
                  {selected && (
                    <div className="border-t border-gray-300 bg-gray-50 px-6 py-6 text-center">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 252 110"
                        className="mx-auto h-[54px] w-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <rect x="2" y="2" width="124" height="88" />
                        <path d="M2 20h124" />
                        <circle cx="14" cy="11" r="2" fill="currentColor" stroke="none" />
                        <circle cx="23" cy="11" r="2" fill="currentColor" stroke="none" />
                        <path d="M146 46h44m0 0-12-12m12 12-12 12" />
                        <rect x="204" y="10" width="46" height="96" />
                        <path d="M220 94h14" />
                      </svg>
                      <p className="mx-auto mt-4 max-w-[320px] font-sans text-[14px] leading-5 text-gray-600">
                        {isAr
                          ? "بعد ما تضغطي «ادفع الآن» هيتم تحويلك لـ EasyKash عشان تكملي الدفع بأمان."
                          : "After clicking “Pay now”, you will be redirected to EasyKash to complete your purchase securely."}
                      </p>
                      <div className="mt-4 flex justify-center">
                        <AcceptedPaymentBrands isAr={isAr} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Pay now ─────────────────────────────────────── */}
        <div>
          <Button
            type="submit"
            className={cn(
              "h-14 w-full text-[13px] tracking-[0.16em]",
              (isProcessing || isRedirecting) && "cursor-not-allowed opacity-60"
            )}
            disabled={isProcessing || isRedirecting}
            onMouseEnter={() => router.prefetch(`/order-success`)}
          >
            {isProcessing || isRedirecting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                {isAr ? "جاري التحويل لبوابة الدفع..." : "Redirecting to payment..."}
              </span>
            ) : (
              <span>{chargeLabel}</span>
            )}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-sans text-[12px] leading-4 text-gray-500">
            <Lock className="size-3 shrink-0" strokeWidth={1.5} />
            {isAr
              ? "الدفع عبر EasyKash — بيانات بطاقتك لا تمر على متجرنا"
              : "Secured by EasyKash — your card details never touch our store"}
          </p>

          {/* Required by Egypt's data protection law once we store what was
              typed before submit — and it is also just the honest thing to say. */}
          <p className="mt-2 text-center font-sans text-[12px] leading-4 text-gray-500">
            {isAr
              ? "بنحفظ بياناتك عشان نقدر نساعدك تكمل طلبك لو حصلت مشكلة."
              : "We save your details so we can help you complete your order if something goes wrong."}
          </p>
        </div>
      </form>
    );
  }
);

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
