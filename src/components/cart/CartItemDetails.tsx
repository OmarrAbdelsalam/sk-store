import { useTranslations } from "next-intl";
import { Ruler, Palette, Sparkles } from "lucide-react";

interface CartItemDetailsProps {
  name: string;
  price: string;
  size?: string;
  color?: string;
  addOns?: string[];
}

export default function CartItemDetails({ name, price, size, color, addOns }: CartItemDetailsProps) {
  const t = useTranslations("CartItem");

  return (
    <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
      {/* اسم المنتج */}
      <h3 className="font-semibold text-sm sm:text-lg text-foreground leading-tight line-clamp-2">
        {name}
      </h3>
      
      {/* سعر الوحدة */}
      <p className="text-base sm:text-lg font-semibold text-foreground">{price}</p>

      {/* المواصفات */}
      <div className="flex flex-wrap justify-start gap-1 sm:gap-2">
        {size && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/80 
            text-secondary-foreground rounded-full text-xs font-medium">
            <Ruler className="w-3 h-3" />
            {size}
          </span>
        )}
        {color && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/80 
            text-secondary-foreground rounded-full text-xs font-medium">
            <Palette className="w-3 h-3" />
            {color}
          </span>
        )}
      </div>

      {/* الإضافات */}
      {addOns?.length ? (
        <div className="pt-1 sm:pt-2 border-t border-border/50">
          <div className="flex items-center justify-start gap-1 text-xs text-muted-foreground mb-1">
            <Sparkles className="w-3 h-3" />
            <span>{t("addons")}:</span>
          </div>
          <div className="flex flex-wrap justify-start gap-1">
            {addOns.map((addon, i) => (
              <span 
                key={i} 
                className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-md"
              >
                {addon}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
