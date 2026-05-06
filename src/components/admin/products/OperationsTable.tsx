import { motion } from "framer-motion";
import { Package, TrendingUp, Eye, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Card, FilterTabs, IconButton } from "@/components/admin/common";

interface Operation {
  id: number;
  type: "inbound" | "outbound";
  product: string;
  batchNumber: string;
  client: string;
  quantity: number;
  location: string;
  date: string;
  time: string;
}

interface OperationsTableProps {
  operations: Operation[];
  filter: string;
  onFilterChange: (filter: string) => void;
  filterOptions: { key: string; label: string }[];
}

const OperationsTable = ({ operations, filter, onFilterChange, filterOptions }: OperationsTableProps) => {
  return (
    <Card delay={0.3} noPadding className="overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center">
              <TrendingUp size={18} className="lg:hidden text-white" />
              <TrendingUp size={20} className="hidden lg:block text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm lg:text-base">Recent Operations</h3>
              <p className="text-xs text-gray-400">Inbound & Outbound</p>
            </div>
          </div>
          <FilterTabs options={filterOptions} activeKey={filter} onChange={onFilterChange} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-4 px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 text-xs lg:text-sm font-medium text-gray-500">
            <span>Type</span>
            <span>Product</span>
            <span>BATCH NUMBER</span>
            <span>Customer</span>
            <span>Quantity</span>
            <span>Location</span>
            <span>Time</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {operations.map((operation, index) => (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="grid grid-cols-8 gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center hover:bg-gray-50 transition-colors"
              >
                <span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                      operation.type === "inbound" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {operation.type === "inbound" ? (
                      <>
                        <ArrowDownCircle size={12} /> In
                      </>
                    ) : (
                      <>
                        <ArrowUpCircle size={12} /> Out
                      </>
                    )}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center ${
                      operation.type === "inbound" ? "bg-green-100" : "bg-orange-100"
                    }`}
                  >
                    <Package size={12} className={`lg:hidden ${operation.type === "inbound" ? "text-green-500" : "text-orange-500"}`} />
                    <Package size={14} className={`hidden lg:block ${operation.type === "inbound" ? "text-green-500" : "text-orange-500"}`} />
                  </div>
                  <span className="font-medium text-gray-800 text-xs lg:text-sm">{operation.product}</span>
                </div>
                <span className="text-gray-600 text-xs lg:text-sm">{operation.batchNumber}</span>
                <span className="text-gray-600 text-xs lg:text-sm">{operation.client}</span>
                <span className="font-bold text-gray-800 text-xs lg:text-sm">{operation.quantity}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">{operation.location}</span>
                <div className="text-xs lg:text-sm">
                  <p className="text-gray-800">{operation.time}</p>
                  <p className="text-gray-400 text-xs">{operation.date}</p>
                </div>
                <IconButton icon={Eye} size="sm" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OperationsTable;
