"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { memo, useState } from "react";
import { getCart, updateItemQuantity } from "@/lib/api/cart";
import { getProductById } from "@/lib/api/products";
import { getOrCreateSessionId } from "@/lib/session";

const OrderSummaryActions = memo(() => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("OrderSummary");
  const tCart = useTranslations("Cart");
  const [isValidating, setIsValidating] = useState(false);

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
      const updates: Array<{ itemId: number; newQuantity: number; productName: string }> = [];

      // التحقق من كل منتج في السلة
      for (const item of cartItems) {
        try {
          const product = await getProductById(item.productId);
          
          // إيجاد الـ variant المطابق
          let availableStock = 0;
          
          if (product.hasSizes && item.sizeId) {
            const variant = product.variants.find(
              v => v.colorId === item.colorId && v.sizeId === item.sizeId
            );
            availableStock = variant?.quantity ?? 0;
          } else if (item.colorId) {
            const variant = product.variants.find(v => v.colorId === item.colorId);
            availableStock = variant?.quantity ?? 0;
          } else if (product.variants.length > 0) {
            availableStock = product.variants[0]?.quantity ?? 0;
          }

          // إذا الكمية المطلوبة أكبر من المتاح
          if (item.quantity > availableStock) {
            hasChanges = true;
            const productName = locale === 'ar' 
              ? (product.nameAr || product.nameEn || `Product ${item.productId}`)
              : (product.nameEn || product.nameAr || `Product ${item.productId}`);

            if (availableStock === 0) {
              // المنتج غير متوفر نهائياً
              updates.push({ 
                itemId: item.itemId, 
                newQuantity: 0, 
                productName 
              });
            } else {
              // تعديل الكمية للمتاح
              updates.push({ 
                itemId: item.itemId, 
                newQuantity: availableStock, 
                productName 
              });
            }
          }
        } catch (error) {
          console.error(`Error validating product ${item.productId}:`, error);
        }
      }

      // تطبيق التحديثات
      if (hasChanges) {
        for (const update of updates) {
          try {
            await updateItemQuantity({
              sessionId,
              itemId: update.itemId,
              quantity: update.newQuantity
            });
          } catch (error) {
            console.error(`Error updating item ${update.itemId}:`, error);
          }
        }

        // إعادة تحميل الصفحة لتحديث السلة
        window.location.reload();
      } else {
        // كل شيء تمام، متابعة للـ checkout
        router.push(`/${locale}/checkout`);
      }
    } catch (error) {
      console.error("Error validating stock:", error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        onClick={validateStockAndCheckout}
        disabled={isValidating}
        aria-label={t("goCheckout")}
      >
        {isValidating ? tCart("validating") : t("goCheckout")}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push(`/${locale}`)}
        aria-label={t("continueShopping")}
      >
        {t("continueShopping")}
      </Button>
    </>
  );
});

OrderSummaryActions.displayName = "OrderSummaryActions";

export default OrderSummaryActions;
