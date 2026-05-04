"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Package, Calendar, MapPin, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateSessionId } from "@/lib/session";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" dir={dir}>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" dir={dir}>
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => router.push("/")}>{t("backToHome")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t("subtitle")}</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("noOrders")}</h3>
              <p className="text-muted-foreground mb-6">{t("noOrdersDesc")}</p>
              <Button onClick={() => router.push("/")}>{t("startShopping")}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        #{order.id}
                      </CardTitle>
                      <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.orderDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t("expectedDelivery")}: {getExpectedDeliveryDate(order.orderDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {t(`status.${order.orderStatus.toLowerCase()}`)}
                      </span>
                      <p className="text-lg font-bold">
                        {order.totalAmount} {isAr ? "جنيه" : "EGP"}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Collapsible
                    open={openOrderId === order.id}
                    onOpenChange={() =>
                      setOpenOrderId(openOrderId === order.id ? null : order.id)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>{t("viewDetails")}</span>
                        {openOrderId === order.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-6 pt-4">
                      {/* Items */}
                      <div>
                        <h4 className="font-semibold mb-3">{t("items")}</h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => {
                            const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {colorName} • {item.sizeName} • {t("qty")}: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-semibold">
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
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t("shippingAddress")}
                        </h4>
                        <div className="p-4 bg-muted rounded-lg space-y-1 text-sm">
                          <p>
                            <strong>{t("name")}:</strong> {order.customerName}
                          </p>
                          <p>
                            <strong>{t("phone")}:</strong> {order.phoneNumber}
                          </p>
                          <p>
                            <strong>{isAr ? "المحافظة" : "Governorate"}:</strong> {order.government}
                          </p>
                          <p>
                            <strong>{isAr ? "المدينة" : "City"}:</strong> {order.city}
                          </p>
                          {order.detailedAddress && (
                            <p>
                              <strong>{t("address")}:</strong> {order.detailedAddress}
                            </p>
                          )}
                          {order.notes && (
                            <p>
                              <strong>{t("notes")}:</strong> {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment & Summary */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {t("paymentSummary")}
                        </h4>
                        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t("subtotal")}:</span>
                            <span>
                              {order.subTotal} {isAr ? "جنيه" : "EGP"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("shipping")}:</span>
                            <span>
                              {order.shippingCost} {isAr ? "جنيه" : "EGP"}
                            </span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>{t("discount")}:</span>
                              <span>
                                -{order.discountAmount} {isAr ? "جنيه" : "EGP"}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-base pt-2 border-t">
                            <span>{t("total")}:</span>
                            <span>
                              {order.totalAmount} {isAr ? "جنيه" : "EGP"}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <span className="text-muted-foreground">
                              {t("paymentMethod")}: {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
