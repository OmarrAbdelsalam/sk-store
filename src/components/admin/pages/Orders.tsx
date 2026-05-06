"use client";

import { useEffect, useState } from "react";
import { Package, Eye, Clock, Truck, Check, X, RefreshCw, Search, DollarSign, ShoppingCart, User, Phone, MapPin, MessageCircle, StickyNote, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { PageHeader, Card } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { orderService, Order } from "@/services/orders";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: Check },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: Check },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: X },
};

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const OrdersPage = () => {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['orders-data'],
    queryFn: async () => {
      return await orderService.getAll();
    },
    staleTime: 5 * 60 * 1000,
  });

  const orders = ordersData || [];

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.phone_number.includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['orders-data'] });
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    isHighlight,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    isHighlight?: boolean;
  }) => (
    <div
      className={`stat-card ${isHighlight ? 'highlight' : ''}`}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total : 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Manage customer orders"
        icon={Package}
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          isHighlight={true}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Clock}
        />
        <StatCard
          title="Completed Orders"
          value={completedOrders}
          icon={Check}
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by order number, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Orders — Desktop Table */}
      <Card className="overflow-hidden hidden md:block" noPadding>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                    <td><div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div></td>
                    <td>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                    <td className="text-right">
                      <div className="h-8 w-16 bg-gray-200 rounded-xl animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-12">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="font-mono text-sm font-medium">
                          {order.order_number}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.phone_number}</p>
                        </div>
                      </td>
                      <td className="font-semibold">
                        {formatCurrency(order.total)}
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-xl text-primary hover:text-primary"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Orders — Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-28 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded mb-3"></div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status];
            const StatusIcon = statusInfo.icon;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl border border-gray-100 p-4 active:bg-gray-50 transition-colors cursor-pointer"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                {/* Top row: Order # + Status */}
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-mono text-xs font-semibold text-gray-500 tracking-wide">
                    {order.order_number}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>

                {/* Customer name + phone */}
                <p className="font-semibold text-gray-900 text-[0.95rem] leading-tight">
                  {order.customer_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 tracking-wide">
                  {order.phone_number}
                </p>

                {/* Bottom row: Amount + Date */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-base">
                    {formatCurrency(order.total)}
                  </span>
                  <span className="text-[0.7rem] text-gray-400">
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (() => {
            const statusInfo = STATUS_CONFIG[selectedOrder.status];
            return (
              <>
                {/* Header with gradient */}
                <div
                  className="px-5 pt-5 pb-4"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
                    >
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-base leading-tight truncate">
                        {selectedOrder.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Status selector — tappable chips */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2.5">Update Status</span>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(STATUS_CONFIG) as [Order["status"], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, config]) => {
                        const Icon = config.icon;
                        const isActive = selectedOrder.status === key;
                        
                        // Color mapping for filled chips
                        const chipStyles: Record<string, { bg: string; text: string; border: string }> = {
                          pending:   { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
                          confirmed: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
                          shipped:   { bg: '#ede9fe', text: '#5b21b6', border: '#a78bfa' },
                          delivered: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
                          cancelled: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
                        };
                        const style = chipStyles[key];

                        return (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(selectedOrder.id, key)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                            style={isActive ? {
                              background: style.bg,
                              color: style.text,
                              border: `1.5px solid ${style.border}`,
                              boxShadow: `0 2px 8px ${style.bg}`,
                            } : {
                              background: '#fff',
                              color: '#94a3b8',
                              border: '1.5px solid #e2e8f0',
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">

                  {/* Customer Info */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer</h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-emerald-500" />
                        </div>
                        <a href={`tel:${selectedOrder.phone_number}`} className="font-medium text-gray-700 text-sm hover:text-indigo-600 transition-colors">
                          {selectedOrder.phone_number}
                        </a>
                      </div>
                      {selectedOrder.whatsapp_number && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="font-medium text-gray-700 text-sm">{selectedOrder.whatsapp_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping</h4>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {[
                            selectedOrder.detailed_address,
                            selectedOrder.city,
                            selectedOrder.government,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {selectedOrder.notes && (
                          <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-amber-50/60 rounded-lg">
                            <StickyNote className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700">{selectedOrder.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Items ({selectedOrder.items?.length || 0})
                    </h4>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100/80"
                          >
                            {/* Quantity badge */}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                              style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', color: '#4f46e5' }}
                            >
                              {item.quantity}x
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</p>
                              {(item.color_name || item.size_name) && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  {item.color_name && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                      {item.color_name}
                                    </span>
                                  )}
                                  {item.size_name && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                      {item.size_name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-gray-900 text-sm shrink-0">
                              {formatCurrency(item.total_price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No items found</p>
                    )}
                  </div>
                </div>

                {/* Summary Footer */}
                <div className="px-5 pb-5">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium text-gray-700">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium text-gray-700">{formatCurrency(selectedOrder.shipping_cost)}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Tag className="w-3.5 h-3.5" />
                          {selectedOrder.discount_code}
                        </span>
                        <span className="font-medium text-emerald-600">-{formatCurrency(selectedOrder.discount_amount)}</span>
                      </div>
                    )}
                    <div
                      className="flex justify-between items-center mt-2 -mx-4 -mb-4 px-4 py-3 rounded-b-xl"
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
                    >
                      <span className="font-bold text-white/90 text-sm">Total</span>
                      <span className="font-extrabold text-white text-lg">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;