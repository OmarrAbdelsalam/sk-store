import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange("phone", e.target.value)}
            className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {phoneError && (
            <p className="text-sm text-red-500 mt-1">{t("phoneError")}</p>
          )}
        </div>

        <div>
          <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            value={formData.whatsAppNumber}
            onChange={(e) => handlePhoneChange("whatsAppNumber", e.target.value)}
            className={whatsappError ? "border-red-500 focus-visible:ring-red-500" : ""}
            placeholder={t("whatsappPlaceholder")}
          />
          {whatsappError && (
            <p className="text-sm text-red-500 mt-1">{t("phoneError")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onInputChange("lastName", e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PersonalInfoForm.displayName = "PersonalInfoForm";
export default PersonalInfoForm;
