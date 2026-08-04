"use client";

import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Loader2,
  Check,
  ChevronsUpDown,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Zap,
  SplitSquareHorizontal,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AcceptedPaymentBrands } from "@/components/checkout/PaymentBrands";

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
    const [governorateOpen, setGovernorateOpen] = useState(false);
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
    const money = useMemo(() => {
      const nf = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return (value: number) => nf.format(value);
    }, [locale]);

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
      ? `ادفع الآن • ${money(onlineCharge)} ج.م`
      : `Pay Now • ${money(onlineCharge)} EGP`;

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Personal Info ─────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              {isAr ? "البيانات الشخصية" : "Personal Info"}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label
                htmlFor="name"
                className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
              >
                {isAr ? "الاسم" : "Full Name"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={captureProgress}
                className="h-12 rounded-xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm shadow-sm transition-all"
                placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label
                htmlFor="phone"
                className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
              >
                {isAr ? "رقم الموبايل" : "Phone Number"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={captureProgress}
                  className={cn(
                    "h-12 rounded-xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm shadow-sm transition-all",
                    phoneError && "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="01xxxxxxxxx"
                  required
                />
                <Phone className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              </div>
              {phoneError && (
                <p className="text-xs text-red-500 mt-1.5">
                  {isAr ? "أرقام فقط" : "Numbers only"}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label
                htmlFor="email"
                className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
              >
                {isAr ? "البريد الإلكتروني" : "Email"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
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
                  className={cn(
                    "h-12 rounded-xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm shadow-sm transition-all text-start",
                    emailError && "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="name@example.com"
                  required
                />
                <Mail className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              </div>
              {emailError ? (
                <p className="text-xs text-red-500 mt-1.5">
                  {isAr
                    ? "اكتبي بريد إلكتروني صحيح، مثال: name@example.com"
                    : "Enter a valid email, e.g. name@example.com"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1.5">
                  {isAr
                    ? "هنبعتلك تأكيد الطلب عليه"
                    : "We'll send your order confirmation here"}
                </p>
              )}
            </div>
          </div>

          {/* Required by Egypt's data protection law once we store what was
              typed before submit — and it is also just the honest thing to say. */}
          <p className="text-[11px] leading-relaxed text-muted-foreground/80 mt-4">
            {isAr
              ? "بنحفظ بياناتك عشان نقدر نساعدك تكمل طلبك لو حصلت مشكلة."
              : "We save your details so we can help you complete your order if something goes wrong."}
          </p>
        </div>

        <div className="h-px bg-[#d4c9bc]" />

        {/* ── Delivery Address ──────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              {isAr ? "عنوان التوصيل" : "Delivery Address"}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Governorate */}
              <div>
                <Label
                  htmlFor="governorate"
                  className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
                >
                  {isAr ? "المحافظة" : "Governorate"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={governorateOpen}
                  onOpenChange={setGovernorateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={governorateOpen}
                      className="w-full justify-between bg-white/80 h-12 rounded-xl border border-[#c8bdb0]/70 text-sm font-normal shadow-sm hover:bg-white hover:border-foreground/40 transition-all"
                    >
                      {formData.governorate ||
                        (isAr ? "اختر المحافظة" : "Select governorate")}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 rounded-sm" align="start">
                    <Command>
                      <CommandInput
                        placeholder={
                          isAr ? "ابحث عن المحافظة" : "Search governorate"
                        }
                      />
                      <CommandEmpty>
                        {isAr
                          ? "لم يتم العثور على نتائج"
                          : "No results found"}
                      </CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {governoratesList.map((gov) => (
                          <CommandItem
                            key={gov}
                            value={gov}
                            onSelect={(currentValue) => {
                              handleInputChange(
                                "governorate",
                                currentValue === formData.governorate
                                  ? ""
                                  : currentValue
                              );
                              setGovernorateOpen(false);
                              // formRef still holds the pre-select value on this
                              // tick, so let state settle before snapshotting.
                              setTimeout(captureProgress, 0);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.governorate === gov
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {gov}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* City */}
              <div>
                <Label
                  htmlFor="city"
                  className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
                >
                  {isAr ? "المدينة" : "City"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder={
                    isAr ? "أدخل اسم المدينة" : "Enter city name"
                  }
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onBlur={captureProgress}
                  className="h-12 rounded-xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Detailed Address */}
            <div>
              <Label
                htmlFor="detailedAddress"
                className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
              >
                {isAr ? "العنوان بالتفصيل" : "Detailed Address"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="detailedAddress"
                placeholder={
                  isAr
                    ? "الشارع، رقم المبنى، الشقة، أي علامة مميزة..."
                    : "Street, building number, apartment, landmarks..."
                }
                value={formData.detailedAddress || ""}
                onChange={(e) =>
                  handleInputChange("detailedAddress", e.target.value)
                }
                onBlur={captureProgress}
                className="min-h-[100px] p-4 rounded-2xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm resize-none shadow-sm transition-all"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <Label
                htmlFor="notes"
                className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block"
              >
                {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  isAr
                    ? "أي تعليمات خاصة للتوصيل..."
                    : "Any special delivery instructions..."
                }
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[80px] p-4 rounded-2xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm resize-none shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#d4c9bc]" />

        {/* ── Payment Method Selection ─────────────────────── */}
        <div className="space-y-3 pt-1">
          <h3 className="text-sm font-bold text-gray-900">
            {isAr ? "طريقة الدفع" : "Payment Method"}
          </h3>

          {/* A real radiogroup: arrow keys move between options and Space
              selects, which a div with onClick never supported. */}
          <div
            role="radiogroup"
            aria-label={isAr ? "طريقة الدفع" : "Payment method"}
            className="rounded-xl border border-gray-300 bg-white overflow-hidden divide-y divide-gray-200"
          >
            {PAYMENT_PLANS.map((plan) => {
              const selected = paymentPlan === plan;
              const isFull = plan === "full";

              return (
                <button
                  key={plan}
                  type="button"
                  role="radio"
                  aria-checked={selected}
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
                    "w-full flex items-start gap-3 p-4 text-start transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset",
                    selected ? "bg-[#fcfaf7]" : "bg-white hover:bg-gray-50/70"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-[18px] h-[18px] mt-0.5 rounded-full border flex items-center justify-center transition-all shrink-0",
                      selected ? "border-black bg-black" : "border-gray-300 bg-white"
                    )}
                  >
                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-900 block">
                      {isFull
                        ? isAr
                          ? "دفع كامل أونلاين"
                          : "Pay in full"
                        : isAr
                        ? "دفع 50% مقدم"
                        : "Pay 50% deposit"}
                    </span>
                    {/* Always Arabic: the buyers are Egyptian even when they're
                        browsing the English store, and this line is where the
                        money terms are explained. dir is set explicitly so the
                        numbers sit correctly inside the Arabic text on the LTR
                        page, with alignment forced to follow the page. */}
                    <span
                      dir="rtl"
                      className={cn(
                        "text-xs text-muted-foreground block mt-0.5",
                        isAr ? "text-right" : "text-left"
                      )}
                    >
                      {isFull
                        ? "ادفع كامل قيمة الطلب الآن — طلبك يتجهز ويوصلك أسرع"
                        : `ادفع ${money(depositAmount)} ج.م الآن، والباقي عند الاستلام`}
                    </span>
                  </span>

                  <span className="text-sm font-bold text-gray-900 shrink-0 tabular-nums">
                    {money(isFull ? goodsTotal : depositAmount)}
                    <span className="text-[10px] font-medium text-muted-foreground ms-1">
                      {isAr ? "ج.م" : "EGP"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* One row for every method the gateway accepts — both plans support
              all of them, so listing them per option was misleading. */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <AcceptedPaymentBrands isAr={isAr} />
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="w-3 h-3 shrink-0" />
              {isAr
                ? "الدفع عبر EasyKash — بيانات بطاقتك لا تمر على متجرنا"
                : "Secured by EasyKash — your card details never touch our store"}
            </span>
          </div>
        </div>

        {/* Error */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {paymentError}
          </div>
        )}

        {/* ── Submit ────────────────────────────────────── */}
        <button
          type="submit"
          className={cn(
            "w-full h-14 rounded-full bg-black text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 shadow-xl border border-white/10 mt-4",
            "hover:scale-[1.02]",
            (isProcessing || isRedirecting) &&
              "opacity-50 cursor-not-allowed hover:scale-100"
          )}
          disabled={isProcessing || isRedirecting}
          onMouseEnter={() => router.prefetch(`/order-success`)}
        >
          {isProcessing || isRedirecting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAr ? "جاري التحويل لبوابة الدفع..." : "Redirecting to payment..."}
            </span>
          ) : (
            <span>{isAr ? `${chargeLabel}` : chargeLabel}</span>
          )}
        </button>
      </form>
    );
  }
);

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
