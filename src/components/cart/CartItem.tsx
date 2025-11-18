"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { memo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import CartItemImage from "./CartItemImage";
import CartItemDetails from "./CartItemDetails";
import QuantityControl from "./QuantityControl";

interface CartItemProps {
  item: {
    id: number;
    productId?: number;
    name: string;
    price: string;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
    addOns?: string[];
  };
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem = memo(({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const [busy, setBusy] = useState(false);
  const t = useTranslations("CartItem");

  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleDecrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

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
                size={item.size}
                color={item.color}
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
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
