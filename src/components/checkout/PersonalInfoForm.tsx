import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { memo, useState, useCallback } from "react";

interface PersonalInfoFormProps {
  formData: {
    name: string;
    phone: string;
  };
  onInputChange: (field: string, value: string) => void;
}

// Validate phone: only digits, optionally starting with +
const isValidPhone = (value: string): boolean => {
  if (!value) return true; // Empty is valid (required handled separately)
  return /^\+?\d*$/.test(value);
};

const PersonalInfoForm = memo(({ formData, onInputChange }: PersonalInfoFormProps) => {
  const t = useTranslations("PersonalInfo");
  const [phoneError, setPhoneError] = useState(false);
  
  const handlePhoneChange = useCallback((value: string) => {
    // Allow + only at the start, then only digits
    if (isValidPhone(value)) {
      onInputChange("phone", value);
      setPhoneError(false);
    } else {
      // Show error briefly
      setPhoneError(true);
    }
  }, [onInputChange]);
  
  return (
    <div className="border border-border">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-border">
        <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase">{t("title")}</h3>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <Label htmlFor="name" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
            {t("name")}
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            className="h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm"
            placeholder={t("namePlaceholder")}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
            {t("phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm ${phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            placeholder={t("phonePlaceholder")}
            required
          />
          {phoneError && (
            <p className="text-xs text-red-500 mt-2">{t("phoneError")}</p>
          )}
        </div>
      </div>
    </div>
  );
});

PersonalInfoForm.displayName = "PersonalInfoForm";
export default PersonalInfoForm;
