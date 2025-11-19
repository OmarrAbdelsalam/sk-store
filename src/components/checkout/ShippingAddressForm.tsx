import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
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

interface ShippingAddressFormProps {
  formData: {
    governorate: string;
    city: string;
    area: string;
    street: string;
    buildingNo: string;
    apartment: string;
    detailedAddress: string;
    notes: string;
  };
  egyptGovernorates: string[];
  onInputChange: (field: string, value: string) => void;
}

const ShippingAddressForm = memo(({ formData, egyptGovernorates, onInputChange }: ShippingAddressFormProps) => {
  const t = useTranslations("ShippingAddress");
  const [open, setOpen] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="governorate">{t("governorate")}</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-background"
              >
                {formData.governorate || t("selectGovernorate")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder={t("searchGovernorate")} />
                <CommandEmpty>{t("noGovernorateFound")}</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {egyptGovernorates.map((gov) => (
                    <CommandItem
                      key={gov}
                      value={gov}
                      onSelect={(currentValue) => {
                        onInputChange("governorate", currentValue === formData.governorate ? "" : currentValue);
                        setOpen(false);
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

        <div>
          <Label htmlFor="city">{t("city")}</Label>
          <Input
            id="city"
            placeholder={t("cityPlaceholder")}
            value={formData.city}
            onChange={(e) => onInputChange("city", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="area">{t("area")}</Label>
          <Input
            id="area"
            placeholder={t("areaPlaceholder")}
            value={formData.area}
            onChange={(e) => onInputChange("area", e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="street">{t("street")}</Label>
          <Input
            id="street"
            placeholder={t("streetPlaceholder")}
            value={formData.street}
            onChange={(e) => onInputChange("street", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buildingNo">{t("buildingNo")}</Label>
            <Input
              id="buildingNo"
              placeholder={t("buildingPlaceholder")}
              value={formData.buildingNo}
              onChange={(e) => onInputChange("buildingNo", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="apartment">{t("apartment")}</Label>
            <Input
              id="apartment"
              placeholder={t("apartmentPlaceholder")}
              value={formData.apartment}
              onChange={(e) => onInputChange("apartment", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">{t("notes")}</Label>
          <Input
            id="notes"
            placeholder={t("notesPlaceholder")}
            value={formData.notes}
            onChange={(e) => onInputChange("notes", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
});

ShippingAddressForm.displayName = "ShippingAddressForm";
export default ShippingAddressForm;
