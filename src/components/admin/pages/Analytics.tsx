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

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  });
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [dailyOrders, setDailyOrders] = useState<{ date: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ id: string; name: string; sold: number; revenue: number }[]>([]);
  const [topGovernments, setTopGovernments] = useState<{ name: string; orders: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
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

      setStats(dashboardStats);
      setDailyRevenue(revenue);
      setDailyOrders(orders);
      setTopProducts(products);
      setTopGovernments(governments);
      setRecentOrders(recent);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

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
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: { value: number; isPositive: boolean };
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? "text-green-600" : "text-red-500"}`}>
              {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
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
      <div className="space-y-6">
        <PageHeader
          title="التحليلات"
          subtitle="إحصائيات وتقارير المتجر"
          icon={BarChart3}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="التحليلات"
          subtitle="إحصائيات وتقارير المتجر"
          icon={BarChart3}
        />
        <Button variant="outline" onClick={fetchAnalytics} className="rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="الطلبات المعلقة"
          value={stats.pendingOrders}
          icon={Clock}
          color="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(stats.averageOrderValue)}
          icon={TrendingUp}
          color="bg-gradient-to-br from-purple-500 to-pink-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            الإيرادات (آخر 14 يوم)
          </h3>
          <div className="h-48 flex items-end gap-1">
            {dailyRevenue.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.revenue / getMaxRevenue()) * 100}%` }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg min-h-[4px]"
                  title={`${formatCurrency(day.revenue)}`}
                />
                <span className="text-[10px] text-gray-400 rotate-45 origin-left">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Orders Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            الطلبات (آخر 14 يوم)
          </h3>
          <div className="h-48 flex items-end gap-1">
            {dailyOrders.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.count / getMaxOrders()) * 100}%` }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg min-h-[4px]"
                  title={`${day.count} orders`}
                />
                <span className="text-[10px] text-gray-400 rotate-45 origin-left">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            أكثر المنتجات مبيعاً
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-semibold">
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
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            أكثر المحافظات طلباً
          </h3>
          {topGovernments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {topGovernments.map((gov, index) => (
                <div key={gov.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{gov.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {gov.orders} طلب
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            آخر الطلبات
          </h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">لا توجد طلبات</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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