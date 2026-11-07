"use client";
import Link from "next/link";
import CutoutImage from "@/components/CutoutImage";
import { AlertCircle, Minus, Plus, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/price";

interface CartItemProps {
  item: {
    id: string | number;
    itemId: string;
    productId?: string | number;
    name: string;
    nameAr?: string;
    nameEn?: string;
    price: string;
    beforePrice?: string | number;
    quantity: number;
    image: string;
    size?: string;
    sizeName?: string;
    color?: string;
    colorName?: string;
    colorNameAr?: string;
    colorNameEn?: string;
    addOns?: string[];
    isMaxStock?: boolean;
  };
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  onRemove: (itemId: string) => void;
  maxQuantity?: number;
}

const toNumber = (v: string | number | undefined) =>
  typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/**
 * One cart line, Shopify (Dawn) table style:
 *   desktop — [image + name/price/options] [quantity stepper + remove]; Dawn hides the
 *             line-total column on phones (the sticky bar shows the total)
 *   phone   — [image] [name/price/options, stepper + remove] [line total]
 */
const CartItem = memo(({ item, onUpdateQuantity, onRemove, maxQuantity }: CartItemProps) => {
  const [isMaxReached, setIsMaxReached] = useState(item.isMaxStock || false);
  const [isRemoving, setIsRemoving] = useState(false);
  const t = useTranslations("CartItem");
  const locale = useLocale();
  const isAr = locale === "ar";
  const currency = isAr ? "ج.م" : "EGP";

  const displayName = isAr
    ? item.nameAr || item.nameEn || item.name
    : item.nameEn || item.nameAr || item.name;
  const displayColor = isAr
    ? item.colorNameAr || item.colorNameEn || item.colorName || item.color
    : item.colorNameEn || item.colorNameAr || item.colorName || item.color;
  const displaySize = item.sizeName || item.size;

  const unit = toNumber(item.price);
  const before = toNumber(item.beforePrice);
  // A compare-at price at or below what's charged is not a discount.
  const onSale = before > unit;
  const href = item.productId ? `/product/${item.productId}` : undefined;

  const canIncrease = !isMaxReached && (maxQuantity === undefined || item.quantity < maxQuantity);

  const handleIncrease = useCallback(() => {
    if (!canIncrease) return;
    onUpdateQuantity(item.itemId, item.quantity + 1).then((success) => {
      if (!success) setIsMaxReached(true);
    });
  }, [item.itemId, item.quantity, onUpdateQuantity, canIncrease]);

  const handleDecrease = useCallback(() => {
    if (item.quantity <= 1) return;
    setIsMaxReached(false);
    onUpdateQuantity(item.itemId, item.quantity - 1);
  }, [item.itemId, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.itemId), 200);
  }, [item.itemId, onRemove]);

  const image = (
    <div className="ds-cutout-frame relative aspect-product w-full overflow-hidden">
      <CutoutImage
        src={item.image}
        requestWidth={384}
        alt={displayName}
        fill
        sizes="(max-width: 768px) 96px, 120px"
        className="ds-cutout object-center"
      />
    </div>
  );

  const quantity = (
    <div className="flex items-center gap-3">
      <div className="inline-flex h-12 w-[132px] items-center justify-between border border-gray-300">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={item.quantity <= 1}
          aria-label={isAr ? `تقليل كمية ${displayName}` : `Decrease quantity for ${displayName}`}
          className="flex h-full w-11 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="size-3.5" strokeWidth={1.5} />
        </button>
        <span aria-live="polite" className="select-none font-sans text-[15px] tabular-nums text-ink">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={!canIncrease}
          aria-label={isAr ? `زيادة كمية ${displayName}` : `Increase quantity for ${displayName}`}
          className="flex h-full w-11 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        title={t("remove")}
        aria-label={`${t("remove")}: ${displayName}`}
        className="flex size-10 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60"
      >
        <Trash2 className="size-[18px]" strokeWidth={1.25} />
      </button>
    </div>
  );

  const maxNote = isMaxReached ? (
    <p className="mt-2 flex items-center gap-1.5 font-sans text-[13px] leading-5 text-gray-500">
      <AlertCircle className="size-3.5 shrink-0" strokeWidth={1.5} />
      {item.quantity === 1
        ? isAr ? "دي آخر قطعة متاحة" : "This is the last piece available"
        : isAr ? `دي آخر ${item.quantity} قطع متاحة` : `Only ${item.quantity} available`}
    </p>
  ) : null;

  return (
    <li
      className={cn(
        "grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 border-b border-gray-200 py-6 transition-opacity duration-200 md:grid-cols-[minmax(0,1fr)_200px_140px] md:gap-x-6 md:py-8",
        isRemoving ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Product (image + details) */}
      <div className="contents md:flex md:gap-6">
        <div className="w-[96px] md:w-[120px] md:shrink-0">
          {href ? (
            <Link href={href} tabIndex={-1} aria-hidden="true">
              {image}
            </Link>
          ) : (
            image
          )}
        </div>

        <div className="min-w-0 md:pt-0.5">
          {href ? (
            <Link
              href={href}
              className="line-clamp-2 font-sans text-[15px] leading-[22px] text-ink underline-offset-4 hover:underline"
            >
              {displayName}
            </Link>
          ) : (
            <p className="line-clamp-2 font-sans text-[15px] leading-[22px] text-ink">{displayName}</p>
          )}

          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 font-sans text-[14px] leading-5 tabular-nums">
            {onSale && (
              <span className="text-gray-500 line-through">
                {formatAmount(before)} {currency}
              </span>
            )}
            <span className={onSale ? "text-accent-2" : "text-ink"}>
              {formatAmount(unit)} {currency}
            </span>
          </p>

          {(displayColor || displaySize) && (
            <dl className="mt-2 space-y-0.5 font-sans text-[13px] leading-5 text-gray-500">
              {displayColor && (
                <div className="flex gap-1">
                  <dt>{isAr ? "اللون:" : "Color:"}</dt>
                  <dd>{displayColor}</dd>
                </div>
              )}
              {displaySize && (
                <div className="flex gap-1">
                  <dt>{isAr ? "المقاس:" : "Size:"}</dt>
                  <dd>{displaySize}</dd>
                </div>
              )}
            </dl>
          )}

          {item.addOns?.length ? (
            <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">
              {t("addons")}: {item.addOns.join(", ")}
            </p>
          ) : null}

          {/* Phone: quantity under the details */}
          <div className="mt-4 md:hidden">
            {quantity}
            {maxNote}
          </div>
        </div>
      </div>

      {/* Desktop: quantity column */}
      <div className="hidden md:block">
        {quantity}
        {maxNote}
      </div>

      {/* Line total */}
      <p className="hidden text-end font-sans text-[15px] leading-[22px] tabular-nums text-ink md:block md:pt-0.5">
        {formatAmount(unit * item.quantity)} <span className="text-[13px] text-gray-500">{currency}</span>
      </p>
    </li>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
