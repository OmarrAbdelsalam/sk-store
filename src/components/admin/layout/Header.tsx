'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, User, LogOut, Settings, Menu, Lock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { clearAuth, getAccessToken } from "@/services/admin/auth";
import { customerData, notifications } from "@/constants/admin/mockData";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <header className="flex items-center justify-between lg:mb-8">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white shadow hover:bg-gray-50 transition-colors"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Settings size={20} className="text-gray-500" />
          </button>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <MenuItem icon={User} label="الملف الشخصي" />
              <MenuItem icon={Settings} label="إعدادات الحساب" />
              <MenuItem
                icon={Lock}
                label="تغيير كلمة المرور"
                onClick={() => {
                  setShowSettings(false);
                  router.push("/admin/change-password");
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSettings(false);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff6b4a] rounded-full" />
          </button>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 sm:left-0 right-auto top-12 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">الإشعارات</h3>
              </div>
              {notifications.map((notif) => (
                <NotificationItem key={notif.id} {...notif} />
              ))}
            </motion.div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowSettings(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="hidden sm:block text-sm text-gray-600">{customerData.name}</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6b] flex items-center justify-center shadow-lg">
              <User size={18} className="text-white" />
            </div>
          </button>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-14 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-800">{customerData.name}</p>
                <p className="text-xs text-gray-500">{customerData.email}</p>
              </div>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-500"
                >
                  <LogOut size={18} />
                  <span className="text-sm">{isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuItem = ({ icon: Icon, label, onClick }: { icon: typeof User; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
    <Icon size={18} className="text-gray-400" />
    <span className="text-sm text-gray-700">{label}</span>
  </button>
);

const NotificationItem = ({ title, message, time, read }: { title: string; message: string; time: string; read: boolean }) => (
  <div className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!read ? "bg-blue-50/50" : ""}`}>
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${!read ? "bg-[#ff6b4a]" : "bg-gray-300"}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{message}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  </div>
);

export default Header;