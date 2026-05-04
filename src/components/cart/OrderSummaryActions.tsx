"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { memo, useState } from "react";
import { getCart, updateItemQuantity } from "@/lib/api/cart";
import { getProductById } from "@/lib/api/products";
import { getOrCreateSessionId } from "@/lib/session";
import { ArrowLeft, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";

const OrderSummaryActions = memo(({ onCheckoutClick }: { onCheckoutClick?: () => void }) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("OrderSummary");
  const tCart = useTranslations("Cart");
  const [isValidating, setIsValidating] = useState(false);
  const isAr = locale === "ar";

  const validateStockAndCheckout = async () => {
    setIsValidating(true);
    try {
      const sessionId = getOrCreateSessionId();
      const cartData = await getCart(sessionId);
      const cartItems = cartData.items || [];

      if (cartItems.length === 0) {
        router.push(`/${locale}/checkout`);
        return;
      }

      let hasChanges = false;
      const updates: Array<{ itemId: string; newQuantity: number; productName: string }> = [];

      for (const item of cartItems) {
        try {
          const product = await getProductById(item.productId);
          if (!product) continue;
          
          let availableStock = 0;
          
          if (product.hasSizes && item.sizeId) {
            const variant = product.variants.find(
              (v: any) => v.colorId === item.colorId && v.sizeId === item.sizeId
            );
            availableStock = variant?.quantity ?? 0;
          } else if (item.colorId) {
            const variant = product.variants.find((v: any) => v.colorId === item.colorId);
            availableStock = variant?.quantity ?? 0;
          } else if (product.variants.length > 0) {
            availableStock = product.variants[0]?.quantity ?? 0;
          }

          if (item.quantity > availableStock) {
            hasChanges = true;
            const productName = locale === 'ar' 
              ? (product.nameAr || product.nameEn || `Product ${item.productId}`)
              : (product.nameEn || product.nameAr || `Product ${item.productId}`);

            if (availableStock === 0) {
              updates.push({ 
                itemId: item.id, 
                newQuantity: 0, 
                productName 
              });
            } else {
              updates.push({ 
                itemId: item.id, 
                newQuantity: availableStock, 
                productName 
              });
            }
          }
        } catch (error) {
          console.error(`Error validating product ${item.productId}:`, error);
        }
      }

      if (hasChanges) {
        for (const update of updates) {
          try {
            await updateItemQuantity(update.itemId, update.newQuantity);
          } catch (error) {
            console.error(`Error updating item ${update.itemId}:`, error);
          }
        }
        window.location.reload();
      } else {
        if (onCheckoutClick) {
          onCheckoutClick();
        }
        router.push(`/${locale}/checkout`);
      }
    } catch (error) {
      console.error("Error validating stock:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        className="w-full h-12 text-sm font-bold tracking-wider uppercase
          bg-black text-white hover:bg-gray-800 rounded-lg
          transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
        onClick={validateStockAndCheckout}
        disabled={isValidating}
        aria-label={t("goCheckout")}
      >
        {isValidating ? (
          <>
            <Loader2 className="w-5 h-5 me-2 animate-spin" />
            {tCart("validating")}
          </>
        ) : (
          <>
            {t("goCheckout")}
            {isAr ? (
              <ArrowLeft className="w-4 h-4 ms-2 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
            )}
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="w-full h-11 rounded-lg border-2 border-black text-black hover:bg-black hover:text-white 
          transition-all duration-300 font-semibold"
        onClick={() => {
          if (onCheckoutClick) onCheckoutClick();
          router.push(`/${locale}/products`);
        }}
        aria-label={t("continueShopping")}
      >
        {t("continueShopping")}
      </Button>
    </div>
  );
});

OrderSummaryActions.displayName = "OrderSummaryActions";

export default OrderSummaryActions;

