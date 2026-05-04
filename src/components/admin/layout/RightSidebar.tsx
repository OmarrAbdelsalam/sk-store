'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react";
import { authFetch } from "@/services/admin/auth";
import { API_URLS } from "@/api/admin/config";

interface TopProduct {
  id: string;
  name_ar: string;
  units_sold: number;
  revenue: number;
}

interface QuickStats {
  total_products: number;
  total_categories: number;
  active_promotions: number;
}

const RightSidebar = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data for top products
        const dashResponse = await authFetch(`${API_URLS.backend}/Analytics/dashboard?period=last_30_days`);
        const dashResult = await dashResponse.json();
        
        if (dashResult.success && dashResult.data.top_products) {
          setTopProducts(dashResult.data.top_products.slice(0, 5));
        } else {
          setTopProducts([]);
        }

        // Fetch quick stats
        const [productsRes, categoriesRes, promotionsRes] = await Promise.all([
          authFetch(`${API_URLS.backend}/Product?page=1&pageSize=1`),
          authFetch(`${API_URLS.backend}/Category?page=1&pageSize=1`),
          authFetch(`${API_URLS.backend}/Promotions?page=1&pageSize=1`)
        ]);

        const [products, categories, promotions] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          promotionsRes.json()
        ]);

        setStats({
          total_products: products.total || 0,
          total_categories: categories.total || 0,
          active_promotions: promotions.total || 0
        });
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        // Set fallback data
        setTopProducts([]);
        setStats({
          total_products: 0,
          total_categories: 0,
          active_promotions: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[300px] flex-shrink-0 space-y-6"
      >
        <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-gray-200/50">
          <p className="text-center text-gray-400">جاري التحميل...</p>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-[300px] flex-shrink-0 space-y-6"
    >
      <QuickStatsCard stats={stats} />
      <TopProductsCard products={topProducts} />
    </motion.aside>
  );
};

const QuickStatsCard = ({ stats }: { stats: QuickStats | null }) => (
  <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-gray-200/50">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6b] flex items-center justify-center">
        <TrendingUp size={20} className="text-white" />
      </div>
      <h3 className="font-bold text-gray-800">إحصائيات سريعة</h3>
    </div>

    <div className="space-y-3">
      <StatItem 
        icon={Package} 
        label="المنتجات" 
        value={stats?.total_products || 0}
        color="bg-blue-100 text-blue-500"
      />
      <StatItem 
        icon={ShoppingCart} 
        label="الفئات" 
        value={stats?.total_categories || 0}
        color="bg-green-100 text-green-500"
      />
      <StatItem 
        icon={DollarSign} 
        label="العروض النشطة" 
        value={stats?.active_promotions || 0}
        color="bg-purple-100 text-purple-500"
      />
    </div>
  </div>
);

const StatItem = ({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: typeof Package;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const TopProductsCard = ({ products }: { products: TopProduct[] }) => (
  <div className="bg-white rounded-[24px] p-6 shadow-lg shadow-gray-200/50">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6b] flex items-center justify-center">
        <Package size={20} className="text-white" />
      </div>
      <h3 className="font-bold text-gray-800">الأكثر مبيعاً</h3>
    </div>

    <div className="space-y-3">
      {products.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">لا توجد مبيعات حتى الآن</p>
      ) : (
        products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6b] flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{product.name_ar}</p>
              <p className="text-xs text-gray-400">{product.units_sold} قطعة</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#ff6b4a]">{product.revenue.toFixed(0)}</p>
              <p className="text-xs text-gray-400">جنيه</p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </div>
);

export default RightSidebar;