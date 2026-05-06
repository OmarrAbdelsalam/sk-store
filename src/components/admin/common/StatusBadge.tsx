import { CheckCircle, Clock, AlertCircle, LucideIcon } from "lucide-react";

type StatusType = "success" | "warning" | "error" | "info" | "active" | "expired" | "in_stock" | "low_stock" | "out_of_stock" | "paid" | "pending" | "overdue" | "inbound" | "outbound";

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  icon?: LucideIcon;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  success: { bg: "bg-green-100", text: "text-green-600", label: "Success" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-600", label: "تحذير" },
  error: { bg: "bg-red-100", text: "text-red-600", label: "Error" },
  info: { bg: "bg-blue-100", text: "text-blue-600", label: "Info" },
  active: { bg: "bg-green-100", text: "text-green-600", label: "Active" },
  expired: { bg: "bg-red-100", text: "text-red-600", label: "Expired" },
  in_stock: { bg: "bg-green-100", text: "text-green-600", label: "In Stock" },
  low_stock: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Low Stock" },
  out_of_stock: { bg: "bg-red-100", text: "text-red-600", label: "Out of Stock" },
  paid: { bg: "bg-green-100", text: "text-green-600", label: "Paid", icon: CheckCircle },
  pending: { bg: "bg-yellow-100", text: "text-yellow-600", label: "Pending", icon: Clock },
  overdue: { bg: "bg-red-100", text: "text-red-600", label: "Overdue", icon: AlertCircle },
  inbound: { bg: "bg-green-100", text: "text-green-600", label: "In" },
  outbound: { bg: "bg-orange-100", text: "text-orange-600", label: "Out" },
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  customLabel?: string;
}

const StatusBadge = ({ status, showIcon = false, customLabel }: StatusBadgeProps) => {
  const config = statusConfigs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {showIcon && Icon && <Icon size={12} />}
      {customLabel || config.label}
    </span>
  );
};

export default StatusBadge;
