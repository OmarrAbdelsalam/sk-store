interface FilterOption {
  key: string;
  label: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: "default" | "header";
}

const FilterTabs = ({ options, activeKey, onChange, variant = "default" }: FilterTabsProps) => {
  const baseClasses =
    variant === "header" ? "bg-white/20 backdrop-blur" : "bg-gray-100";

  const activeClasses =
    variant === "header"
      ? "bg-white text-[#ff6b4a] shadow"
      : "bg-white shadow text-gray-800";

  const inactiveClasses =
    variant === "header"
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-gray-500 hover:text-gray-700";

  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 ${baseClasses} p-1 rounded-2xl overflow-x-auto scrollbar-hide`}
    >
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            activeKey === option.key ? activeClasses : inactiveClasses
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
