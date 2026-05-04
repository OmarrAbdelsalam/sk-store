import { motion } from "framer-motion";
import { LucideIcon, Search, Filter } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const PageHeader = ({ icon: Icon, title, subtitle, actions, showSearch }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] rounded-[24px] lg:rounded-[32px] p-4 sm:p-5 lg:p-6 relative overflow-hidden mb-6"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 relative z-10">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/20 flex items-center justify-center shadow-sm text-white">
            <Icon size={20} className="sm:hidden" />
            <Icon size={24} className="hidden sm:block lg:hidden" />
            <Icon size={28} className="hidden lg:block" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white font-luxury">{title}</h1>
            <p className="text-white/80 text-xs lg:text-sm tracking-wide">{subtitle}</p>
          </div>
        </div>
        
        {showSearch ? (
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white rounded-xl lg:rounded-2xl border border-[hsl(var(--luxury-cream))] flex-1 sm:flex-initial shadow-sm">
              <Search size={16} className="lg:hidden text-gray-400" />
              <Search size={18} className="hidden lg:block text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                className="bg-transparent border-none outline-none text-xs lg:text-sm w-full sm:w-24 lg:w-32 text-gray-600 placeholder:text-gray-300"
              />
            </div>
            <button className="p-2 bg-white rounded-lg lg:rounded-xl border border-[hsl(var(--luxury-cream))] hover:bg-gray-50 transition-colors shadow-sm text-gray-500">
              <Filter size={16} className="lg:hidden" />
              <Filter size={18} className="hidden lg:block" />
            </button>
          </div>
        ) : (
          actions
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
