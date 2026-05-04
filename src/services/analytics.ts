import { supabase } from "@/lib/supabaseClient";
import { orderService } from "./orders";

export interface AnalyticsData {
  // Revenue metrics
  totalRevenue: number;
  dailyRevenue: { date: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  
  // Order metrics
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  ordersByStatus: { status: string; count: number }[];
  dailyOrders: { date: string; count: number }[];
  
  // Product metrics
  totalProducts: number;
  topSellingProducts: { id: string; name: string; sold: number; revenue: number }[];
  
  // Customer metrics
  uniqueCustomers: number;
  topGovernments: { name: string; orders: number }[];
  
  // Average metrics
  averageOrderValue: number;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export const analyticsService = {
  async getDashboardStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalProducts: number;
    averageOrderValue: number;
  }> {
    try {
      // Get orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("status, total");

      if (ordersError) throw ordersError;

      // Get products count
      const { count: productsCount, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", 1);

      if (productsError) throw productsError;

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts: productsCount || 0,
        averageOrderValue,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        averageOrderValue: 0,
      };
    }
  },

  async getOrdersByStatus(): Promise<{ status: string; count: number }[]> {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("status");

      if (error) throw error;

      const statusCounts: Record<string, number> = {};
      orders?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      console.error("Error fetching orders by status:", error);
      return [];
    }
  },

  async getDailyRevenue(days: number = 30): Promise<{ date: string; revenue: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders, error } = await supabase
        .from("orders")
        .select("created_at, total")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      const dailyRevenue: Record<string, number> = {};
      
      // Initialize all days with 0
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split("T")[0];
        dailyRevenue[dateStr] = 0;
      }

      // Add actual revenue
      orders?.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split("T")[0];
        dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + (order.total || 0);
      });

      return Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue,
      }));
    } catch (error) {
      console.error("Error fetching daily revenue:", error);
      return [];
    }
  },

  async getDailyOrders(days: number = 30): Promise<{ date: string; count: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders, error } = await supabase
        .from("orders")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      const dailyOrders: Record<string, number> = {};
      
      // Initialize all days with 0
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split("T")[0];
        dailyOrders[dateStr] = 0;
      }

      // Count orders per day
      orders?.forEach(order => {
        const dateStr = new Date(order.created_at).toISOString().split("T")[0];
        dailyOrders[dateStr] = (dailyOrders[dateStr] || 0) + 1;
      });

      return Object.entries(dailyOrders).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      console.error("Error fetching daily orders:", error);
      return [];
    }
  },

  async getTopSellingProducts(limit: number = 10): Promise<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }[]> {
    try {
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, total_price");

      if (error) throw error;

      const productStats: Record<string, { name: string; sold: number; revenue: number }> = {};

      orderItems?.forEach(item => {
        if (!item.product_id) return;
        
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            name: item.product_name,
            sold: 0,
            revenue: 0,
          };
        }
        productStats[item.product_id].sold += item.quantity;
        productStats[item.product_id].revenue += item.total_price || 0;
      });

      return Object.entries(productStats)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
      return [];
    }
  },

  async getTopGovernments(limit: number = 10): Promise<{ name: string; orders: number }[]> {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("government");

      if (error) throw error;

      const governmentCounts: Record<string, number> = {};
      
      orders?.forEach(order => {
        if (order.government) {
          governmentCounts[order.government] = (governmentCounts[order.government] || 0) + 1;
        }
      });

      return Object.entries(governmentCounts)
        .map(([name, orders]) => ({ name, orders }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top governments:", error);
      return [];
    }
  },

  async getRecentOrders(limit: number = 5): Promise<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[]> {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return orders?.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
      })) || [];
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      return [];
    }
  },

  async getFullAnalytics(): Promise<AnalyticsData> {
    try {
      const [
        dashboardStats,
        ordersByStatus,
        dailyRevenue,
        dailyOrders,
        topProducts,
        topGovernments,
      ] = await Promise.all([
        this.getDashboardStats(),
        this.getOrdersByStatus(),
        this.getDailyRevenue(30),
        this.getDailyOrders(30),
        this.getTopSellingProducts(10),
        this.getTopGovernments(10),
      ]);

      // Get unique customers
      const { data: customers } = await supabase
        .from("orders")
        .select("phone_number");
      
      const uniquePhones = new Set(customers?.map(c => c.phone_number) || []);

      return {
        totalRevenue: dashboardStats.totalRevenue,
        dailyRevenue,
        monthlyRevenue: [], // Can be calculated from dailyRevenue
        totalOrders: dashboardStats.totalOrders,
        pendingOrders: dashboardStats.pendingOrders,
        confirmedOrders: ordersByStatus.find(s => s.status === "confirmed")?.count || 0,
        shippedOrders: ordersByStatus.find(s => s.status === "shipped")?.count || 0,
        deliveredOrders: ordersByStatus.find(s => s.status === "delivered")?.count || 0,
        cancelledOrders: ordersByStatus.find(s => s.status === "cancelled")?.count || 0,
        ordersByStatus,
        dailyOrders,
        totalProducts: dashboardStats.totalProducts,
        topSellingProducts: topProducts,
        uniqueCustomers: uniquePhones.size,
        topGovernments,
        averageOrderValue: dashboardStats.averageOrderValue,
      };
    } catch (error) {
      console.error("Error fetching full analytics:", error);
      throw error;
    }
  },
};
