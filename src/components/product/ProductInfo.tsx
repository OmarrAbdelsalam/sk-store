"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { formatPrice, toAmount } from "@/lib/price";

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

const HIGHLIGHT_PHRASES = [
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

/**
 * Renders a product description, underlining the "available in all colors"
 * phrase when present. Shared by ProductInfo and the PDP Description tab.
 */
export function highlightDescription(description: string): React.ReactNode {
  let found = false;
  let phrase = "";
  for (const p of HIGHLIGHT_PHRASES) {
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
      <span className="font-normal text-ink underline underline-offset-2 decoration-gray-300">
        {match}
      </span>
      {after}
    </>
  );
}

/** Square option tile (chain type / size): 1px hairline, ink when selected. */
const optionClass = (active: boolean, disabled?: boolean) =>
  cn(
    "ds-label inline-flex h-button min-w-12 items-center justify-center rounded-ds border bg-background px-3 text-ink transition-[border-color,opacity] duration-fast",
    active ? "border-ink" : "border-gray-200 hover:border-gray-600",
    disabled && "cursor-not-allowed opacity-40 hover:border-gray-200"
  );

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
  const priceValue = toAmount(price);
  const priceText = formatPrice(priceValue, locale);
  // Only a compare-at price above the real price is a sale.
  const beforeValue = toAmount(beforePrice);
  const onSale = beforeValue > priceValue;

  const selectedColorLabel = selectedColorId
    ? colorOptions.find(c => String(c.id) === String(selectedColorId))?.label
    : undefined;

  const sizeChartDialog = (triggerClassName: string) =>
    sizeChartUrl ? (
      <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
        <DialogTrigger asChild>
          <Button variant="link" className={cn("h-auto gap-1 text-button", triggerClassName)}>
            <Ruler className="h-3 w-3" strokeWidth={1.25} />
            {t("viewSizeChart")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl rounded-ds shadow-none sm:rounded-ds">
          <DialogHeader>
            <DialogTitle className="ds-title-sm">{t("sizeChart")}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full bg-white">
            <Image
              src={sizeChartUrl}
              alt={t("sizeChart")}
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* الاسم + اللون + السعر */}
      <div className="flex flex-col gap-1">
        <h1 className="ds-title-sm text-ink" aria-label={t("a11y.productName")}>
          {name}
        </h1>
        {selectedColorLabel && (
          <p className="ds-label text-ink">{selectedColorLabel}</p>
        )}
        <div className="flex items-baseline gap-3" aria-label={t("a11y.price")}>
          {onSale && (
            <p className="ds-price-lg text-gray-500 line-through">
              {formatPrice(beforeValue, locale)}
            </p>
          )}
          <p className={cn("ds-price-lg", onSale ? "text-accent-2" : "text-ink")}>
            {priceText}
          </p>
        </div>

        {/* Promotion Badges */}
        {productId && (
          <div className="pt-2 empty:hidden">
            <PromotionBadges productId={productId} />
          </div>
        )}
      </div>

      {/* الوصف — only when passed (the PDP shows it in the Description tab) */}
      {description && (
        <p className="ds-fine">{highlightDescription(description)}</p>
      )}

      {/* اختيار اللون (ID) */}
      {colorOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("color")}>
          {colorOptions.map((c) => {
            const active = String(c.id) === String(selectedColorId);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => !c.disabled && onColorChangeId(c.id)}
                disabled={!!c.disabled}
                // Square swatch, same as the product card and Quick add:
                // ink frame when chosen, inner hairline so white/cream show.
                className={cn(
                  "flex size-8 items-center justify-center border p-[3px] transition-[border-color,opacity] duration-fast",
                  active ? "border-ink" : "border-transparent hover:border-gray-400",
                  c.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                )}
                aria-pressed={active}
                aria-label={c.label}
                title={c.label}
              >
                <span className="block size-full border border-gray-300" style={{ backgroundColor: c.hexa || "var(--ds-gray-300)" }} />
              </button>
            );
          })}
        </div>
      )}


      {/* اختيار نوع السلسلة (Chain Type) */}
      {chainOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="ds-label text-ink">
            {locale === 'ar' ? 'نوع السلسلة' : 'Chain Type'}
            {selectedChainId && (
              <span className="ms-2 text-gray-500">
                — {chainOptions.find(c => c.id === selectedChainId)?.name}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-tile">
            {chainOptions.map((chain) => {
              const active = chain.id === selectedChainId;
              return (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => onChainChange?.(chain.id)}
                  className={optionClass(active)}
                  aria-pressed={active}
                >
                  {chain.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* اختيار المقاس */}
      {hasSizes && (
        <div className="flex flex-col gap-2">
          {/* العنوان + زر جدول المقاسات */}
          <div className="flex items-center gap-3">
            <p className="ds-label text-ink">
              {t("size")}
            </p>
            {sizeChartDialog("lg:hidden")}
          </div>

          {/* أزرار المقاسات */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-tile">
              {sizeOptions.length > 0 ? (
                sizeOptions.map((s) => {
                  const active = s.name.toLowerCase() === (selectedSize || "").toLowerCase();
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => !s.disabled && onSizeChange(s.name)}
                      disabled={!!s.disabled}
                      className={optionClass(active, s.disabled)}
                      aria-pressed={active}
                      aria-label={
                        s.disabled
                          ? t("a11y.sizeUnavailable", { size: s.name })
                          : t("a11y.sizeSelect", { size: s.name })
                      }
                    >
                      {s.name}
                    </button>
                  );
                })
              ) : (
                <span className="ds-fine">
                  {t("noSizesForColor")}
                </span>
              )}
            </div>

            {/* زر جدول المقاسات في الديسكتوب */}
            {sizeChartDialog("hidden lg:inline-flex")}
          </div>
        </div>
      )}

      {/* الكمية */}
      <div className="flex flex-col gap-2">
        <p className="ds-label text-ink">
          {t("quantity")}
        </p>

        {maxQuantity === 0 ? (
          <div className="flex flex-col gap-1 bg-danger-soft p-3">
            <p className="ds-label-strong text-danger">
              {t("soldOut")}
            </p>
            {quantityInCart > 0 && (
              <>
                <p className="text-fine text-danger">
                  {t("allInCart")}
                </p>
                <p className="text-fine text-danger">
                  {t("hurryUp")}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Shared stepper: 48px, gray hairline (same in Quick add and cart) */}
            <div className="inline-flex h-12 w-[132px] items-center justify-between border border-gray-300">
              <button
                type="button"
                className="flex h-full w-11 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 disabled:pointer-events-none disabled:opacity-30"
                onClick={dec}
                disabled={quantity <= 1}
                aria-label={t("a11y.decreaseQty")}
                title={t("a11y.decreaseQty")}
              >
                <Minus className="size-3.5" strokeWidth={1.5} />
              </button>
              <span
                className="select-none font-sans text-[15px] tabular-nums text-ink"
                aria-live="polite"
                aria-label={t("a11y.currentQty", { qty: quantity })}
              >
                {quantity}
              </span>
              <button
                type="button"
                className="flex h-full w-11 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 disabled:pointer-events-none disabled:opacity-30"
                onClick={inc}
                disabled={quantity >= maxQuantity}
                aria-label={t("a11y.increaseQty")}
                title={t("a11y.increaseQty")}
              >
                <Plus className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>
            {maxQuantity > 0 && maxQuantity <= 10 && (
              <p className="text-fine text-danger">
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
