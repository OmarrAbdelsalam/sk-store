import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone } from "lucide-react";
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
    <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t("title")}</h3>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 mb-2">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            {t("name")}
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            className="h-11 rounded-xl"
            placeholder={t("namePlaceholder")}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 mb-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            {t("phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`h-11 rounded-xl ${phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            placeholder={t("phonePlaceholder")}
            required
          />
          {phoneError && (
            <p className="text-sm text-red-500 mt-1">{t("phoneError")}</p>
          )}
        </div>
      </div>
    </div>
  );
});

PersonalInfoForm.displayName = "PersonalInfoForm";
export default PersonalInfoForm;
