"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Package, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MyOrdersSkeleton } from "@/components/skeletons";
import { formatPrice } from "@/lib/price";
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
      // The far end of the 7–10 day window, not the near one. This prints as a
      // single date with no "around" attached to it, so the customer reads it as
      // a promise — and the only promise safe to make in one date is the last
      // day we'd still be on time.
      deliveryDate.setDate(deliveryDate.getDate() + 10);
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
        return "border-warning bg-warning-soft text-ink";
      case "confirmed":
        return "border-info bg-info-soft text-ink";
      case "shipped":
        return "border-ink bg-beige text-ink";
      case "delivered":
        return "border-success bg-success-soft text-ink";
      case "cancelled":
        return "border-danger bg-danger-soft text-ink";
      default:
        return "border-gray-300 text-gray-500";
    }
  };

  // Stored values ("easykash", "cash"…) → words a customer reads.
  const paymentMethodLabel = (method?: string | null) => {
    const m = String(method ?? "").toLowerCase();
    if (m.includes("easykash") || m === "online" || m === "card") return isAr ? "دفع أونلاين (EasyKash)" : "Paid online (EasyKash)";
    if (m.includes("cash") || m === "cod") return isAr ? "الدفع عند الاستلام" : "Cash on delivery";
    return method || "—";
  };

  const money = (v: number | string) => formatPrice(v, locale);

  // Loading state — same skeleton as the route loader
  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <MyOrdersSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className="mx-auto flex max-w-3xl flex-col items-center px-gutter py-16 text-center sm:py-24 lg:px-gutter-lg">
          <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">
            {isAr ? "حصلت مشكلة" : "Something went wrong"}
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-6 text-gray-500">{error}</p>
          <Button asChild className="mt-8 h-12 px-10">
            <Link href="/products">{t("backToHome")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="mx-auto max-w-3xl px-gutter py-8 sm:py-section lg:px-gutter-lg">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[36px]">{t("title")}</h1>
          <p className="mt-2 font-sans text-[14px] leading-6 text-gray-500">{t("subtitle")}</p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center border-t border-gray-200 py-16 text-center">
            <Package className="size-9 text-ink" strokeWidth={1.25} />
            <h2 className="mt-5 font-display text-[22px] leading-tight text-ink">{t("noOrders")}</h2>
            <p className="mt-2 font-sans text-[14px] leading-6 text-gray-500">{t("noOrdersDesc")}</p>
            <Button asChild className="mt-8 h-12 px-10">
              <Link href="/products">{t("startShopping")}</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const isOpen = openOrderId === order.id;
              return (
                <li key={order.id} className="border border-gray-200 bg-background">
                  {/* Order header */}
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-sans text-[15px] font-semibold text-ink">
                          {isAr ? "طلب" : "Order"} #{order.id}
                        </h2>
                        <span className={`border px-2 py-0.5 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] ${getStatusStyle(order.orderStatus)}`}>
                          {t(`status.${order.orderStatus.toLowerCase()}`)}
                        </span>
                      </div>
                      <p className="font-sans text-[13px] leading-5 text-gray-500">{formatDate(order.orderDate)}</p>
                      <p className="font-sans text-[13px] leading-5 text-gray-500">
                        {t("expectedDelivery")}: {getExpectedDeliveryDate(order.orderDate)}
                      </p>
                    </div>
                    <p className="font-sans text-[17px] font-semibold tabular-nums text-ink sm:text-end">
                      {money(order.totalAmount)}
                    </p>
                  </div>

                  {/* Expand toggle */}
                  <button
                    type="button"
                    onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between border-t border-gray-200 px-5 py-3.5 font-sans text-[14px] text-ink transition-colors duration-fast hover:bg-beige sm:px-6"
                  >
                    <span>{isOpen ? (isAr ? "إخفاء التفاصيل" : "Hide details") : t("viewDetails")}</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={1.5}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-200">
                      {/* Items */}
                      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                        <h3 className="border-b border-gray-200 pb-3 font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">
                          {t("items")}
                        </h3>
                        <ul>
                          {order.items.map((item, idx) => {
                            const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                            const meta = [colorName, item.sizeName, `${t("qty")}: ${item.quantity}`].filter(Boolean).join(" · ");
                            return (
                              <li key={idx} className="border-b border-gray-200 py-4 last:border-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-sans text-[15px] leading-[22px] text-ink">{item.productName}</p>
                                    <p className="mt-0.5 font-sans text-[13px] leading-5 text-gray-500">{meta}</p>
                                  </div>
                                  <p className="shrink-0 font-sans text-[14px] tabular-nums text-ink">{money(item.subtotal)}</p>
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
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                        {/* Delivery address */}
                        <div>
                          <h3 className="mb-3 font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">{t("shippingAddress")}</h3>
                          <dl className="space-y-1 font-sans text-[14px] leading-6 text-ink">
                            <div><dt className="sr-only">{t("name")}</dt><dd>{order.customerName}</dd></div>
                            <div><dt className="sr-only">{t("phone")}</dt><dd dir="ltr" className="text-start">{order.phoneNumber}</dd></div>
                            <div>
                              <dt className="sr-only">{t("address")}</dt>
                              <dd>{[order.detailedAddress, order.city, order.government].filter(Boolean).join("، ")}</dd>
                            </div>
                            {order.notes && (
                              <div className="text-gray-500">
                                <dt className="inline">{t("notes")}: </dt>
                                <dd className="inline">{order.notes}</dd>
                              </div>
                            )}
                          </dl>
                        </div>

                        {/* Payment summary */}
                        <div className="bg-beige p-5">
                          <h3 className="mb-3 font-sans text-[11px] uppercase tracking-[0.12em] text-gray-500">{t("paymentSummary")}</h3>
                          <dl className="space-y-2 font-sans text-[14px] text-ink">
                            <div className="flex justify-between gap-4">
                              <dt>{t("subtotal")}</dt>
                              <dd className="tabular-nums">{money(order.subTotal)}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt>{t("shipping")}</dt>
                              <dd className="tabular-nums">{money(order.shippingCost)}</dd>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between gap-4">
                                <dt>{t("discount")}</dt>
                                <dd className="tabular-nums">−{money(order.discountAmount)}</dd>
                              </div>
                            )}
                            <div className="flex items-baseline justify-between gap-4 border-t border-gray-200 pt-3">
                              <dt className="font-semibold">{t("total")}</dt>
                              <dd className="text-[17px] font-semibold tabular-nums">{money(order.totalAmount)}</dd>
                            </div>
                          </dl>
                          <p className="mt-3 font-sans text-[13px] text-gray-500">
                            {t("paymentMethod")}: {paymentMethodLabel(order.paymentMethod)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
