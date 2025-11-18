import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface CartButtonProps {
  isMobile?: boolean;
  className?: string;
}

export const CartButton = ({ isMobile = false, className = "" }: CartButtonProps) => {
  // Safely get cart items count
  let cartItemsCount = 0;
  try {
    const { getTotalItems } = useCart();
    cartItemsCount = getTotalItems();
  } catch (error) {
    console.error('Cart context not available:', error);
  }

  return (
    <Link href="/cart" className={className}>
      <Button variant="ghost" size="sm" className="relative">
        <ShoppingBag className="h-5 w-5" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {cartItemsCount}
          </span>
        )}
      </Button>
    </Link>
  );
};