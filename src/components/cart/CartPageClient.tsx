"use client";
import { useCart } from "@/hooks/useCart";
import { lazy, Suspense, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getProductById } from "@/lib/api/products";

const CartItem = lazy(() => import("@/components/cart/CartItem"));
const EmptyCart = lazy(() => import("@/components/cart/EmptyCart"));
const OrderSummary = lazy(() => import("@/components/cart/OrderSummary"));

export default function CartPageClient() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const t = useTranslations("Cart");
  const tOrderSummary = useTranslations("OrderSummary");
  const locale = useLocale();
  const router = useRouter();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const { toast } = useToast();
  const [stockLimits, setStockLimits] = useState<Record<number, number>>({});

  // Fetch stock limits for all items
  useEffect(() => {
    const fetchStockLimits = async () => {
      const limits: Record<number, number> = {};
      
      for (const item of items) {
        try {
          const product = await getProductById(item.productId || item.id);
          
          let availableStock = 0;
          // Find matching variant based on item's color and size
          if (product.hasSizes && item.size) {
            const variant = product.variants.find(v => {
              const sizeName = v.name?.toLowerCase();
              const itemSize = item.size?.toLowerCase();
              return sizeName === itemSize;
            });
            availableStock = variant?.quantity ?? 0;
          } else if (product.variants.length > 0) {
            availableStock = product.variants[0]?.quantity ?? 0;
          }
          
          limits[item.itemId] = availableStock;
        } catch (error) {
          console.error(`Error fetching stock for item ${item.itemId}:`, error);
          limits[item.itemId] = item.quantity; // Default to current quantity
        }
      }
      
      setStockLimits(limits);
    };
    
    if (items.length > 0) {
      fetchStockLimits();
    }
  }, [items]);

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    const stockLimit = stockLimits[itemId];
    
    if (stockLimit !== undefined && newQuantity > stockLimit) {
      toast({
        title: t("stockLimitReached"),
        description: t("maxAvailable", { quantity: stockLimit }),
        variant: "destructive",
      });
      return;
    }
    
    updateQuantity(itemId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <EmptyCart />
      </Suspense>
    );
  }

  return (
    <div dir={dir}>
      <Button 
        variant="ghost" 
        onClick={() => router.push(`/${locale}`)} 
        className="mb-8" 
        aria-label={tOrderSummary("continueShopping")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tOrderSummary("continueShopping")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
        <div className="space-y-4">
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          }>
            {items.map((item) => (
              <CartItem
                key={item.itemId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={removeFromCart}
                maxQuantity={stockLimits[item.itemId]}
              />
            ))}
          </Suspense>
        </div>
      </div>

        <div className="lg:col-span-1">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <OrderSummary
              totalItemsFallback={getTotalItems()}
              totalPriceFallback={getTotalPrice()}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
