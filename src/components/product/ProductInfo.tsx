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
import PromotionBadges from "@/components/product/PromotionBadges";

type ColorOption = { id: number | string; label: string; hexa?: string; disabled?: boolean };
type SizeOption  = { name: string; disabled?: boolean };

interface ProductInfoProps {
  name: string;
  description?: string;
  price: number | string;
  beforePrice?: number | null;
  productId?: string;

  colorOptions?: ColorOption[];
  sizeOptions?: SizeOption[];
  hasSizes?: boolean;

  // ✅ الاختيارات بالـ IDs
  selectedColorId: number | string;
  selectedSize: string;
  quantity: number;

  onSizeChange: (size: string) => void;
  onColorChangeId: (id: number | string) => void;
  onQuantityChange: (quantity: number) => void;
  
  sizeChartUrl?: string;
  maxQuantity?: number;
  quantityInCart?: number;
  chainOptions?: Array<{ id: string; name: string }>;
  selectedChainId?: string;
  onChainChange?: (id: string) => void;
}

const ProductInfo = React.memo(function ProductInfo({
  name,
  description,
  price,
  beforePrice,
  productId,
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
  maxQuantity = 999,
  quantityInCart = 0,
  chainOptions = [],
  selectedChainId = "",
  onChainChange,
}: ProductInfoProps) {
  const t = useTranslations("ProductInfo"); // استخدم namespace: ProductInfo
  const locale = useLocale();
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  // Preload size chart image when component mounts
  React.useEffect(() => {
    if (sizeChartUrl) {
      const img = new window.Image();
      img.src = sizeChartUrl;
    }
  }, [sizeChartUrl]);

  const dec = () => onQuantityChange(Math.max(1, quantity - 1));
  const inc = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  // تنسيق السعر حسب اللغة (عملة EGP)
  const priceText =
    typeof price === "number"
      ? `${price} ${locale === 'ar' ? 'جنيه' : 'EGP'}`
      : String(price);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* الاسم + السعر */}
      <div className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900" aria-label={t("a11y.productName")}>
          {name}
        </h1>
        <div className="flex items-center gap-3" aria-label={t("a11y.price")}>
          {beforePrice && (
            <p className="text-base text-gray-500 line-through">
              {beforePrice} {locale === 'ar' ? 'جنيه' : 'EGP'}
            </p>
          )}
          <p className="text-xl font-semibold text-gray-900">
            {priceText}
          </p>
        </div>

        {/* Promotion Badges */}
        {productId && <PromotionBadges productId={productId} />}
      </div>

      {/* الوصف - بين السعر والألوان */}
      {description && (
        <div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {(() => {
              const highlightPhrases = [
                "Available in all colors by request",
                "Available in all colors",
                "available in all colors by request",
                "available in all colors",
                "Available in any colors",
                "available in any colors",
                "متاح بجميع الألوان",
                "متاحة بجميع الألوان",
                "متاح بكل الألوان",
              ];
              let found = false;
              let phrase = "";
              for (const p of highlightPhrases) {
                if (description.toLowerCase().includes(p.toLowerCase())) {
                  phrase = p;
                  found = true;
                  break;
                }
              }
              if (!found) return description;
              const idx = description.toLowerCase().indexOf(phrase.toLowerCase());
              const before = description.slice(0, idx);
              const match = description.slice(idx, idx + phrase.length);
              const after = description.slice(idx + phrase.length);
              return (
                <>
                  {before}
                  <span className="font-medium text-gray-900 underline underline-offset-2 decoration-gray-300">
                    {match}
                  </span>
                  {after}
                </>
              );
            })()}
          </p>
        </div>
      )}

      {/* اختيار اللون (ID) */}
      {colorOptions.length > 0 && (
        <div>
          <Label className="block text-sm font-medium mb-3">
            {t("color")}
            {selectedColorId && (
              <span className="text-muted-foreground font-normal ms-2">
                — {colorOptions.find(c => String(c.id) === String(selectedColorId))?.label}
              </span>
            )}
          </Label>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((c) => {
              const active = String(c.id) === String(selectedColorId);
              const isLight = c.hexa && ['#fff', '#ffffff', '#fefefe', '#fffff0', '#fafafa', '#f5f5f5'].some(
                light => c.hexa?.toLowerCase().startsWith(light)
              );
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !c.disabled && onColorChangeId(c.id)}
                  disabled={!!c.disabled}
                  className={`relative w-7 h-7 rounded-full transition-all duration-200 ${
                    c.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                  } ${isLight ? "ring-1 ring-gray-200" : ""}`}
                  style={{ backgroundColor: c.hexa || "#ccc" }}
                  aria-pressed={active}
                  aria-label={c.label}
                  title={c.label}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full ring-[1.5px] ring-offset-[3px] ring-gray-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* اختيار نوع السلسلة (Chain Type) */}
      {chainOptions.length > 0 && (
        <div>
          <Label className="block text-sm font-medium mb-3">
            {locale === 'ar' ? 'نوع السلسلة' : 'Chain Type'}
            {selectedChainId && (
              <span className="text-muted-foreground font-normal ms-2">
                — {chainOptions.find(c => c.id === selectedChainId)?.name}
              </span>
            )}
          </Label>
          <div className="flex flex-wrap gap-2">
            {chainOptions.map((chain) => {
              const active = chain.id === selectedChainId;
              return (
                <Button
                  key={chain.id}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChainChange?.(chain.id)}
                  className="min-w-[4rem]"
                  aria-pressed={active}
                >
                  {chain.name}
                </Button>
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
        
        {maxQuantity === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <p className="text-red-700 font-semibold text-base">
              {t("soldOut")}
            </p>
            {quantityInCart > 0 && (
              <>
                <p className="text-red-600 text-sm">
                  {t("allInCart")}
                </p>
                <p className="text-red-600 text-sm font-medium">
                  {t("hurryUp")}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={dec}
                disabled={quantity <= 1}
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
                disabled={quantity >= maxQuantity}
                aria-label={t("a11y.increaseQty")}
                title={t("a11y.increaseQty")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {maxQuantity > 0 && maxQuantity <= 10 && (
              <p className="text-sm text-red-600 font-medium mt-2">
                {t("piecesRemaining", { count: maxQuantity })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default ProductInfo;
