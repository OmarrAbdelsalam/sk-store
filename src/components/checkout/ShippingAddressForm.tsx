import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown } from "lucide-react";
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
    <div className="border border-border">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-border">
        <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase">{t("title")}</h3>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <Label htmlFor="governorate" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
            {t("governorate")}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-transparent h-12 rounded-none border-border text-sm font-normal"
              >
                {formData.governorate || t("selectGovernorate")}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 rounded-none" align="start">
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
          <Label htmlFor="city" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
            {t("city")}
          </Label>
          <Input
            id="city"
            placeholder={t("cityPlaceholder")}
            value={formData.city}
            onChange={(e) => onInputChange("city", e.target.value)}
            className="h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm"
            required
          />
        </div>

        <div>
          <Label htmlFor="detailedAddress" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
            {t("detailedAddress")}
          </Label>
          <Textarea
            id="detailedAddress"
            placeholder={t("detailedAddressPlaceholder")}
            value={formData.detailedAddress}
            onChange={(e) => onInputChange("detailedAddress", e.target.value)}
            className="min-h-[80px] rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm resize-none"
            required
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
            {t("notes")}
          </Label>
          <Textarea
            id="notes"
            placeholder={t("notesPlaceholder")}
            value={formData.notes}
            onChange={(e) => onInputChange("notes", e.target.value)}
            className="min-h-[60px] rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
});

ShippingAddressForm.displayName = "ShippingAddressForm";
export default ShippingAddressForm;
