"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { egyptGovernoratesAr, egyptGovernoratesEn, type CheckoutFormData, emptyFormData } from "@/lib/checkout-utils";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Check,
  ChevronsUpDown,
  CreditCard,
  Wallet,
  User,
  Phone,
  MapPin,
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
import PaymentModal from "./PaymentModal";

type PaymentMethod = "visa" | "wallet";

type Props = {
  onSubmit: (data: CheckoutFormData & { paymentMethod: PaymentMethod }) => Promise<void>;
  isProcessing: boolean;
  totalAmount: string;
  onGovernorateChange?: (governorate: string) => void;
  onPhoneChange?: (phone: string) => void;
};

// Validate phone: only digits, optionally starting with +
const isValidPhone = (value: string): boolean => {
  if (!value) return true;
  return /^\+?\d*$/.test(value);
};

const CheckoutForm = memo(({ onSubmit, isProcessing, totalAmount, onGovernorateChange, onPhoneChange }: Props) => {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === "ar";
  
  const governoratesList = useMemo(() => {
    return locale === 'ar' ? egyptGovernoratesAr : egyptGovernoratesEn;
  }, [locale]);
  
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('checkout_form_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...emptyFormData, ...parsed };
        }
      } catch {}
    }
    return emptyFormData;
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("visa");
  const [governorateOpen, setGovernorateOpen] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try { localStorage.setItem('checkout_form_data', JSON.stringify(updated)); } catch {}
      return updated;
    });
    
    if (field === 'governorate' && onGovernorateChange) {
      onGovernorateChange(value);
    }
  }, [onGovernorateChange]);

  const handlePhoneChange = useCallback((value: string) => {
    if (isValidPhone(value)) {
      handleInputChange("phone", value);
      setPhoneError(false);
      if (onPhoneChange) onPhoneChange(value);
    } else {
      setPhoneError(true);
    }
  }, [handleInputChange, onPhoneChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Open payment modal instead of directly submitting
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await onSubmit({ ...formData, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
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
            <Label htmlFor="name" className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block">
              {isAr ? "الاسم" : "Full Name"} <span className="text-red-500">*</span>
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
            <Label htmlFor="phone" className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block">
              {isAr ? "رقم الموبايل" : "Phone Number"} <span className="text-red-500">*</span>
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
                placeholder={isAr ? "01xxxxxxxxx" : "01xxxxxxxxx"}
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

      {/* Divider */}
      <div className="h-px bg-[#d4c9bc]" />

      {/* Address Info */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            {isAr ? "عنوان التوصيل" : "Delivery Address"}
          </h3>
        </div>

        <div className="space-y-4">
          {/* Governorate & City - side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Governorate */}
            <div>
              <Label htmlFor="governorate" className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block">
                {isAr ? "المحافظة" : "Governorate"} <span className="text-red-500">*</span>
              </Label>
              <Popover open={governorateOpen} onOpenChange={setGovernorateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={governorateOpen}
                    className="w-full justify-between bg-white/80 h-12 rounded-xl border border-[#c8bdb0]/70 text-sm font-normal shadow-sm hover:bg-white hover:border-foreground/40 transition-all"
                  >
                    {formData.governorate || (isAr ? "اختر المحافظة" : "Select governorate")}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 rounded-sm" align="start">
                  <Command>
                    <CommandInput placeholder={isAr ? "ابحث عن المحافظة" : "Search governorate"} />
                    <CommandEmpty>{isAr ? "لم يتم العثور على نتائج" : "No results found"}</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {governoratesList.map((gov) => (
                        <CommandItem
                          key={gov}
                          value={gov}
                          onSelect={(currentValue) => {
                            handleInputChange("governorate", currentValue === formData.governorate ? "" : currentValue);
                            setGovernorateOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.governorate === gov ? "opacity-100" : "opacity-0"
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
              <Label htmlFor="city" className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block">
                {isAr ? "المدينة" : "City"} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder={isAr ? "أدخل اسم المدينة" : "Enter city name"}
                value={formData.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="h-12 rounded-xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm shadow-sm transition-all"
                required
              />
            </div>
          </div>

          {/* Detailed Address */}
          <div>
            <Label htmlFor="detailedAddress" className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block">
              {isAr ? "العنوان بالتفصيل" : "Detailed Address"} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="detailedAddress"
              placeholder={isAr ? "الشارع، رقم المبنى، الشقة، أي علامة مميزة..." : "Street, building number, apartment, landmarks..."}
              value={formData.detailedAddress || ""}
              onChange={(e) => handleInputChange("detailedAddress", e.target.value)}
              className="min-h-[100px] p-4 rounded-2xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm resize-none shadow-sm transition-all"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs font-medium tracking-wider uppercase text-foreground/70 mb-2 block">
              {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={isAr ? "أي تعليمات خاصة للتوصيل..." : "Any special delivery instructions..."}
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[80px] p-4 rounded-2xl border border-[#c8bdb0]/70 bg-white/80 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground text-sm resize-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#d4c9bc]" />

      {/* Payment Method */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            {isAr ? "طريقة الدفع" : "Payment Method"}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Visa / Credit Card */}
          <button
            type="button"
            onClick={() => setPaymentMethod("visa")}
            className={cn(
              "flex flex-col items-center gap-2.5 p-5 border rounded-2xl transition-all duration-300",
              paymentMethod === "visa"
                ? "border-[#2D2A26] bg-white shadow-md ring-1 ring-[#2D2A26]/10 scale-[1.02]"
                : "border-[#c8bdb0]/70 bg-white/60 hover:border-foreground/40 hover:bg-white"
            )}
          >
            <CreditCard className={cn(
              "w-6 h-6",
              paymentMethod === "visa" ? "text-[#2D2A26]" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs font-semibold tracking-widest uppercase",
              paymentMethod === "visa" ? "text-[#2D2A26]" : "text-muted-foreground"
            )}>
              {isAr ? "بطاقة ائتمان" : "Credit Card"}
            </span>
          </button>

          {/* Wallet */}
          <button
            type="button"
            onClick={() => setPaymentMethod("wallet")}
            className={cn(
              "flex flex-col items-center gap-2.5 p-5 border rounded-2xl transition-all duration-300",
              paymentMethod === "wallet"
                ? "border-[#2D2A26] bg-white shadow-md ring-1 ring-[#2D2A26]/10 scale-[1.02]"
                : "border-[#c8bdb0]/70 bg-white/60 hover:border-foreground/40 hover:bg-white"
            )}
          >
            <Wallet className={cn(
              "w-6 h-6",
              paymentMethod === "wallet" ? "text-[#2D2A26]" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs font-semibold tracking-widest uppercase",
              paymentMethod === "wallet" ? "text-[#2D2A26]" : "text-muted-foreground"
            )}>
              {isAr ? "محفظة إلكترونية" : "E-Wallet"}
            </span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={cn(
          "w-full h-14 rounded-full bg-[#2D2A26] hover:bg-black text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 shadow-xl border border-white/10 mt-4",
          "hover:scale-[1.02]",
          isProcessing && "opacity-50 cursor-not-allowed hover:scale-100"
        )}
        disabled={isProcessing}
        onMouseEnter={() => router.prefetch(`/${locale}/order-success`)}
      >
        {isProcessing ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAr ? "جاري المعالجة..." : "Processing..."}
          </span>
        ) : (
          <span>
            {isAr ? `تأكيد الطلب — ${totalAmount} جنيه` : `Confirm Order — ${totalAmount} EGP`}
          </span>
        )}
      </button>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        paymentMethod={paymentMethod}
        totalAmount={totalAmount}
      />
    </form>
  );
});

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
