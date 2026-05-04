import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
}

function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  return (
    <>
      <div
        className="grid gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => (
          <span key={col.key}>{col.header}</span>
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {data.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            className="grid gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((col) => (
              <div key={col.key}>{col.render(item, index)}</div>
            ))}
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default DataTable;
