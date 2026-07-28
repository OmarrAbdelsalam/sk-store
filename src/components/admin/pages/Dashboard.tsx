"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  PlusCircle,
  LayoutDashboard,
  ArrowRight,
  Bell
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { analyticsService } from "@/services/analytics";
import { PageHeader } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { playOrderSound } from "@/lib/orderSound";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardData {
  summary: {
    total_revenue: number;
    revenue_growth: number;
    total_orders: number;
    orders_growth: number;
    average_order_value: number;
    conversion_rate: number;
  };
  recentOrders: {
    id: string;
    customer: string;
    amount: number;
    status: "completed" | "pending" | "processing";
    date: string;
  }[];
}

import { useQuery } from "@tanstack/react-query";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Realtime subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Play sound
          playOrderSound();

          // Show alert banner
          const customerName = (payload.new as any)?.customer_name || 'New customer';
          const total = (payload.new as any)?.total || 0;
          setNewOrderAlert(`🛍️ New order from ${customerName} — EGP ${Number(total).toFixed(2)}`);

          // Clear alert after 6 seconds
          if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
          alertTimerRef.current = setTimeout(() => setNewOrderAlert(null), 6000);

          // Refresh dashboard data
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [queryClient]);
  const { data, isLoading } = useQuery<DashboardData | null>({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [dashboardStats, recentOrders] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getRecentOrders(5)
      ]);

      return {
        summary: {
          total_revenue: dashboardStats.totalRevenue,
          revenue_growth: 12.5,
          total_orders: dashboardStats.totalOrders,
          orders_growth: 8.3,
          average_order_value: dashboardStats.averageOrderValue,
          conversion_rate: 2.1,
        },
        recentOrders: recentOrders.map(order => ({
          id: order.orderNumber,
          customer: order.customerName,
          amount: order.total,
          status: order.status as any,
          date: new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
        })),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div dir="ltr" className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-7 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Orders Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Revenue",
      value: `${data!.summary.total_revenue.toLocaleString()}`,
      suffix: "EGP",
      icon: DollarSign,
      change: data!.summary.revenue_growth,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: "Orders",
      value: data!.summary.total_orders.toString(),
      icon: ShoppingCart,
      change: data!.summary.orders_growth,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: "Avg. Order",
      value: `${data!.summary.average_order_value.toFixed(2)}`,
      suffix: "EGP",
      icon: TrendingUp,
      change: 5.2,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
    {
      label: "Conversion",
      value: `${data!.summary.conversion_rate}%`,
      icon: Users,
      change: -1.3,
      color: 'text-orange-600',
      iconBg: 'bg-orange-50',
    },
  ];

  return (
    <div dir="ltr" className="space-y-5 md:space-y-6">

      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Bell size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm flex-1">{newOrderAlert}</span>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="text-white/70 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Welcome back! Here's your store overview."
        actions={
          <Link href="/admin/products">
            <Button className="rounded-xl shadow-md bg-primary hover:bg-primary/90 text-white px-4 md:px-5 text-sm">
              <PlusCircle size={16} className="mr-2" /> Add Product
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-white rounded-2xl p-3.5 md:p-5 border border-gray-100 transition-shadow hover:shadow-md ${i === 0 ? 'ring-1 ring-emerald-100' : ''}`}
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-[0.65rem] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</span>
              {stat.suffix && <span className="text-[0.6rem] md:text-xs text-gray-400 font-medium">{stat.suffix}</span>}
            </div>
            <div className="mt-1.5 flex items-center gap-1">
              {stat.change >= 0 ? (
                <span className="text-[0.6rem] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{stat.change}%</span>
              ) : (
                <span className="text-[0.6rem] md:text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{stat.change}%</span>
              )}
              <span className="text-[0.55rem] md:text-[0.65rem] text-gray-400 hidden sm:inline">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3.5 md:py-4 border-b border-gray-50">
          <div>
            <h3 className="text-sm md:text-base font-bold text-gray-900">Recent Orders</h3>
            <p className="text-[0.65rem] md:text-xs text-gray-400 mt-0.5">Latest 5 orders</p>
          </div>
          <Link href="/admin/orders">
            <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
              View All
              <ArrowRight size={12} />
            </button>
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data!.recentOrders.map((order) => {
                const style = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                return (
                  <tr key={order.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {order.customer.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{order.customer}</span>
                          <span className="block text-[0.65rem] text-gray-400">{order.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-gray-900">EGP {order.amount.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">{order.date}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Order Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {data!.recentOrders.map((order) => {
            const style = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            return (
              <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                  {order.customer.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-gray-900 text-sm truncate">{order.customer}</span>
                    <span className="font-bold text-gray-900 text-sm shrink-0 ml-2">EGP {order.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] font-bold ${style.bg} ${style.text}`}>
                      <span className={`w-1 h-1 rounded-full ${style.dot}`}></span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-[0.6rem] text-gray-400">{order.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
