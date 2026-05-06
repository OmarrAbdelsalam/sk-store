"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Check, Package, ArrowRight, Loader2 } from "lucide-react";
import { orderService } from "@/services/orders";

type OrderItem = {
  productName: string;
  productNameAr?: string;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string;
};

type OrderData = {
  orderNumber: string | null;
  customerName?: string;
  government?: string;
  city?: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
};

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("OrderSuccess");
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const orderNumber = searchParams.get("order");

  useEffect(() => {
    setMounted(true);

    const loadOrder = async () => {
      setIsLoading(true);
      try {
        // 1. Try to load from URL param → fetch from DB
        if (orderNumber) {
          const order = await orderService.getByOrderNumber(orderNumber);
          if (order) {
            setOrderData({
              orderNumber: order.order_number,
              customerName: order.customer_name,
              government: order.government,
              city: order.city,
              subtotal: Number(order.subtotal),
              shippingCost: Number(order.shipping_cost),
              discountAmount: Number(order.discount_amount),
              total: Number(order.total),
              items: (order.items || []).map((item: any) => ({
                productName: item.product_name,
                productNameAr: item.product_name_ar,
                colorNameEn: item.color_name,
                colorNameAr: item.color_name,
                sizeName: item.size_name,
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                subtotal: Number(item.total_price),
                image: item.product_image,
              })),
            });
            return;
          }
        }

        // 2. Fallback: localStorage
        const saved = localStorage.getItem("last_order_data");
        if (saved) {
          setOrderData(JSON.parse(saved));
          localStorage.removeItem("last_order_data");
        }
      } catch (err) {
        console.error("Error loading order:", err);
        // fallback to localStorage
        try {
          const saved = localStorage.getItem("last_order_data");
          if (saved) {
            setOrderData(JSON.parse(saved));
            localStorage.removeItem("last_order_data");
          }
        } catch {}
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderNumber]);

  const orderDate = mounted
    ? (() => {
        try {
          return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date());
        } catch {
          return new Date().toLocaleDateString();
        }
      })()
    : "";

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-6 sm:space-y-8">

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 border-2 border-green-600 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" strokeWidth={2} />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">
              {t("title")}
            </h1>
            <div className="h-px w-12 bg-foreground mx-auto" />
            <p className="text-sm text-muted-foreground tracking-wider">
              {t("subtitle")}
            </p>
          </div>

          {/* Order Details */}
          <div className="border border-border text-start">
            <div className="px-5 sm:px-6 py-4 border-b border-border">
              <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase">
                {t("orderDetails")}
              </h3>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {t("orderNumber")}
                  </p>
                  <p className="text-sm font-medium">
                    {orderData?.orderNumber ? `#${orderData.orderNumber}` : orderNumber ? `#${orderNumber}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {t("orderDate")}
                  </p>
                  <p className="text-sm font-medium">{orderDate}</p>
                </div>
              </div>

              {orderData?.customerName && (
                <div className="border-t border-border pt-5">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {isAr ? "اسم العميل" : "Customer"}
                  </p>
                  <p className="text-sm font-medium">{orderData.customerName}</p>
                  {(orderData.government || orderData.city) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[orderData.city, orderData.government].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-5">
                <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                  {t("shippingInfoTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("shippingInfoBody")}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          {orderData && orderData.items && orderData.items.length > 0 && (
            <div className="border border-border text-start">
              <div className="px-5 sm:px-6 py-4 border-b border-border">
                <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase">
                  {t("orderedItems")}
                </h3>
              </div>
              <div className="p-5 sm:p-6">
                <div className="space-y-0">
                  {orderData.items.map((item, index) => {
                    const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                    const productName = isAr ? (item.productNameAr || item.productName) : item.productName;
                    return (
                      <div key={index} className="flex gap-4 items-center py-4 border-b border-border/50 last:border-0 last:pb-0 first:pt-0">
                        <div className="relative w-16 h-20 bg-[#f5f5f5] overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-1">{productName}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {colorName && `${colorName}`}
                            {colorName && item.sizeName && " · "}
                            {item.sizeName}
                            {(colorName || item.sizeName) && " · "}
                            {t("quantity")}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <p className="text-sm font-medium">
                            {item.unitPrice.toLocaleString()} {isAr ? "جنيه" : "EGP"}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("subtotal")}: {item.subtotal.toLocaleString()} {isAr ? "جنيه" : "EGP"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {orderData.shippingCost > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="tracking-wider uppercase text-xs">{isAr ? "الشحن" : "Shipping"}</span>
                      <span>{orderData.shippingCost.toLocaleString()} {isAr ? "جنيه" : "EGP"}</span>
                    </div>
                  )}
                  {orderData.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="tracking-wider uppercase text-xs">{isAr ? "الخصم" : "Discount"}</span>
                      <span>- {orderData.discountAmount.toLocaleString()} {isAr ? "جنيه" : "EGP"}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-foreground">
                    <span className="text-sm font-medium tracking-wider uppercase">{t("total")}</span>
                    <span className="text-xl font-light tracking-wider">
                      {orderData.total.toLocaleString()} <span className="text-xs tracking-wider uppercase">{isAr ? "جنيه" : "EGP"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => router.push("/my-orders")}
              className="h-12 px-8 border border-foreground text-foreground text-xs font-medium tracking-widest uppercase
                transition-all duration-200 hover:bg-foreground hover:text-background"
            >
              {t("trackOrders")}
            </button>
            <button
              onClick={() => router.push("/")}
              className="h-12 px-8 bg-foreground text-background text-xs font-medium tracking-widest uppercase
                transition-all duration-200 hover:bg-foreground/90 inline-flex items-center justify-center gap-2"
            >
              {t("continueShopping")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Customer Support */}
          <div className="border border-border p-6 sm:p-8 text-center">
            <h3 className="text-xs sm:text-sm font-medium tracking-widest uppercase mb-2">
              {t("needHelp")}
            </h3>
            <p className="text-xs text-muted-foreground mb-5 tracking-wider">
              {t("needHelpBody")}
            </p>
            <button
              onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
              className="h-11 px-6 bg-green-600 text-white text-xs font-medium tracking-widest uppercase
                transition-all duration-200 hover:bg-green-700"
            >
              {t("contactWhatsApp")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
