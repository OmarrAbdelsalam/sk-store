"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateSessionId } from "@/lib/session";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

type OrderItem = {
  productId: number;
  productName: string;
  colorId: number;
  colorNameAr: string;
  colorNameEn: string;
  sizeId: number;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type OrderData = {
  orderId: number;
  sessionId: string;
  subTotal: number;
  totalAmount: number;
  items: OrderItem[];
};

export default function OrderSuccessPage() {
  const router = useRouter();
  const search = useSearchParams();
  const t = useTranslations("OrderSuccess");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isAr = locale === "ar";

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get order data from localStorage
    try {
      const saved = localStorage.getItem('last_order_data');
      if (saved) {
        setOrderData(JSON.parse(saved));
        localStorage.removeItem('last_order_data'); // Clean up
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    }
  }, []);

  const orderNumber = useMemo(() => {
    if (!mounted) return '';
    return orderData?.sessionId || getOrCreateSessionId();
  }, [orderData, mounted]);

  const orderDate = useMemo(() => {
    if (!mounted) return '';
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, [locale, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" aria-hidden="true" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-green-600">{t("title")}</h1>
            <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
          </div>

          {/* Order Details Card */}
          <Card className="text-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" aria-hidden="true" />
                {t("orderDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("orderNumber")}</p>
                  <p className="font-semibold text-lg">#{orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("orderDate")}</p>
                  <p className="font-semibold text-lg">{orderDate}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{t("shippingInfoTitle")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("shippingInfoBody")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ordered Items */}
          {orderData && orderData.items && orderData.items.length > 0 && (
            <Card className="text-start">
              <CardHeader>
                <CardTitle>{t("orderedItems")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item, index) => {
                    const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                    return (
                      <div key={index} className="flex gap-4 items-center border-b pb-4 last:border-0">
                        <div className="relative w-20 h-20 bg-luxury-cream rounded-lg overflow-hidden flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {colorName && `${colorName} • `}
                            {item.sizeName && `${item.sizeName} • `}
                            {t("quantity")}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.unitPrice} {isAr ? "جنيه" : "EGP"}</p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-muted-foreground">
                              {t("subtotal")}: {item.subtotal} {isAr ? "جنيه" : "EGP"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                    <span>{t("total")}</span>
                    <span>{orderData.totalAmount} {isAr ? "جنيه" : "EGP"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push("/my-orders")} 
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              {t("trackOrders")}
            </Button>
            <Button 
              size="lg" 
              onClick={() => router.push("/")} 
              className="flex items-center gap-2"
            >
              {t("continueShopping")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Customer Support */}
          <div className="bg-muted rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">{t("needHelp")}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t("needHelpBody")}</p>
            <Button 
              onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {t("contactWhatsApp")}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
