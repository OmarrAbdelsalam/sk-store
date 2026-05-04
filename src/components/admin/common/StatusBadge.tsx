import { CheckCircle, Clock, AlertCircle, LucideIcon } from "lucide-react";

type StatusType = "success" | "warning" | "error" | "info" | "active" | "expired" | "in_stock" | "low_stock" | "out_of_stock" | "paid" | "pending" | "overdue" | "inbound" | "outbound";

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  icon?: LucideIcon;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  success: { bg: "bg-green-100", text: "text-green-600", label: "ناجح" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-600", label: "تحذير" },
  error: { bg: "bg-red-100", text: "text-red-600", label: "خطأ" },
  info: { bg: "bg-blue-100", text: "text-blue-600", label: "معلومات" },
  active: { bg: "bg-green-100", text: "text-green-600", label: "نشط" },
  expired: { bg: "bg-red-100", text: "text-red-600", label: "منتهي" },
  in_stock: { bg: "bg-green-100", text: "text-green-600", label: "متوفر" },
  low_stock: { bg: "bg-yellow-100", text: "text-yellow-600", label: "منخفض" },
  out_of_stock: { bg: "bg-red-100", text: "text-red-600", label: "نفذ" },
  paid: { bg: "bg-green-100", text: "text-green-600", label: "مدفوعة", icon: CheckCircle },
  pending: { bg: "bg-yellow-100", text: "text-yellow-600", label: "قيد الانتظار", icon: Clock },
  overdue: { bg: "bg-red-100", text: "text-red-600", label: "متأخرة", icon: AlertCircle },
  inbound: { bg: "bg-green-100", text: "text-green-600", label: "إدخال" },
  outbound: { bg: "bg-orange-100", text: "text-orange-600", label: "إخراج" },
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
