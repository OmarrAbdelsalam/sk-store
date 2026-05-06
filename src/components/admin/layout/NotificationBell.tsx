"use client";

import { Bell, BellOff, Package, CheckCheck, Loader2, MapPin, Phone, CreditCard, X } from "lucide-react";
import { useState } from "react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Order } from "@/services/orders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function NotificationBell() {
  const { notifications, unreadCount, pushGranted, markAllRead, markRead, fetchOrderDetail, requestPushPermission } =
    useAdminNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNotifClick = async (id: string) => {
    setDropdownOpen(false);
    markRead(id);
    setLoadingId(id);
    const order = await fetchOrderDetail(id);
    setLoadingId(null);
    if (order) {
      setSelectedOrder(order);
      setModalOpen(true);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(n);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 p-0 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-600" />
              <span className="font-semibold text-sm text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={requestPushPermission}
                title={pushGranted ? "Push enabled" : "Enable push notifications"}
                className={`p-1.5 rounded-lg transition-colors ${pushGranted ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}
              >
                {pushGranted ? <Bell size={14} /> : <BellOff size={14} />}
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Mark all as read" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                  <CheckCheck size={14} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n.id)}
                  disabled={loadingId === n.id}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.isRead ? "bg-blue-50/50" : ""}`}
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? "bg-blue-100" : "bg-gray-100"}`}>
                    {loadingId === n.id ? (
                      <Loader2 size={14} className="animate-spin text-blue-500" />
                    ) : (
                      <Package size={14} className={!n.isRead ? "text-blue-600" : "text-gray-400"} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">#{n.order_number}</p>
                      {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{n.customer_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-medium text-gray-800">{n.total.toLocaleString()} EGP</span>
                      <span className="text-[10px] text-gray-400">{formatTime(n.created_at)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Push CTA */}
          {!pushGranted && (
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-700 mb-2">Enable push notifications to get alerts for new orders.</p>
              <button onClick={requestPushPermission} className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors">
                Enable Notifications
              </button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Order Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden" dir="ltr">
          {selectedOrder && (
            <>
              <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 bg-gray-50">
                <DialogTitle className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-base font-bold text-gray-900">#{selectedOrder.order_number}</span>
                    <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-normal">
                    {formatTime(selectedOrder.created_at || "")}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</h4>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package size={14} className="text-gray-400" />
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span>{selectedOrder.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{[selectedOrder.city, selectedOrder.government].filter(Boolean).join(", ")}</span>
                    </div>
                    {selectedOrder.detailed_address && (
                      <p className="text-xs text-gray-500 pl-5">{selectedOrder.detailed_address}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard size={14} className="text-gray-400" />
                      <span className="capitalize">{selectedOrder.payment_method || "cash"}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({selectedOrder.items.length})</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-500">
                              {[item.color_name, item.size_name].filter(Boolean).join(" · ")}
                              {" · "}Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                            {fmt(Number(item.unit_price))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{fmt(Number(selectedOrder.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{fmt(Number(selectedOrder.shipping_cost))}</span>
                  </div>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount {selectedOrder.discount_code && `(${selectedOrder.discount_code})`}</span>
                      <span>- {fmt(Number(selectedOrder.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{fmt(Number(selectedOrder.total))}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                    <span className="font-semibold">Note: </span>{selectedOrder.notes}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
