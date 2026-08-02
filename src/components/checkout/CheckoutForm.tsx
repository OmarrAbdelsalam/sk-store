"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  egyptGovernoratesAr,
  egyptGovernoratesEn,
  type CheckoutFormData,
  emptyFormData,
} from "@/lib/checkout-utils";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  CreditCard,
  User,
  Phone,
  MapPin,
  Zap,
  SplitSquareHorizontal,
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

export type PaymentPlan = "full" | "deposit";

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
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Deposit = 50% upfront
    const depositAmount = parseFloat((totalPrice * 0.5).toFixed(2));
    const remainingAmount = totalPrice - depositAmount;

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
      setIsRedirecting(true);

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

    const chargeLabel =
      paymentPlan === "deposit"
        ? isAr
          ? `دفع الآن ${depositAmount.toLocaleString()} جنيه (50٪ مقدم)`
          : `Pay now ${depositAmount.toLocaleString()} EGP (50% deposit)`
        : isAr
        ? `ادفع ${totalAmount} جنيه`
        : `Pay ${totalAmount} EGP`;

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
          </div>
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

        {/* ── Payment Plan ──────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              {isAr ? "خطة الدفع" : "Payment Plan"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Full Payment */}
            <button
              type="button"
              onClick={() => setPaymentPlan("full")}
              className={cn(
                "flex flex-col items-start gap-2 p-4 border rounded-2xl transition-all duration-300 text-start",
                paymentPlan === "full"
                  ? "border-gray-900 bg-white shadow-md ring-1 ring-gray-900/10"
                  : "border-[#c8bdb0]/70 bg-white/60 hover:border-foreground/40 hover:bg-white"
              )}
            >
              <div className="flex items-center gap-2">
                <Zap
                  className={cn(
                    "w-4 h-4",
                    paymentPlan === "full"
                      ? "text-gray-900"
                      : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-bold tracking-wider uppercase",
                    paymentPlan === "full"
                      ? "text-gray-900"
                      : "text-muted-foreground"
                  )}
                >
                  {isAr ? "الدفع الكامل" : "Full Payment"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {isAr
                  ? `ادفع كامل المبلغ ${totalAmount} جنيه الآن`
                  : `Pay full ${totalAmount} EGP now`}
              </p>
            </button>

            {/* Deposit */}
            <button
              type="button"
              onClick={() => setPaymentPlan("deposit")}
              className={cn(
                "flex flex-col items-start gap-2 p-4 border rounded-2xl transition-all duration-300 text-start",
                paymentPlan === "deposit"
                  ? "border-gray-900 bg-white shadow-md ring-1 ring-gray-900/10"
                  : "border-[#c8bdb0]/70 bg-white/60 hover:border-foreground/40 hover:bg-white"
              )}
            >
              <div className="flex items-center gap-2">
                <SplitSquareHorizontal
                  className={cn(
                    "w-4 h-4",
                    paymentPlan === "deposit"
                      ? "text-gray-900"
                      : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-bold tracking-wider uppercase",
                    paymentPlan === "deposit"
                      ? "text-gray-900"
                      : "text-muted-foreground"
                  )}
                >
                  {isAr ? "دفعة أولى" : "Deposit"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {isAr
                  ? `ادفع ${depositAmount.toLocaleString()} جنيه الآن و${remainingAmount.toLocaleString()} عند الاستلام`
                  : `Pay ${depositAmount.toLocaleString()} EGP now + ${remainingAmount.toLocaleString()} on delivery`}
              </p>
            </button>
          </div>

          {/* Deposit info banner */}
          {paymentPlan === "deposit" && (
            <div className="mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
              {isAr
                ? `ستدفع ${depositAmount.toLocaleString()} جنيه الآن عبر بوابة الدفع، والمبلغ المتبقي ${remainingAmount.toLocaleString()} جنيه عند استلام طلبك.`
                : `You'll pay ${depositAmount.toLocaleString()} EGP now via the payment gateway, and the remaining ${remainingAmount.toLocaleString()} EGP when your order is delivered.`}
            </div>
          )}

          {/* Accepted methods note */}
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            {isAr
              ? "مقبول: بطاقات ائتمان · محافظ إلكترونية · فوري · أمان · ميزة"
              : "Accepted: Credit/Debit Cards · E-Wallets · Fawry · Aman · Meeza"}
          </p>
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
          onMouseEnter={() => router.prefetch(`/${locale}/order-success`)}
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
