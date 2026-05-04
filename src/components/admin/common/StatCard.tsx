import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delay?: number;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  hasBorder?: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  delay = 0,
  iconBgColor = "bg-[hsl(var(--luxury-cream))]",
  iconColor = "text-[hsl(var(--luxury-charcoal))]",
  valueColor = "text-[hsl(var(--luxury-charcoal))]",
  hasBorder = true,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-[20px] lg:rounded-[24px] p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 ${hasBorder ? "border border-[hsl(var(--luxury-cream))]" : ""}`}
    >
      <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl ${iconBgColor} flex items-center justify-center`}>
          <Icon size={16} className={`lg:hidden ${iconColor}`} />
          <Icon size={20} className={`hidden lg:block ${iconColor}`} />
        </div>
        <span className="text-[hsl(var(--luxury-stone))] text-xs lg:text-sm font-medium tracking-wide">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl lg:text-3xl font-bold font-luxury ${valueColor}`}>{value}</p>
    </motion.div>
  );
};

export default StatCard;
