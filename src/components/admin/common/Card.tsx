import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  noPadding?: boolean;
}

const Card = ({ children, className = "", delay = 0, noPadding = false }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-[20px] lg:rounded-[24px] shadow-lg shadow-gray-200/50 ${noPadding ? "" : "p-4 lg:p-6"} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
