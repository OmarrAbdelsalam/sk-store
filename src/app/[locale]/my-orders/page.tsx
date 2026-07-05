"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Package, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { getOrCreateSessionId } from "@/lib/session";
import { OrderItemReview } from "@/components/orders/OrderItemReview";
import { API_ROUTES } from "@/lib/api-routes";

type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  colorNameAr: string;
  colorNameEn: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  review?: {
    id: number;
    rating: number;
    comment: string | null;
  } | null;
};

type Order = {
  id: string;
  sessionId: string;
  customerName: string;
  phoneNumber: string;
  government: string;
  city: string;
  detailedAddress: string;
  notes: string;
  paymentMethod: string;
  orderStatus: string;
  discountCode: string | null;
  discountPercentage: number;
  discountAmount: number;
  shippingCost: number;
  subTotal: number;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
};

export default function MyOrdersPage() {
  const router = useRouter();
  const t = useTranslations("MyOrders");
  const locale = useLocale();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const fetchOrders = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.orders.bySessionId(sessionId));

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const response = await res.json();
      if (response.succeeded && Array.isArray(response.data)) {
        // Sort orders by created_at (newest first)
        const sortedOrders = response.data.sort((a: Order, b: Order) => 
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    fetchOrders(sessionId);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const getExpectedDeliveryDate = (orderDateString: string) => {
    try {
      const orderDate = new Date(orderDateString);
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(deliveryDate);
    } catch {
      return "";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400";
      case "confirmed":
        return "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400";
      case "shipped":
        return "border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400";
      case "delivered":
        return "border-green-600 text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400";
      case "cancelled":
        return "border-red-500 text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400";
      default:
        return "border-border text-muted-foreground";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-2 border-foreground border-t-transparent" />
            <p className="text-xs tracking-widest uppercase text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="border border-border p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="h-11 px-8 bg-foreground text-background text-xs font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors"
            >
              {t("backToHome")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Page Title */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase text-[#2D2A26]">{t("title")}</h1>
          <div className="h-px w-12 bg-[#2D2A26] mt-3" />
          <p className="text-xs tracking-wider text-muted-foreground mt-3">{t("subtitle")}</p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-[#F0EBE3]/30 rounded-[32px] border border-[#d4c9bc] p-10 sm:p-16 text-center space-y-5 shadow-sm">
            <Package className="h-12 w-12 text-[#2D2A26]/40 mx-auto" />
            <h3 className="text-base font-bold tracking-widest uppercase text-[#2D2A26]">{t("noOrders")}</h3>
            <p className="text-sm text-muted-foreground tracking-wider">{t("noOrdersDesc")}</p>
            <button
              onClick={() => router.push("/")}
              className="h-14 px-10 rounded-full bg-[#2D2A26] text-white text-sm font-bold tracking-widest uppercase hover:bg-black hover:-translate-y-1 shadow-md hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 mt-4"
            >
              {t("startShopping")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isOpen = openOrderId === order.id;
              return (
                <div key={order.id} className="bg-[#F0EBE3]/40 rounded-[24px] border border-[#d4c9bc] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
                  {/* Order Header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-medium tracking-wider">
                            #{order.id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusStyle(order.orderStatus)}`}>
                            {t(`status.${order.orderStatus.toLowerCase()}`)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.orderDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("expectedDelivery")}: {getExpectedDeliveryDate(order.orderDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-start sm:text-end">
                        <span className="text-xl font-light tracking-wider">
                          {order.totalAmount}
                        </span>
                        <span className="text-xs tracking-wider uppercase text-muted-foreground ml-1.5">
                          {isAr ? "جنيه" : "EGP"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expand Toggle */}
                  <button
                    onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                    className="w-full flex items-center justify-between px-5 sm:px-6 py-4 border-t border-[#d4c9bc]/60 text-xs tracking-widest uppercase text-[#2D2A26] font-bold hover:bg-white/50 transition-colors"
                  >
                    <span>{t("viewDetails")}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="border-t border-[#d4c9bc]/60 bg-white/60">
                      {/* Items Section */}
                      <div className="p-5 sm:p-6">
                        <h4 className="text-xs font-bold tracking-widest uppercase text-[#2D2A26] mb-4">
                          {t("items")}
                        </h4>
                        <div className="space-y-0">
                          {order.items.map((item, idx) => {
                            const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center py-4 border-b border-[#d4c9bc]/40 last:border-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {colorName && `${colorName}`}
                                      {colorName && item.sizeName && " · "}
                                      {item.sizeName && `${item.sizeName}`}
                                      {(colorName || item.sizeName) && " · "}
                                      {t("qty")}: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium flex-shrink-0">
                                    {item.subtotal} {isAr ? "جنيه" : "EGP"}
                                  </p>
                                </div>
                                {order.orderStatus.toLowerCase() === "delivered" && (
                                  <OrderItemReview
                                    orderItemId={item.id}
                                    productId={item.productId}
                                    productName={item.productName}
                                    sessionId={getOrCreateSessionId()}
                                    onReviewChange={() => {
                                      const sessionId = getOrCreateSessionId();
                                      fetchOrders(sessionId);
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <h4 className="text-xs font-bold tracking-widest uppercase text-[#2D2A26] mb-3">
                          {t("shippingAddress")}
                        </h4>
                        <div className="bg-white rounded-[16px] border border-[#d4c9bc]/50 p-5 space-y-2 text-sm shadow-sm">
                          <p>
                            <span className="text-xs text-muted-foreground">{t("name")}:</span>{" "}
                            {order.customerName}
                          </p>
                          <p>
                            <span className="text-xs text-muted-foreground">{t("phone")}:</span>{" "}
                            {order.phoneNumber}
                          </p>
                          <p>
                            <span className="text-xs text-muted-foreground">{isAr ? "المحافظة" : "Governorate"}:</span>{" "}
                            {order.government}
                          </p>
                          <p>
                            <span className="text-xs text-muted-foreground">{isAr ? "المدينة" : "City"}:</span>{" "}
                            {order.city}
                          </p>
                          {order.detailedAddress && (
                            <p>
                              <span className="text-xs text-muted-foreground">{t("address")}:</span>{" "}
                              {order.detailedAddress}
                            </p>
                          )}
                          {order.notes && (
                            <p>
                              <span className="text-xs text-muted-foreground">{t("notes")}:</span>{" "}
                              {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <h4 className="text-xs font-bold tracking-widest uppercase text-[#2D2A26] mb-3">
                          {t("paymentSummary")}
                        </h4>
                        <div className="bg-white rounded-[16px] border border-[#d4c9bc]/50 p-5 space-y-3 text-sm shadow-sm">
                          <div className="flex justify-between">
                            <span className="text-xs tracking-wider uppercase text-muted-foreground">{t("subtotal")}</span>
                            <span>{order.subTotal} {isAr ? "جنيه" : "EGP"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs tracking-wider uppercase text-muted-foreground">{t("shipping")}</span>
                            <span>{order.shippingCost} {isAr ? "جنيه" : "EGP"}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-xs tracking-wider uppercase text-muted-foreground">{t("discount")}</span>
                              <span>-{order.discountAmount} {isAr ? "جنيه" : "EGP"}</span>
                            </div>
                          )}
                          <div className="border-t border-[#d4c9bc] pt-3 mt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold tracking-wider uppercase text-[#2D2A26]">{t("total")}</span>
                              <span className="text-xl font-bold tracking-wider text-[#2D2A26]">
                                {order.totalAmount} <span className="text-xs font-medium uppercase">{isAr ? "جنيه" : "EGP"}</span>
                              </span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-[#d4c9bc]/40">
                            <span className="text-xs text-muted-foreground tracking-wider uppercase">
                              {t("paymentMethod")}: {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
