"use client";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { memo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CartItemImage from "./CartItemImage";
import CartItemDetails from "./CartItemDetails";
import QuantityControl from "./QuantityControl";

interface CartItemProps {
  item: {
    id: number;
    itemId: number; // cartItemId from server
    productId?: number;
    name: string;
    price: string;
    quantity: number;
    image: string;
    size?: string;
    sizeName?: string;
    color?: string;
    colorName?: string;
    addOns?: string[];
    isMaxStock?: boolean;
  };
  onUpdateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  onRemove: (itemId: number) => void;
  maxQuantity?: number;
}

const CartItem = memo(({ item, onUpdateQuantity, onRemove, maxQuantity }: CartItemProps) => {
  const [busy, setBusy] = useState(false);
  const [isMaxReached, setIsMaxReached] = useState(item.isMaxStock || false);
  const t = useTranslations("CartItem");
  const tCart = useTranslations("Cart");
  const locale = useLocale();
  const isAr = locale === "ar";

  const canIncrease = !isMaxReached && (maxQuantity === undefined || item.quantity < maxQuantity);

  const handleIncrease = useCallback(async () => {
    if (!canIncrease || busy) return;
    
    setBusy(true);
    const success = await onUpdateQuantity(item.itemId, item.quantity + 1);
    if (!success) {
      setIsMaxReached(true);
    }
    setBusy(false);
  }, [item.itemId, item.quantity, onUpdateQuantity, canIncrease, busy]);

  const handleDecrease = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    // لو نقص الكمية، يمكن يقدر يزود تاني
    setIsMaxReached(false);
    await onUpdateQuantity(item.itemId, item.quantity - 1);
    setBusy(false);
  }, [item.itemId, item.quantity, onUpdateQuantity, busy]);

  const handleRemove = useCallback(() => {
    onRemove(item.itemId);
  }, [item.itemId, onRemove]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <CartItemImage src={item.image} alt={item.name} />

          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <CartItemDetails
                name={item.name}
                price={item.price}
                size={item.sizeName || item.size}
                color={item.colorName || item.color}
                addOns={item.addOns}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={busy}
                className="text-destructive hover:text-destructive/80"
                title={t("remove")}
                aria-label={t("remove")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <QuantityControl
              quantity={item.quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              disabled={busy}
              disableIncrease={!canIncrease}
            />

            {/* رسالة الحد الأقصى */}
            {isMaxReached && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {item.quantity === 1 
                    ? (isAr ? "هذه القطعة الأخيرة المتاحة" : "This is the last available piece")
                    : (isAr ? `هذه آخر ${item.quantity} قطع متاحة` : `These are the last ${item.quantity} pieces available`)
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
