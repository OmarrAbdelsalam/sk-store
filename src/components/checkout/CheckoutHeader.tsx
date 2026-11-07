import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Wordmark from "@/components/Wordmark";

/**
 * Checkout header (Shopify): logo and a bag link back to the cart, nothing
 * else — no promo bar, menu or search to pull the customer away. The two
 * halves line up with the form column and the summary column below.
 */
export default function CheckoutHeader({ cartLabel }: { cartLabel: string }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-[64px] items-center justify-between px-gutter lg:grid lg:h-[84px] lg:grid-cols-2 lg:px-0">
        <div className="lg:flex lg:justify-end">
          <div className="lg:w-full lg:max-w-[600px] lg:px-[38px]">
            <Link href="/" aria-label="SK Bags" className="inline-flex text-ink transition-opacity duration-fast hover:opacity-70">
              <Wordmark className="h-[17px] w-auto lg:h-[20px]" />
            </Link>
          </div>
        </div>
        <div>
          <div className="flex justify-end lg:w-full lg:max-w-[520px] lg:px-[38px]">
            <Link
              href="/cart"
              aria-label={cartLabel}
              title={cartLabel}
              className="-me-2 flex size-10 items-center justify-center text-ink transition-opacity duration-fast hover:opacity-60"
            >
              <ShoppingBag className="size-[22px]" strokeWidth={1.25} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
