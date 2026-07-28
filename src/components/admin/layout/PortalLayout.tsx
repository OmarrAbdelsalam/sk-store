"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "./Sidebar";
import Header from "./Header";

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout = ({ children }: PortalLayoutProps) => {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('rm-admin-theme');
    return () => {
      document.body.classList.remove('rm-admin-theme');
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="app-container rm-admin-scope" dir="ltr">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <div className="view-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
