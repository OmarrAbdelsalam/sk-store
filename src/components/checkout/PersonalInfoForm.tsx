import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState, useCallback } from "react";

interface PersonalInfoFormProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    whatsAppNumber: string;
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
  const [whatsappError, setWhatsappError] = useState(false);
  
  const handlePhoneChange = useCallback((field: string, value: string) => {
    // Allow + only at the start, then only digits
    if (isValidPhone(value)) {
      onInputChange(field, value);
      if (field === "phone") setPhoneError(false);
      if (field === "whatsAppNumber") setWhatsappError(false);
    } else {
      // Show error briefly
      if (field === "phone") setPhoneError(true);
      if (field === "whatsAppNumber") setWhatsappError(true);
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
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2 mb-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            {t("phone")}
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange("phone", e.target.value)}
            className={`h-11 rounded-xl ${phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {phoneError && (
            <p className="text-sm text-red-500 mt-1">{t("phoneError")}</p>
          )}
        </div>

        <div>
          <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2 mb-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            {t("whatsapp")}
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            value={formData.whatsAppNumber}
            onChange={(e) => handlePhoneChange("whatsAppNumber", e.target.value)}
            className={`h-11 rounded-xl ${whatsappError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            placeholder={t("whatsappPlaceholder")}
          />
          {whatsappError && (
            <p className="text-sm text-red-500 mt-1">{t("phoneError")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">{t("firstName")}</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              className="h-11 rounded-xl"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">{t("lastName")}</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onInputChange("lastName", e.target.value)}
              className="h-11 rounded-xl"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PersonalInfoForm.displayName = "PersonalInfoForm";
export default PersonalInfoForm;
