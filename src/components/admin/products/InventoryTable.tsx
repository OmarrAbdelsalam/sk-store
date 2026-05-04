import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Card, FilterTabs, StatusBadge } from "@/components/admin/common";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

interface InventoryTableProps {
  inventory: InventoryItem[];
  filter: string;
  onFilterChange: (filter: string) => void;
  filterOptions: { key: string; label: string }[];
}

const InventoryTable = ({ inventory, filter, onFilterChange, filterOptions }: InventoryTableProps) => {
  return (
    <Card delay={0.4} noPadding className="overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6b] flex items-center justify-center">
              <Package size={18} className="lg:hidden text-white" />
              <Package size={20} className="hidden lg:block text-white" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm lg:text-base">المخزون الحالي</h3>
          </div>
          <FilterTabs options={filterOptions} activeKey={filter} onChange={onFilterChange} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-6 gap-4 px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 text-xs lg:text-sm font-medium text-gray-500">
            <span>المنتج</span>
            <span>SKU</span>
            <span>الفئة</span>
            <span>الكمية</span>
            <span>الموقع</span>
            <span>الحالة</span>
          </div>

          <div className="divide-y divide-gray-100">
            {inventory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="grid grid-cols-6 gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gray-100 flex items-center justify-center">
                    <Package size={14} className="lg:hidden text-gray-500" />
                    <Package size={18} className="hidden lg:block text-gray-500" />
                  </div>
                  <span className="font-medium text-gray-800 text-xs lg:text-sm">{item.name}</span>
                </div>
                <span className="text-gray-600 text-xs lg:text-sm">{item.sku}</span>
                <span className="text-gray-600 text-xs lg:text-sm">{item.category}</span>
                <span className="font-bold text-gray-800 text-xs lg:text-sm">{item.quantity}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">{item.location}</span>
                <StatusBadge status={item.status} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InventoryTable;
