"use client";

import { LogOut, Lock, Menu } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { clearAuth } from "@/services/admin/auth";
import { customerData } from "@/constants/admin/mockData";
import NotificationBell from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await clearAuth();
    router.push("/admin/login");
  };

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Mobile burger */}
        <button className="burger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
      </div>
      
      <div className="header-actions">
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Dropdown */}
        <DropdownMenu dir="ltr">
          <DropdownMenuTrigger asChild>
            <div className="user-avatar" style={{ cursor: 'pointer' }}>
              {customerData.name.charAt(0)}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ borderRadius: 0 }}>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium leading-none">{customerData.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {customerData.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/change-password")} className="cursor-pointer py-2">
              <Lock className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
