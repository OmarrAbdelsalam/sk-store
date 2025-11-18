"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { getColors, type ColorOption } from "@/api/colors";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const SearchAndFilters = () => {
  const t = useTranslations("SearchFilters");
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();
  const [colors, setColors] = useState<ColorOption[]>([]);

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
  const [selectedGenders, setSelectedGenders] = useState<string[]>(initial.genders);
  const [selectedColors, setSelectedColors] = useState<string[]>(initial.colorNames);
  const [genderOpen, setGenderOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  // Load colors from API
  useEffect(() => {
    getColors()
      .then(setColors)
      .catch(() => setColors([]));
  }, []);

  // sync when URL changes elsewhere
  useEffect(() => {
    setSearchQuery(initial.search);
    setPriceFrom(initial.priceFrom);
    setPriceTo(initial.priceTo);
    setSelectedGenders(initial.genders);
    setSelectedColors(initial.colorNames);
  }, [initial]);

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender) 
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const apply = () => {
    const params = new URLSearchParams(sp.toString());

    params.set("priceFrom", String(priceFrom));
    params.set("priceTo", String(priceTo));

    if (selectedGenders.length > 0) {
      params.set("gender", selectedGenders.join(","));
    } else {
      params.delete("gender");
    }

    if (selectedColors.length > 0) {
      params.set("colorName", selectedColors.join(","));
    } else {
      params.delete("colorName");
    }

    if (searchQuery?.trim()) params.set("q", searchQuery.trim());
    else params.delete("q");

    // clean legacy params if any
    params.delete("categoryId");
    params.delete("category");

    router.push(`/?${params.toString()}`);
    setOpen(false);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("priceFrom");
    params.delete("priceTo");
    params.delete("colorName");
    params.delete("gender");
    params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t("openFilters")}>
          <Search className="h-5 w-5" />
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
                className="pl-10"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="font-medium">{t("genderLabel")}</Label>
            <Popover open={genderOpen} onOpenChange={setGenderOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genderOpen}
                  className="w-full justify-between"
                >
                  {selectedGenders.length > 0
                    ? `${selectedGenders.length} ${t("selected")}`
                    : t("selectGender")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandGroup>
                    {["unisex", "men", "women"].map((gender) => (
                      <CommandItem
                        key={gender}
                        onSelect={() => toggleGender(gender)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedGenders.includes(gender) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {t(gender)}
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
                  {selectedColors.length > 0
                    ? `${selectedColors.length} ${t("selected")}`
                    : t("selectColor")}
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
                      const isSelected = selectedColors.includes(colorKey);
                      return (
                        <CommandItem
                          key={color.id}
                          onSelect={() => toggleColor(colorKey)}
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
