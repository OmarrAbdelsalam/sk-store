"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader, Card } from "@/components/admin/common";
import { Button } from "@/components/ui/button";
import { analyticsService } from "@/services/analytics";

import { useQuery, useQueryClient } from "@tanstack/react-query";

const AnalyticsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const [
        dashboardStats,
        revenue,
        orders,
        products,
        governments,
        recent,
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getDailyRevenue(14),
        analyticsService.getDailyOrders(14),
        analyticsService.getTopSellingProducts(5),
        analyticsService.getTopGovernments(5),
        analyticsService.getRecentOrders(5),
      ]);
      return {
        stats: dashboardStats,
        dailyRevenue: revenue,
        dailyOrders: orders,
        topProducts: products,
        topGovernments: governments,
        recentOrders: recent,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const stats = data?.stats || {
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  };
  const dailyRevenue = data?.dailyRevenue || [];
  const dailyOrders = data?.dailyOrders || [];
  const topProducts = data?.topProducts || [];
  const topGovernments = data?.topGovernments || [];
  const recentOrders = data?.recentOrders || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMaxRevenue = () => Math.max(...dailyRevenue.map(d => d.revenue), 1);
  const getMaxOrders = () => Math.max(...dailyOrders.map(d => d.count), 1);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    isHighlight,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: { value: number; isPositive: boolean; text?: string };
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
      {trend && (
        <div className="stat-trend">
          <span className={trend.isPositive ? 'trend-up' : 'trend-down'}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="trend-text">{trend.text || 'vs last period'}</span>
        </div>
      )}
    </div>
  );

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="ltr">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card animate-pulse">
               <div className="stat-header mb-4">
                 <div className="h-4 w-24 bg-gray-200 rounded"></div>
                 <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
               </div>
               <div className="h-10 w-32 bg-gray-200 rounded mt-2 mb-1"></div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="content-card min-h-[300px] animate-pulse">
            <div className="content-header border-b border-gray-100 flex items-center">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="p-6 h-56 flex items-end gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded-t-lg" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
              ))}
            </div>
          </div>
          <div className="content-card min-h-[300px] animate-pulse">
            <div className="content-header border-b border-gray-100 flex items-center">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="p-6 h-56 flex items-end gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded-t-lg" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(cardIdx => (
            <div key={cardIdx} className="content-card min-h-[300px] animate-pulse">
              <div className="content-header border-b border-gray-100 flex items-center">
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Store statistics and reports"
        icon={BarChart3}
        actions={
          <Button variant="outline" onClick={() => refetch()} className="rounded-xl w-10 h-10 p-0 flex items-center justify-center border-gray-200 hover:bg-gray-50 text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          isHighlight={true}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(stats.averageOrderValue)}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card noPadding>
          <div className="content-header">
            <h3 className="content-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Revenue (Last 14 Days)
            </h3>
          </div>
          <div className="px-6 pb-4">
            {dailyRevenue.every(d => d.revenue === 0) ? (
              <div className="h-56 flex flex-col items-center justify-center text-gray-400">
                <TrendingUp size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No revenue data yet</p>
              </div>
            ) : (
              <div className="h-56 flex items-end gap-1 pt-4">
                {dailyRevenue.map((day, index) => {
                  const pct = Math.max((day.revenue / getMaxRevenue()) * 100, day.revenue > 0 ? 4 : 0);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      {day.revenue > 0 && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {formatCurrency(day.revenue)}
                        </div>
                      )}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: index * 0.04, duration: 0.4 }}
                        className={`w-full rounded-t-sm ${day.revenue > 0 ? "bg-primary hover:bg-primary/80" : "bg-gray-100"} transition-colors cursor-pointer`}
                        style={{ minHeight: day.revenue > 0 ? "4px" : "2px" }}
                      />
                      <span className="text-[9px] text-gray-400 rotate-45 origin-left mt-1 whitespace-nowrap">
                        {formatDate(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Orders Chart */}
        <Card noPadding>
          <div className="content-header">
            <h3 className="content-title flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Orders (Last 14 Days)
            </h3>
          </div>
          <div className="px-6 pb-4">
            {dailyOrders.every(d => d.count === 0) ? (
              <div className="h-56 flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="h-56 flex items-end gap-1 pt-4">
                {dailyOrders.map((day, index) => {
                  const pct = Math.max((day.count / getMaxOrders()) * 100, day.count > 0 ? 4 : 0);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip */}
                      {day.count > 0 && (
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {day.count} order{day.count !== 1 ? "s" : ""}
                        </div>
                      )}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: index * 0.04, duration: 0.4 }}
                        className={`w-full rounded-t-sm ${day.count > 0 ? "bg-primary hover:bg-primary/80" : "bg-gray-100"} transition-colors cursor-pointer`}
                        style={{ minHeight: day.count > 0 ? "4px" : "2px" }}
                      />
                      <span className="text-[9px] text-gray-400 rotate-45 origin-left mt-1 whitespace-nowrap">
                        {formatDate(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card noPadding>
          <div className="content-header">
            <h3 className="content-title flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Top Products
            </h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3 p-6">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Governments */}
        <Card noPadding>
          <div className="content-header">
            <h3 className="content-title flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Top Governments
            </h3>
          </div>
          {topGovernments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3 p-6">
              {topGovernments.map((gov, index) => (
                <div key={gov.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{gov.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {gov.orders} orders
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card noPadding>
          <div className="content-header">
            <h3 className="content-title flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No recent orders</p>
          ) : (
            <div className="space-y-0">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500 font-mono">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
