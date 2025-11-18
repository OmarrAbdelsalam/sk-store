"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Ruler } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

type ColorOption = { id: number; label: string; hexa?: string; disabled?: boolean };
type SizeOption  = { name: string; disabled?: boolean };

interface ProductInfoProps {
  name: string;
  description?: string;
  price: number | string;

  colorOptions?: ColorOption[];
  sizeOptions?: SizeOption[];
  hasSizes?: boolean;

  // ✅ الاختيارات بالـ IDs
  selectedColorId: number;
  selectedSize: string;
  quantity: number;

  onSizeChange: (size: string) => void;
  onColorChangeId: (id: number) => void;
  onQuantityChange: (quantity: number) => void;
  
  sizeChartUrl?: string;
}

const ProductInfo = React.memo(function ProductInfo({
  name,
  description,
  price,
  colorOptions = [],
  sizeOptions = [],
  hasSizes = false,
  selectedColorId,
  selectedSize,
  quantity,
  onSizeChange,
  onColorChangeId,
  onQuantityChange,
  sizeChartUrl,
}: ProductInfoProps) {
  const t = useTranslations("ProductInfo"); // استخدم namespace: ProductInfo
  const locale = useLocale();
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const dec = () => onQuantityChange(Math.max(1, quantity - 1));
  const inc = () => onQuantityChange(quantity + 1);

  // تنسيق السعر حسب اللغة (عملة EGP)
  const priceText =
    typeof price === "number"
      ? new Intl.NumberFormat(locale, { style: "currency", currency: "EGP", maximumFractionDigits: 2 }).format(price)
      : String(price);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* الاسم + الوصف + السعر */}
      <div>
        <h1 className="font-luxury text-3xl md:text-4xl font-medium mb-2" aria-label={t("a11y.productName")}>
          {name}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {description}
          </p>
        )}
        <p className="text-2xl font-semibold text-foreground/90" aria-label={t("a11y.price")}>
          {priceText}
        </p>
      </div>

      {/* اختيار اللون (ID) */}
      {colorOptions.length > 0 && (
        <div>
          <Label className="block text-sm font-medium mb-3">
            {t("color")}
          </Label>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((c) => {
              const active = c.id === selectedColorId;
              const disabled = !!c.disabled;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !disabled && onColorChangeId(c.id)}
                  disabled={disabled}
                  className={[
                    "relative w-9 h-9 rounded-full border transition-all duration-200",
                    active ? "border-primary scale-110 shadow-lg" : "border-gray-300 hover:border-gray-400",
                    disabled ? "opacity-40 cursor-not-allowed hover:border-gray-300" : "cursor-pointer",
                  ].join(" ")}
                  title={c.label}
                  aria-label={t("a11y.selectColor", { color: c.label })}
                >
                  <span
                    className="absolute inset-0 rounded-full border"
                    style={{
                      backgroundColor: c.hexa ?? "#000000",
                      borderColor: "#e5e7eb",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* اختيار المقاس */}
      {hasSizes && (
        <div>
          {/* العنوان + زر جدول المقاسات */}
          <div className="flex items-center gap-3 mb-3">
            <Label className="text-sm font-medium">
              {t("size")}
            </Label>
            {sizeChartUrl && (
              <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-auto py-1 px-2 lg:hidden">
                    <Ruler className="w-3 h-3" />
                    {t("viewSizeChart")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t("sizeChart")}</DialogTitle>
                  </DialogHeader>
                  <div className="relative w-full aspect-video">
                    <Image
                      src={sizeChartUrl}
                      alt={t("sizeChart")}
                      fill
                      className="object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* أزرار المقاسات */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {sizeOptions.length > 0 ? (
                sizeOptions.map((s) => {
                  const active = s.name.toLowerCase() === (selectedSize || "").toLowerCase();
                  return (
                    <Button
                      key={s.name}
                      type="button"
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => !s.disabled && onSizeChange(s.name)}
                      disabled={!!s.disabled}
                      className={s.disabled ? "opacity-40 cursor-not-allowed" : "min-w-[3rem]"}
                      aria-pressed={active}
                      aria-label={
                        s.disabled
                          ? t("a11y.sizeUnavailable", { size: s.name })
                          : t("a11y.sizeSelect", { size: s.name })
                      }
                    >
                      {s.name}
                    </Button>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t("noSizesForColor")}
                </span>
              )}
            </div>
            
            {/* زر جدول المقاسات في الديسكتوب */}
            {sizeChartUrl && (
              <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 hidden lg:flex">
                    <Ruler className="w-3 h-3" />
                    {t("viewSizeChart")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t("sizeChart")}</DialogTitle>
                  </DialogHeader>
                  <div className="relative w-full aspect-video">
                    <Image
                      src={sizeChartUrl}
                      alt={t("sizeChart")}
                      fill
                      className="object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}

      {/* الكمية */}
      <div>
        <Label className="block text-sm font-medium mb-3">
          {t("quantity")}
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={dec}
            aria-label={t("a11y.decreaseQty")}
            title={t("a11y.decreaseQty")}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span
            className="text-lg font-medium min-w-[3rem] text-center"
            aria-live="polite"
            aria-label={t("a11y.currentQty", { qty: quantity })}
          >
            {quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={inc}
            aria-label={t("a11y.increaseQty")}
            title={t("a11y.increaseQty")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default ProductInfo;
