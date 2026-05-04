import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  className?: string;
}

const IconButton = ({
  icon: Icon,
  onClick,
  variant = "default",
  size = "md",
  className = "",
}: IconButtonProps) => {
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? 16 : 16;

  const variantClasses = {
    default: "bg-gray-100 hover:bg-[#ff6b4a] hover:text-white text-gray-400",
    primary: "bg-gradient-to-br from-[#ff6b4a] to-[#ff8a6b] text-white hover:shadow-lg",
    danger: "bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-400",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} rounded-xl flex items-center justify-center transition-all ${variantClasses[variant]} ${className}`}
    >
      <Icon size={iconSize} />
    </button>
  );
};

export default IconButton;
