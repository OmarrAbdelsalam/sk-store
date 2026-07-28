"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  FolderTree,
  Package,
  Home,
  Tag,
  BarChart3,
  X,
  Palette
} from "lucide-react";
import { clearAuth } from "@/services/admin/auth";
import { useRouter } from "@/i18n/navigation";

import Image from "next/image";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/admin/login");
  };

  const mainNav = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
    { title: "Products", url: "/admin/products", icon: Package },
    { title: "Categories", url: "/admin/categories", icon: FolderTree },
    { title: "Colors", url: "/admin/colors", icon: Palette },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  ];

  const siteSettingsNav = [
    { title: "Storefront Config", url: "/admin/homepage", icon: Home },
    { title: "Promotions", url: "/admin/promotions", icon: Tag },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Mobile close button - hidden */}

      <div className="sidebar-logo">
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src="/SK_Logo.svg"
            alt="SK Bags Logo"
            fill
            className="object-contain"
          />
        </div>
        <span className="sidebar-logo-text">SK Bags</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {mainNav.map((item) => {
          const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url));
          return (
            <Link key={item.title} href={item.url} className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={18} />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Management</div>
        {siteSettingsNav.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url);
          return (
            <Link key={item.title} href={item.url} className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={18} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout-btn">
           <LogOut size={18} />
           <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
