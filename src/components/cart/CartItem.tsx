"use client";
import { Trash2, AlertCircle } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CartItemImage from "./CartItemImage";
import CartItemDetails from "./CartItemDetails";
import QuantityControl from "./QuantityControl";

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

const CartItem = memo(({ item, onUpdateQuantity, onRemove, maxQuantity }: CartItemProps) => {
  const [isMaxReached, setIsMaxReached] = useState(item.isMaxStock || false);
  const [isRemoving, setIsRemoving] = useState(false);
  const t = useTranslations("CartItem");
  const locale = useLocale();
  const isAr = locale === "ar";

  // اختيار الاسم حسب اللغة
  const displayName = isAr
    ? item.nameAr || item.nameEn || item.name
    : item.nameEn || item.nameAr || item.name;

  // اختيار اسم اللون حسب اللغة
  const displayColor = isAr
    ? item.colorNameAr || item.colorNameEn || item.colorName || item.color
    : item.colorNameEn || item.colorNameAr || item.colorName || item.color;

  const canIncrease = !isMaxReached && (maxQuantity === undefined || item.quantity < maxQuantity);

  const handleIncrease = useCallback(() => {
    if (!canIncrease) return;
    onUpdateQuantity(item.itemId, item.quantity + 1).then((success) => {
      if (!success) {
        setIsMaxReached(true);
      }
    });
  }, [item.itemId, item.quantity, onUpdateQuantity, canIncrease]);

  const handleDecrease = useCallback(() => {
    setIsMaxReached(false);
    onUpdateQuantity(item.itemId, item.quantity - 1);
  }, [item.itemId, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(item.itemId);
    }, 200);
  }, [item.itemId, onRemove]);

  // حساب السعر الإجمالي للمنتج
  const priceStr = item.price || '0';
  const numericPrice = parseFloat(String(priceStr).replace(/[^\d.]/g, "")) || 0;
  const currency = String(priceStr).includes("EGP")
    ? "EGP"
    : String(priceStr).replace(/[\d.,\s]/g, "").trim() || "EGP";

  return (
    <div
      className={`group relative bg-white rounded-[24px] p-4 sm:p-6 mb-4 shadow-sm border border-gray-900/5 transition-all duration-300
        ${isRemoving ? "opacity-0 scale-95 -translate-x-4" : "opacity-100 scale-100 translate-x-0"}`}
    >
      <div>
        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex gap-5">
            <CartItemImage src={item.image} alt={displayName} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <CartItemDetails
                  name={displayName}
                  price={item.price}
                  beforePrice={item.beforePrice}
                  size={item.sizeName || item.size}
                  color={displayColor}
                  addOns={item.addOns}
                />
                <button
                  onClick={handleRemove}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  title={t("remove")}
                  aria-label={t("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <QuantityControl
                  quantity={item.quantity}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  disableIncrease={!canIncrease}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs tracking-wider uppercase text-muted-foreground">
                    {isAr ? "الإجمالي:" : "Total:"}
                  </span>
                  <span className="text-base font-medium text-foreground">
                    {(numericPrice * item.quantity).toLocaleString()} <span className="text-xs">{currency}</span>
                  </span>
                </div>
              </div>
              {isMaxReached && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border border-border px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {item.quantity === 1
                      ? isAr ? "هذه القطعة الأخيرة المتاحة" : "This is the last available piece"
                      : isAr ? `هذه آخر ${item.quantity} قطع متاحة` : `These are the last ${item.quantity} pieces available`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-start gap-3">
            <CartItemImage src={item.image} alt={displayName} />
            <div className="flex-1 min-w-0 text-start">
              <CartItemDetails
                name={displayName}
                price={item.price}
                beforePrice={item.beforePrice}
                size={item.sizeName || item.size}
                color={displayColor}
                addOns={item.addOns}
              />
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title={t("remove")}
              aria-label={t("remove")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <QuantityControl
              quantity={item.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              disableIncrease={!canIncrease}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] tracking-wider uppercase text-muted-foreground">
                {isAr ? "الإجمالي:" : "Total:"}
              </span>
              <span className="text-sm font-medium text-foreground">
                {(numericPrice * item.quantity).toLocaleString()} <span className="text-xs">{currency}</span>
              </span>
            </div>
          </div>

          {isMaxReached && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground border border-border px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {item.quantity === 1
                  ? isAr ? "هذه القطعة الأخيرة المتاحة" : "This is the last available piece"
                  : isAr ? `هذه آخر ${item.quantity} قطع متاحة` : `These are the last ${item.quantity} pieces available`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
