'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Tag,
  BarChart3,
  Settings,
  ChevronDown,
  FolderTree,
  Package,
  Home,
  Heart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clearAuth, getAccessToken } from "@/services/admin/auth";

const mainMenuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/admin" },
  { icon: ShoppingBag, label: "الطلبات", path: "/admin/orders" },
  { icon: Package, label: "المنتجات", path: "/admin/products" },
  { icon: FolderTree, label: "الفئات", path: "/admin/categories" },
  { icon: BarChart3, label: "التحليلات", path: "/admin/analytics" },
];

const settingsMenuItems = [
  { icon: Home, label: "الصفحة الرئيسية", path: "/admin/homepage" },
  { icon: Heart, label: "Customer Love", path: "/admin/customer-love" },
  { icon: Tag, label: "العروض", path: "/admin/promotions" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auto-open settings if current path is in settings menu
  useEffect(() => {
    const isSettingsPath = settingsMenuItems.some((item) => item.path === pathname);
    if (isSettingsPath) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = getAccessToken();
    try {
      if (token) {
        // Call logout API if needed
        clearAuth();
        router.push("/admin/login");
      } else {
        clearAuth();
        router.push("/admin/login");
      }
    } catch {
      clearAuth();
      router.push("/admin/login");
    }
  };

  return (
    <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-[180px] flex-shrink-0">
      <nav className="space-y-2">
        {/* Main Menu Items */}
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.path || pathname.endsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-white text-[hsl(var(--luxury-charcoal))] font-semibold shadow-sm border border-gray-100" 
                  : "text-gray-500 hover:bg-white/60 hover:text-[hsl(var(--luxury-charcoal))]"
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-[hsl(var(--luxury-charcoal))] text-white" 
                  : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-[hsl(var(--luxury-charcoal))]"
              }`}>
                <item.icon size={18} />
              </div>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* Settings Section */}
        <div className="pt-2">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all text-gray-500 hover:bg-white/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gray-100">
                <Settings size={18} />
              </div>
              <span className="text-sm font-medium">إعدادات الموقع</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pr-4 pt-2 space-y-1">
                  {settingsMenuItems.map((item) => {
                    const isActive = pathname === item.path || pathname.endsWith(item.path);

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={onNavigate}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isActive ? "bg-[#f3f4f6] text-[#6b7280]" : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon size={16} className={isActive ? "text-[#6b7280]" : ""} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
      >
        <div className="p-2 rounded-xl bg-gray-100">
          <LogOut size={18} />
        </div>
        <span className="text-sm font-medium">تسجيل الخروج</span>
      </button>
    </motion.aside>
  );
};

export default Sidebar;