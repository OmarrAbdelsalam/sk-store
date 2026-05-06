import { useTranslations } from "next-intl";

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
    <div className="flex-1 min-w-0 space-y-1.5">
      {/* Product name */}
      <h3 className="text-sm sm:text-base font-medium text-foreground leading-tight line-clamp-2">
        {name}
      </h3>
      
      {/* Unit price */}
      <p className="text-sm sm:text-base font-medium text-foreground">{price}</p>

      {/* Specs */}
      <div className="flex flex-wrap justify-start gap-2">
        {color && (
          <span className="text-xs text-muted-foreground">
            {color}
          </span>
        )}
        {color && size && (
          <span className="text-xs text-muted-foreground">·</span>
        )}
        {size && (
          <span className="text-xs text-muted-foreground">
            {size}
          </span>
        )}
      </div>

      {/* Add-ons */}
      {addOns?.length ? (
        <div className="pt-1.5 border-t border-border/50">
          <div className="flex items-center justify-start gap-1 text-[11px] tracking-wider uppercase text-muted-foreground mb-1">
            <span>{t("addons")}:</span>
          </div>
          <div className="flex flex-wrap justify-start gap-1">
            {addOns.map((addon, i) => (
              <span 
                key={i} 
                className="px-1.5 py-0.5 border border-border text-xs"
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
