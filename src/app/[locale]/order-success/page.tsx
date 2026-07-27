"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Check, Package, ArrowRight, Loader2, Copy, Banknote, Store, Clock } from "lucide-react";
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
  paymentMethod?: string;
  easykashVoucher?: string;
  easykashProvider?: string;
  easykashExpiry?: string;
  easykashRef?: string;
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
    <div className="min-h-screen bg-white" dir={dir}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center space-y-8 sm:space-y-10">

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center shadow-sm">
              <Check className="h-10 w-10 text-[#2E7D32]" strokeWidth={2.5} />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider uppercase">
              {t("title")}
            </h1>
            <div className="h-px w-12 bg-foreground mx-auto" />
            <p className="text-sm text-muted-foreground tracking-wider">
              {t("subtitle")}
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-[#F0EBE3]/40 rounded-[32px] p-6 sm:p-8 border border-[#d4c9bc] text-start shadow-sm">
            <div className="pb-4 mb-4 border-b border-[#d4c9bc]/60">
              <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                {t("orderDetails")}
              </h3>
            </div>
            <div className="space-y-6">
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
                <div className="border-t border-[#d4c9bc]/60 pt-5">
                  <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                    {isAr ? "اسم العميل" : "Customer"}
                  </p>
                  <p className="text-sm font-medium text-gray-900">{orderData.customerName}</p>
                  {(orderData.government || orderData.city) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[orderData.city, orderData.government].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-[#d4c9bc]/60 pt-5">
                <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1.5">
                  {t("shippingInfoTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("shippingInfoBody")}
                </p>
              </div>
            </div>
          </div>

          {/* EasyKash Voucher — shown when payment was made via Fawry/Aman */}
          {orderData?.easykashVoucher && (
            <EasyKashVoucherCard
              voucher={orderData.easykashVoucher}
              provider={orderData.easykashProvider}
              expiryDate={orderData.easykashExpiry}
              easykashRef={orderData.easykashRef}
              total={orderData.total}
              isAr={isAr}
            />
          )}

          {/* Ordered Items */}
          {orderData && orderData.items && orderData.items.length > 0 && (
            <div className="bg-[#F0EBE3]/40 rounded-[32px] p-6 sm:p-8 border border-[#d4c9bc] text-start shadow-sm">
              <div className="pb-4 mb-4 border-b border-[#d4c9bc]/60">
                <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                  {t("orderedItems")}
                </h3>
              </div>
              <div className="space-y-0">
                  {orderData.items.map((item, index) => {
                    const colorName = isAr ? item.colorNameAr : item.colorNameEn;
                    const productName = isAr ? (item.productNameAr || item.productName) : item.productName;
                    return (
                      <div key={index} className="flex gap-4 items-center py-4 border-b border-[#d4c9bc]/40 last:border-0 last:pb-0 first:pt-0">
                        <div className="relative w-16 h-20 bg-white rounded-[16px] overflow-hidden flex-shrink-0 shadow-sm border border-[#d4c9bc]/50">
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
                <div className="mt-6 pt-6 border-t border-[#d4c9bc]/60 space-y-3">
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
                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#d4c9bc]">
                    <span className="text-sm font-bold tracking-wider uppercase text-gray-900">{t("total")}</span>
                    <span className="text-2xl font-bold text-gray-900 tracking-wider">
                      {orderData.total.toLocaleString()} <span className="text-sm font-medium tracking-wider uppercase">{isAr ? "جنيه" : "EGP"}</span>
                    </span>
                  </div>
                </div>
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button
              onClick={() => router.push("/my-orders")}
              className="h-14 px-10 rounded-full border border-gray-900 text-gray-900 bg-white text-sm font-bold tracking-widest uppercase
                transition-all duration-300 hover:bg-[#F0EBE3]"
            >
              {t("trackOrders")}
            </button>
            <button
              onClick={() => router.push("/")}
              className="h-14 px-10 rounded-full bg-black text-white text-sm font-bold tracking-widest uppercase
                transition-all duration-300 hover:bg-black hover:-translate-y-1 shadow-md hover:shadow-xl inline-flex items-center justify-center gap-2"
            >
              {t("continueShopping")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Customer Support */}
          <div className="bg-[#F0EBE3]/20 rounded-[32px] p-8 text-center border border-[#d4c9bc]">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-3 text-gray-900">
              {t("needHelp")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {t("needHelpBody")}
            </p>
            <button
              onClick={() => window.open("https://wa.me/+201501881005", "_blank")}
              className="h-12 px-8 rounded-full bg-[#25D366] text-white text-xs font-bold tracking-widest uppercase
                transition-all duration-300 hover:bg-[#1EBE5D] hover:-translate-y-1 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
            >
              {t("contactWhatsApp")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── EasyKash Voucher Card ────────────────────────────────────────────────────

function EasyKashVoucherCard({
  voucher,
  provider,
  expiryDate,
  easykashRef,
  total,
  isAr,
}: {
  voucher: string;
  provider?: string;
  expiryDate?: string;
  easykashRef?: string;
  total: number;
  isAr: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-6 sm:p-8 text-start shadow-sm">
      <div className="pb-4 mb-4 border-b border-amber-200/80 flex items-center gap-2">
        <Banknote className="w-4 h-4 text-amber-700" />
        <h3 className="text-sm font-bold tracking-widest uppercase text-amber-900">
          {isAr ? "كود الدفع النقدي" : "Cash Payment Code"}
        </h3>
      </div>

      <p className="text-sm text-amber-800 mb-5">
        {isAr
          ? `ادفع ${total.toLocaleString()} جنيه في أقرب فرع ${provider || ""} باستخدام الكود التالي:`
          : `Pay ${total.toLocaleString()} EGP at any ${provider || ""} branch using the code below:`}
      </p>

      {/* Voucher */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between gap-3 border border-amber-200 mb-4">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
            {isAr ? "كود الدفع" : "Payment Code"}
          </p>
          <p className="text-2xl font-bold tracking-widest text-gray-900 font-mono">
            {voucher}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-amber-900 text-white hover:bg-amber-800"
          }`}
          aria-label={isAr ? "نسخ الكود" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {isAr ? "تم النسخ" : "Copied"}
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              {isAr ? "نسخ" : "Copy"}
            </>
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {provider && (
          <div className="bg-white rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                {isAr ? "المزود" : "Provider"}
              </p>
            </div>
            <p className="font-semibold text-gray-900">{provider}</p>
          </div>
        )}
        {expiryDate && (
          <div className="bg-white rounded-xl p-3 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                {isAr ? "صالح حتى" : "Expires"}
              </p>
            </div>
            <p className="font-semibold text-gray-900">{expiryDate}</p>
          </div>
        )}
      </div>

      {easykashRef && (
        <p className="mt-4 text-center text-[11px] text-amber-700">
          {isAr ? "مرجع EasyKash:" : "EasyKash Ref:"}{" "}
          <span className="font-mono font-semibold">{easykashRef}</span>
        </p>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
