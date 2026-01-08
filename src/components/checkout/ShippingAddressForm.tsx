import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Check, ChevronsUpDown, Building, Home, FileText } from "lucide-react";
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
    <div className="bg-white dark:bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t("title")}</h3>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <Label htmlFor="governorate" className="text-sm font-medium mb-2 block">{t("governorate")}</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-background h-11 rounded-xl"
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
          <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2 mb-2">
            <Building className="w-3.5 h-3.5 text-muted-foreground" />
            {t("city")}
          </Label>
          <Input
            id="city"
            placeholder={t("cityPlaceholder")}
            value={formData.city}
            onChange={(e) => onInputChange("city", e.target.value)}
            className="h-11 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="area" className="text-sm font-medium mb-2 block">{t("area")}</Label>
          <Input
            id="area"
            placeholder={t("areaPlaceholder")}
            value={formData.area}
            onChange={(e) => onInputChange("area", e.target.value)}
            className="h-11 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="street" className="text-sm font-medium mb-2 block">{t("street")}</Label>
          <Input
            id="street"
            placeholder={t("streetPlaceholder")}
            value={formData.street}
            onChange={(e) => onInputChange("street", e.target.value)}
            className="h-11 rounded-xl"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buildingNo" className="text-sm font-medium flex items-center gap-2 mb-2">
              <Home className="w-3.5 h-3.5 text-muted-foreground" />
              {t("buildingNo")}
            </Label>
            <Input
              id="buildingNo"
              placeholder={t("buildingPlaceholder")}
              value={formData.buildingNo}
              onChange={(e) => onInputChange("buildingNo", e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="apartment" className="text-sm font-medium mb-2 block">{t("apartment")}</Label>
            <Input
              id="apartment"
              placeholder={t("apartmentPlaceholder")}
              value={formData.apartment}
              onChange={(e) => onInputChange("apartment", e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            {t("notes")}
          </Label>
          <Input
            id="notes"
            placeholder={t("notesPlaceholder")}
            value={formData.notes}
            onChange={(e) => onInputChange("notes", e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
});

ShippingAddressForm.displayName = "ShippingAddressForm";
export default ShippingAddressForm;
