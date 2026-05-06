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
  ShoppingBag, 
  Loader2, 
  Check,
  ChevronsUpDown,
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

type PaymentMethod = "cash" | "visa";

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
          // Merge with emptyFormData to ensure all fields exist
          return { ...emptyFormData, ...parsed };
        }
      } catch {}
    }
    return emptyFormData;
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [governorateOpen, setGovernorateOpen] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await onSubmit({ ...formData, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Shipping Details Section */}
      <div className="border border-border">
        {/* Section Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-border">
          <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase">
            {isAr ? "بيانات الشحن" : "Shipping Details"}
          </h3>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
              {isAr ? "الاسم" : "Full Name"}
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm"
              placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
              {isAr ? "رقم الموبايل" : "Phone Number"}
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={formData.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cn(
                "h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm",
                phoneError && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder={isAr ? "أدخل رقم الموبايل" : "Enter phone number"}
              required
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-2">
                {isAr ? "أرقام فقط" : "Numbers only"}
              </p>
            )}
          </div>

          {/* Governorate */}
          <div>
            <Label htmlFor="governorate" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
              {isAr ? "المحافظة" : "Governorate"}
            </Label>
            <Popover open={governorateOpen} onOpenChange={setGovernorateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={governorateOpen}
                  className="w-full justify-between bg-transparent h-12 rounded-none border-border text-sm font-normal"
                >
                  {formData.governorate || (isAr ? "اختر المحافظة" : "Select governorate")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 rounded-none" align="start">
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
            <Label htmlFor="city" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
              {isAr ? "المدينة" : "City"}
            </Label>
            <Input
              id="city"
              placeholder={isAr ? "أدخل اسم المدينة" : "Enter city name"}
              value={formData.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm"
              required
            />
          </div>

          {/* Detailed Address */}
          <div>
            <Label htmlFor="detailedAddress" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
              {isAr ? "العنوان بالتفصيل" : "Detailed Address"}
            </Label>
            <Textarea
              id="detailedAddress"
              placeholder={isAr ? "الشارع، رقم المبنى، الشقة، أي علامة مميزة..." : "Street, building number, apartment, landmarks..."}
              value={formData.detailedAddress || ""}
              onChange={(e) => handleInputChange("detailedAddress", e.target.value)}
              className="min-h-[80px] rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm resize-none"
              required
            />
          </div>

        </div>
      </div>

      {/* Payment Method Section */}
      <div className="border border-border">
        <div className="px-5 sm:px-6 py-4 border-b border-border">
          <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase">
            {isAr ? "طريقة الدفع" : "Payment Method"}
          </h3>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Cash */}
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "flex flex-col items-center gap-3 p-5 border transition-all duration-200",
                paymentMethod === "cash"
                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span className={cn(
                "text-xs font-medium tracking-widest uppercase",
                paymentMethod === "cash" ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
              )}>
                {isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}
              </span>
              {paymentMethod === "cash" && (
                <div className="h-px w-6 bg-green-600" />
              )}
            </button>

            {/* Visa */}
            <button
              type="button"
              onClick={() => setPaymentMethod("visa")}
              className={cn(
                "flex flex-col items-center gap-3 p-5 border transition-all duration-200",
                paymentMethod === "visa"
                  ? "border-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span className={cn(
                "text-xs font-medium tracking-widest uppercase",
                paymentMethod === "visa" ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
              )}>
                {isAr ? "بطاقة ائتمان" : "Credit Card"}
              </span>
              {paymentMethod === "visa" && (
                <div className="h-px w-6 bg-green-600" />
              )}
            </button>
          </div>

          {paymentMethod === "visa" && (
            <div className="mt-4 p-4 border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center tracking-wider uppercase">
                {isAr 
                  ? "الدفع بالبطاقة سيكون متاح قريباً" 
                  : "Card payment coming soon"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
          {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
        </Label>
        <Textarea
          id="notes"
          placeholder={isAr ? "أي تعليمات خاصة للتوصيل..." : "Any special delivery instructions..."}
          value={formData.notes || ""}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          className="min-h-[60px] rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={cn(
          "w-full h-14 bg-foreground text-background text-sm font-medium tracking-widest uppercase transition-all duration-300",
          "hover:bg-foreground/90 active:scale-[0.99]",
          (isProcessing || paymentMethod === "visa") && "opacity-50 cursor-not-allowed"
        )}
        disabled={isProcessing || paymentMethod === "visa"}
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
    </form>
  );
});

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
