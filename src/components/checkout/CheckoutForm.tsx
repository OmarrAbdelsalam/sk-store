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
  User, 
  Phone, 
  MapPin, 
  Building, 
  FileText,
  Check,
  ChevronsUpDown,
  CreditCard,
  Banknote
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
};

// Validate phone: only digits, optionally starting with +
const isValidPhone = (value: string): boolean => {
  if (!value) return true;
  return /^\+?\d*$/.test(value);
};

const CheckoutForm = memo(({ onSubmit, isProcessing, totalAmount, onGovernorateChange }: Props) => {
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
    } else {
      setPhoneError(true);
    }
  }, [handleInputChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({ ...formData, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* الفورم الرئيسي */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold">
              {isAr ? "بيانات الشحن" : "Shipping Details"}
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* الاسم */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {isAr ? "الاسم" : "Name"}
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-11 rounded-xl"
              placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
              required
            />
          </div>

          {/* رقم الموبايل */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 mb-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              {isAr ? "رقم الموبايل" : "Phone Number"}
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={formData.phone || ""}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={`h-11 rounded-xl ${phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder={isAr ? "أدخل رقم الموبايل" : "Enter phone number"}
              required
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">
                {isAr ? "أرقام فقط" : "Numbers only"}
              </p>
            )}
          </div>

          {/* المحافظة */}
          <div>
            <Label htmlFor="governorate" className="text-sm font-medium flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {isAr ? "المحافظة" : "Governorate"}
            </Label>
            <Popover open={governorateOpen} onOpenChange={setGovernorateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={governorateOpen}
                  className="w-full justify-between bg-background h-11 rounded-xl"
                >
                  {formData.governorate || (isAr ? "اختر المحافظة" : "Select governorate")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
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

          {/* المدينة */}
          <div>
            <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2 mb-2">
              <Building className="w-3.5 h-3.5 text-muted-foreground" />
              {isAr ? "المدينة" : "City"}
            </Label>
            <Input
              id="city"
              placeholder={isAr ? "أدخل اسم المدينة" : "Enter city name"}
              value={formData.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* العنوان بالتفصيل */}
          <div>
            <Label htmlFor="detailedAddress" className="text-sm font-medium flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {isAr ? "العنوان بالتفصيل" : "Detailed Address"}
            </Label>
            <Textarea
              id="detailedAddress"
              placeholder={isAr ? "الشارع، رقم المبنى، الشقة، أي علامة مميزة..." : "Street, building number, apartment, landmarks..."}
              value={formData.detailedAddress || ""}
              onChange={(e) => handleInputChange("detailedAddress", e.target.value)}
              className="min-h-[80px] rounded-xl resize-none"
              required
            />
          </div>

          {/* ملاحظات */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={isAr ? "أي تعليمات خاصة للتوصيل..." : "Any special delivery instructions..."}
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[60px] rounded-xl resize-none"
            />
          </div>
        </div>
      </div>

      {/* طريقة الدفع */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold">
              {isAr ? "طريقة الدفع" : "Payment Method"}
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            {/* كاش */}
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                paymentMethod === "cash"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "p-3 rounded-full transition-colors",
                paymentMethod === "cash" ? "bg-primary/20" : "bg-muted"
              )}>
                <Banknote className={cn(
                  "w-6 h-6",
                  paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "font-medium text-sm",
                paymentMethod === "cash" ? "text-primary" : "text-foreground"
              )}>
                {isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}
              </span>
              {paymentMethod === "cash" && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* فيزا */}
            <button
              type="button"
              onClick={() => setPaymentMethod("visa")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                paymentMethod === "visa"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "p-3 rounded-full transition-colors",
                paymentMethod === "visa" ? "bg-primary/20" : "bg-muted"
              )}>
                <CreditCard className={cn(
                  "w-6 h-6",
                  paymentMethod === "visa" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "font-medium text-sm",
                paymentMethod === "visa" ? "text-primary" : "text-foreground"
              )}>
                {isAr ? "بطاقة ائتمان" : "Credit Card"}
              </span>
              {paymentMethod === "visa" && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>

          {paymentMethod === "visa" && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400 text-center">
                {isAr 
                  ? "⚠️ الدفع بالبطاقة سيكون متاح قريباً" 
                  : "⚠️ Card payment coming soon"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* زر التأكيد */}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-md 
          hover:shadow-lg transition-all duration-300 group" 
        disabled={isProcessing || paymentMethod === "visa"}
        onMouseEnter={() => router.prefetch(`/${locale}/order-success`)}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 me-2 animate-spin" />
            {isAr ? "جاري المعالجة..." : "Processing..."}
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5 me-2" />
            {isAr ? `تأكيد الطلب - ${totalAmount} جنيه` : `Confirm Order - ${totalAmount} EGP`}
          </>
        )}
      </Button>
    </form>
  );
});

CheckoutForm.displayName = "CheckoutForm";
export default CheckoutForm;
