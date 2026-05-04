"use client";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const totalPrice = (numericPrice * item.quantity).toFixed(2);
  const currency = String(priceStr).includes("EGP")
    ? "EGP"
    : String(priceStr).replace(/[\d.,\s]/g, "").trim() || "EGP";

  return (
    <div
      className={`group relative bg-background rounded-xl border border-border/50 
        hover:border-border transition-all duration-300 overflow-hidden
        ${isRemoving ? "opacity-0 scale-95 -translate-x-4" : "opacity-100 scale-100 translate-x-0"}`}
    >
      <div className="p-4">
        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex gap-4">
            <CartItemImage src={item.image} alt={displayName} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <CartItemDetails
                  name={displayName}
                  price={item.price}
                  size={item.sizeName || item.size}
                  color={displayColor}
                  addOns={item.addOns}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive 
                    hover:bg-destructive/10 transition-all duration-200 flex-shrink-0"
                  title={t("remove")}
                  aria-label={t("remove")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <QuantityControl
                  quantity={item.quantity}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  disableIncrease={!canIncrease}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isAr ? "الإجمالي:" : "Total:"}
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {totalPrice} {currency}
                  </span>
                </div>
              </div>
              {isMaxReached && (
                <div
                  className="mt-3 flex items-center gap-2 text-amber-600 dark:text-amber-500 
                  text-sm bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {item.quantity === 1
                      ? isAr
                        ? "هذه القطعة الأخيرة المتاحة"
                        : "This is the last available piece"
                      : isAr
                        ? `هذه آخر ${item.quantity} قطع متاحة`
                        : `These are the last ${item.quantity} pieces available`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* الصف الأول: الصورة + التفاصيل + زر الحذف */}
          <div className="flex items-start gap-3">
            <CartItemImage src={item.image} alt={displayName} />
            <div className="flex-1 min-w-0 text-start">
              <CartItemDetails
                name={displayName}
                price={item.price}
                size={item.sizeName || item.size}
                color={displayColor}
                addOns={item.addOns}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive 
                hover:bg-destructive/10 transition-all duration-200 flex-shrink-0 -me-1"
              title={t("remove")}
              aria-label={t("remove")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* الكمية والسعر في صف واحد */}
          <div className="flex items-center justify-between mt-4">
            <QuantityControl
              quantity={item.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              disableIncrease={!canIncrease}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {isAr ? "الإجمالي:" : "Total:"}
              </span>
              <span className="text-base font-bold text-foreground">
                {totalPrice} {currency}
              </span>
            </div>
          </div>

          {isMaxReached && (
            <div
              className="mt-3 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-500 
              text-xs bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {item.quantity === 1
                  ? isAr
                    ? "هذه القطعة الأخيرة المتاحة"
                    : "This is the last available piece"
                  : isAr
                    ? `هذه آخر ${item.quantity} قطع متاحة`
                    : `These are the last ${item.quantity} pieces available`}
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
