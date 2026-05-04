'use client';

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout = ({ children }: PortalLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change or resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[#f9f9f8]" dir="rtl"> {/* Luxury very light stone/cream */}
      
      {/* Texture noise overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none fixed"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Fixed Header on Mobile */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-[#f9f9f8]/80 backdrop-blur-md px-3 py-3 sm:p-4 lg:relative lg:p-0">
        <div className="max-w-[1400px] mx-auto lg:hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
      </div>

      {/* Main Container */}
      <div className="pt-16 lg:pt-6 p-3 sm:p-4 lg:p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <Header onMenuClick={() => setSidebarOpen(true)} />
          </div>

          <div className="flex gap-4 lg:gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.25 }}
                    className="fixed top-0 right-0 h-full w-[240px] bg-[#f0f2f5] z-50 shadow-2xl lg:hidden overflow-y-auto"
                  >
                    {/* Sidebar Header with Logo and Close */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <Link href="/admin" onClick={() => setSidebarOpen(false)}>
                        <div className="h-8 px-4 flex items-center justify-center bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                          <span className="text-white font-bold text-xl tracking-wider">SK</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-4">
                      <Sidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-4 lg:space-y-6">
              {children}
            </div>

            {/* Right Sidebar - Hidden on mobile/tablet */}
            <div className="hidden xl:block">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;