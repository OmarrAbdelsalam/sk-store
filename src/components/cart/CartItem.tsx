"use client";

import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { updateItemQuantity, deleteItem } from "@/lib/api/cart";
import { useTranslations } from "next-intl";

interface CartItemProps {
  item: {
    id: number;           // ID العنصر داخل السلة
    productId?: number;   // جعله اختياري لتفادي الخطأ
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

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const sessionId = getOrCreateSessionId();
  const t = useTranslations("CartItem");

  const doUpdate = (nextQty: number) => {
    onUpdateQuantity(item.id, nextQty);
  };

  const doRemove = () => {
    onRemove(item.id);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 bg-luxury-cream rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{item.name}</h3>
                {item.size && (
                  <p className="text-sm text-muted-foreground">
                    {t("size")}: {item.size}
                  </p>
                )}
                {item.color && (
                  <p className="text-sm text-muted-foreground">
                    {t("color")}: {item.color}
                  </p>
                )}
                {item.addOns?.length ? (
                  <div className="text-sm text-muted-foreground">
                    <p>{t("addons")}:</p>
                    <ul className="list-disc list-inside ml-2">
                      {item.addOns.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={doRemove}
                disabled={busy}
                className="text-destructive hover:text-destructive/80"
                title={t("remove")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-lg font-semibold">{item.price}</p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => doUpdate(item.quantity - 1)}
                disabled={item.quantity <= 1 || busy}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[3rem] text-center">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => doUpdate(item.quantity + 1)}
                disabled={busy}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
