import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

interface PersonalInfoFormProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    whatsAppNumber: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const PersonalInfoForm = memo(({ formData, onInputChange }: PersonalInfoFormProps) => {
  const t = useTranslations("PersonalInfo");
  
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
            value={formData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
          <Input
            id="whatsapp"
            value={formData.whatsAppNumber}
            onChange={(e) => onInputChange("whatsAppNumber", e.target.value)}
            placeholder={t("whatsappPlaceholder")}
          />
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
