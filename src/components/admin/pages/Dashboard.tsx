"use client";

import { motion } from "framer-motion";
import { TrendingUp, Package, ShoppingCart, DollarSign, Users, Eye, BarChart3 } from "lucide-react";
import { PageHeader, StatCard, Card } from "@/components/admin/common";
import { useEffect, useState } from "react";

interface DashboardData {
  summary: {
    total_revenue: number;
    revenue_growth: number;
    total_orders: number;
    orders_growth: number;
    average_order_value: number;
    conversion_rate: number;
  };
  traffic: {
    total_sessions: number;
    unique_visitors: number;
    avg_pages_per_session: number;
    converted_sessions: number;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const loadMockData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      setData({
        summary: {
          total_revenue: 15000,
          revenue_growth: 12.5,
          total_orders: 45,
          orders_growth: 8.3,
          average_order_value: 333.33,
          conversion_rate: 2.1,
        },
        traffic: {
          total_sessions: 1250,
          unique_visitors: 890,
          avg_pages_per_session: 3.2,
          converted_sessions: 26,
        },
      });
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={BarChart3}
          title="لوحة التحكم"
          subtitle="نظرة عامة على أداء المتجر"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "إجمالي الإيرادات",
      value: `${data?.summary.total_revenue.toLocaleString()} جنيه`,
      icon: DollarSign,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "إجمالي الطلبات",
      value: data?.summary.total_orders.toString() || "0",
      icon: ShoppingCart,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "متوسط قيمة الطلب",
      value: `${data?.summary.average_order_value.toFixed(0)} جنيه`,
      icon: TrendingUp,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "معدل التحويل",
      value: `${data?.summary.conversion_rate}%`,
      icon: Users,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        title="لوحة التحكم"
        subtitle="نظرة عامة على أداء المتجر (بيانات تجريبية)"
      />

      {/* Demo Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">النسخة التجريبية</h3>
            <p className="text-sm text-blue-700">
              هذه بيانات تجريبية. في النسخة الكاملة ستظهر البيانات الحقيقية من قاعدة البيانات.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Traffic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">نظرة عامة على الزيارات</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي الجلسات</span>
                <span className="font-semibold">{data?.traffic.total_sessions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الزوار الفريدون</span>
                <span className="font-semibold">{data?.traffic.unique_visitors.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">متوسط الصفحات لكل جلسة</span>
                <span className="font-semibold">{data?.traffic.avg_pages_per_session}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الجلسات المحولة</span>
                <span className="font-semibold">{data?.traffic.converted_sessions}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">الميزات المتاحة</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">رفع الملفات عبر Dropbox</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">عرض البيانات التجريبية</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">واجهة المستخدم الكاملة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">إدارة المحتوى (تجريبي)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">قاعدة البيانات الحقيقية</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;