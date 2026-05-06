import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
}

const PageHeader = ({ icon: Icon, title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="border-b border-[var(--border-color)] pb-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center border border-[var(--border-color)] text-[var(--text-secondary)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-light tracking-wider uppercase text-[var(--text-primary)]">{title}</h1>
            <p className="text-xs tracking-wider text-[var(--text-secondary)] mt-1">{subtitle}</p>
          </div>
        </div>
        
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
