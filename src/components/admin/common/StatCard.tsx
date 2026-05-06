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
  iconColor = "text-[var(--text-secondary)]",
}: StatCardProps) => {
  return (
    <div className="border border-[var(--border-color)] bg-white p-5 transition-colors hover:border-[var(--border-hover)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={iconColor} />
        <span className="text-[10px] font-medium tracking-widest uppercase text-[var(--text-secondary)]">{label}</span>
      </div>
      <p className="text-2xl font-light tracking-wider text-[var(--text-primary)]">{value}</p>
    </div>
  );
};

export default StatCard;
