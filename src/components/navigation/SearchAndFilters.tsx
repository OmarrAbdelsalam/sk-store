"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useProducts } from "@/hooks/useProducts";

type ColorOption = {
  id: string;
  colorNameAr: string;
  colorNameEn: string;
  hexa: string;
};
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchAndFiltersProps {
  isTransparent?: boolean;
}

export const SearchAndFilters = ({ isTransparent = false }: SearchAndFiltersProps) => {
  const t = useTranslations("SearchFilters");
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Get colors from products instead of separate API call
  const { products } = useProducts();
  const colors = useMemo(() => {
    const colorMap = new Map<string, ColorOption>();
    
    products.forEach(product => {
      product.availableColors?.forEach(color => {
        if (!colorMap.has(color.hex)) {
          colorMap.set(color.hex, {
            id: color.hex, // Use hex as ID since we don't have separate color IDs
            colorNameAr: color.name, // This will be the localized name
            colorNameEn: color.name, // This will be the localized name
            hexa: color.hex
          });
        }
      });
    });
    
    return Array.from(colorMap.values());
  }, [products]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // read initial state from URL
  const initial = useMemo(() => ({
    search: sp.get("q") ?? "",
    priceFrom: Number(sp.get("priceFrom") ?? 0),
    priceTo: Number(sp.get("priceTo") ?? 2000),
    colorNames: sp.get("colorName")?.split(",").filter(Boolean) ?? [],
    genders: sp.get("gender")?.split(",").map(s => s.trim()).filter(Boolean) ?? [],
  }), [sp]);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initial.search);
  const [priceFrom, setPriceFrom] = useState<number>(initial.priceFrom);
  const [priceTo, setPriceTo] = useState<number>(initial.priceTo);
  const [selectedGender, setSelectedGender] = useState<string>(initial.genders[0] ?? "");
  const [selectedColor, setSelectedColor] = useState<string>(initial.colorNames[0] ?? "");
  const [genderOpen, setGenderOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  // Colors are now extracted from products, no separate API call needed

  // sync when URL changes elsewhere
  useEffect(() => {
    setSearchQuery(initial.search);
    setPriceFrom(initial.priceFrom);
    setPriceTo(initial.priceTo);
    setSelectedGender(initial.genders[0] ?? "");
    setSelectedColor(initial.colorNames[0] ?? "");
  }, [initial]);

  const selectGender = (gender: string) => {
    setSelectedGender(gender);
    setGenderOpen(false);
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
    setColorOpen(false);
  };

  const apply = () => {
    const params = new URLSearchParams(sp.toString());

    params.set("priceFrom", String(priceFrom));
    params.set("priceTo", String(priceTo));

    if (selectedGender) {
      params.set("gender", selectedGender);
    } else {
      params.delete("gender");
    }

    if (selectedColor) {
      params.set("colorName", selectedColor);
    } else {
      params.delete("colorName");
    }

    if (searchQuery?.trim()) params.set("q", searchQuery.trim());
    else params.delete("q");

    // clean legacy params if any
    params.delete("categoryId");
    params.delete("category");

    router.push(`/${locale}/products?${params.toString()}`);
    setOpen(false);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("priceFrom");
    params.delete("priceTo");
    params.delete("colorName");
    params.delete("gender");
    params.delete("q");
    router.push(`/${locale}/products?${params.toString()}`);
  };

  // Don't render Sheet until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className={`hover:bg-transparent transition-all px-2 ${isTransparent ? 'text-white hover:text-white/80 hover:bg-white/10' : 'hover:opacity-70'}`} 
        aria-label={t("openFilters")}
      >
        <Search className="h-6 w-6" strokeWidth={1.2} color={isTransparent ? "white" : "black"} />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`hover:bg-transparent transition-all px-2 ${isTransparent ? 'text-white hover:text-white/80 hover:bg-white/10' : 'hover:opacity-70'}`} 
          aria-label={t("openFilters")}
        >
          <Search className="h-6 w-6" strokeWidth={1.2} color={isTransparent ? "white" : "black"} />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Search */}
          <div className="space-y-3">
            <Label className="font-medium" htmlFor="products-search">{t("searchLabel")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="products-search"
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    apply();
                  }
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <Label className="font-medium">{locale === 'ar' ? 'التصنيف' : 'Badge'}</Label>
            <Popover open={genderOpen} onOpenChange={setGenderOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genderOpen}
                  className="w-full justify-between"
                >
                  {selectedGender ? (
                    locale === 'ar' 
                      ? (selectedGender === 'best_seller' ? 'الأكثر مبيعاً' 
                        : selectedGender === 'new' ? 'جديد' 
                        : selectedGender === 'sale' ? 'تخفيض'
                        : selectedGender === 'featured' ? 'مميز'
                        : 'اختر التصنيف')
                      : (selectedGender === 'best_seller' ? 'Best Seller' 
                        : selectedGender === 'new' ? 'New' 
                        : selectedGender === 'sale' ? 'Sale'
                        : selectedGender === 'featured' ? 'Featured'
                        : 'Select badge')
                  ) : (locale === 'ar' ? 'اختر التصنيف' : 'Select badge')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandGroup>
                    {[
                      { value: 'best_seller', labelEn: 'Best Seller', labelAr: 'الأكثر مبيعاً' },
                      { value: 'new', labelEn: 'New', labelAr: 'جديد' },
                      { value: 'sale', labelEn: 'Sale', labelAr: 'تخفيض' },
                      { value: 'featured', labelEn: 'Featured', labelAr: 'مميز' },
                    ].map((badge) => (
                      <CommandItem
                        key={badge.value}
                        value={badge.value}
                        onSelect={() => selectGender(badge.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedGender === badge.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {locale === 'ar' ? badge.labelAr : badge.labelEn}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Color */}
          <div className="space-y-3">
            <Label className="font-medium">{t("colorLabel")}</Label>
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={colorOpen}
                  className="w-full justify-between"
                >
                  {selectedColor ? (
                    <span className="flex items-center gap-2">
                      {colors.find(c => {
                        const colorName = locale === 'ar' ? c.colorNameAr : c.colorNameEn;
                        return colorName.toLowerCase() === selectedColor;
                      }) && (
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ 
                            backgroundColor: colors.find(c => {
                              const colorName = locale === 'ar' ? c.colorNameAr : c.colorNameEn;
                              return colorName.toLowerCase() === selectedColor;
                            })?.hexa 
                          }}
                        />
                      )}
                      {colors.find(c => {
                        const colorName = locale === 'ar' ? c.colorNameAr : c.colorNameEn;
                        return colorName.toLowerCase() === selectedColor;
                      }) ? (
                        locale === 'ar' 
                          ? colors.find(c => (locale === 'ar' ? c.colorNameAr : c.colorNameEn).toLowerCase() === selectedColor)?.colorNameAr
                          : colors.find(c => (locale === 'ar' ? c.colorNameAr : c.colorNameEn).toLowerCase() === selectedColor)?.colorNameEn
                      ) : selectedColor}
                    </span>
                  ) : t("selectColor")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t("searchColor")} />
                  <CommandEmpty>{t("noColorFound")}</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {colors.map((color) => {
                      const colorName = locale === 'ar' ? color.colorNameAr : color.colorNameEn;
                      const colorKey = colorName.toLowerCase();
                      const isSelected = selectedColor === colorKey;
                      return (
                        <CommandItem
                          key={color.id}
                          value={colorKey}
                          onSelect={() => selectColor(colorKey)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300 mr-2" 
                            style={{ backgroundColor: color.hexa }}
                          />
                          {colorName}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="font-medium text-base">{t("priceRange")}</Label>
            <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6 space-y-4 border border-border/50">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2 text-center">{t("min")}</div>
                  <Input
                    type="number"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(Math.max(0, Math.min(Number(e.target.value || 0), priceTo)))}
                    className="text-center bg-background border-border"
                    min={0}
                    max={priceTo}
                    inputMode="numeric"
                  />
                </div>
                <div className="text-muted-foreground self-end pb-2">—</div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-2 text-center">{t("max")}</div>
                  <Input
                    type="number"
                    value={priceTo}
                    onChange={(e) => setPriceTo(Math.max(priceFrom, Number(e.target.value || 2000)))}
                    className="text-center bg-background border-border"
                    min={priceFrom}
                    max={2000}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={resetFilters}>{t("reset")}</Button>
            <Button onClick={apply}>{t("apply")}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
