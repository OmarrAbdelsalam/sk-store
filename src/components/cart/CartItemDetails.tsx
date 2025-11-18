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
    <div className="flex-1 space-y-2">
      <div>
        <h3 className="font-medium text-lg">{name}</h3>
        {size && (
          <p className="text-sm text-muted-foreground">
            {t("size")}: {size}
          </p>
        )}
        {color && (
          <p className="text-sm text-muted-foreground">
            {t("color")}: {color}
          </p>
        )}
        {addOns?.length ? (
          <div className="text-sm text-muted-foreground">
            <p>{t("addons")}:</p>
            <ul className="list-disc list-inside ml-2">
              {addOns.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <p className="text-lg font-semibold">{price}</p>
    </div>
  );
}
