"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

type RestoredItem = {
  productId: string;
  name: string;
  color: string | null;
  colorId: string | null;
  sizeId: string | null;
  sizeName: string | null;
  quantity: number;
  price: number;
  image: string | null;
};

/**
 * Rebuilds a basket from a reminder email.
 *
 * The cart lives in localStorage, so a customer who filled one on their phone
 * and opened the email on a laptop arrives with nothing. This puts the items
 * back from the snapshot the server kept, and parks the discount code where
 * checkout will pick it up.
 *
 * Renders nothing — it exists for the side effect.
 */
export default function CartRestorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const { addToCart, items } = useCart();

  // Strict mode mounts effects twice in development; without this the basket
  // is restored twice and every quantity doubles.
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    const token = searchParams.get("restore");
    const code = searchParams.get("code");

    if (!token && !code) return;
    done.current = true;

    // The code is handed to checkout rather than applied here: validation needs
    // a phone number and a settled subtotal, and PromoCodeInput already does
    // that properly. Storing it means the customer never types it.
    if (code) {
      try {
        localStorage.setItem("pending_promo_code", code);
      } catch {
        // Private browsing. The code is printed in the email too.
      }
    }

    const cleanUrl = () => router.replace(`/${locale}/cart`, { scroll: false });

    if (!token) {
      if (code) toast.success("Your discount code will be applied at checkout");
      cleanUrl();
      return;
    }

    (async () => {
      try {
        const response = await fetch(`/api/cart/restore?t=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data?.succeeded) {
          toast.error("That link has expired — your cart is still here though");
          cleanUrl();
          return;
        }

        if (data.alreadyOrdered) {
          toast.info("You've already placed this order");
          cleanUrl();
          return;
        }

        // Anything already in this browser's cart wins. Adding a product that
        // is sitting there would silently double its quantity, and someone who
        // came back to buy one bag would be shown two.
        const present = new Set(
          (items || []).map(
            (item) => `${item.productId}::${(item.colorName || "").toLowerCase()}`
          )
        );

        const restored = (data.items as RestoredItem[]).filter(
          (item) => !present.has(`${item.productId}::${(item.color || "").toLowerCase()}`)
        );

        restored.forEach((item) => {
          addToCart(
            {
              productId: item.productId,
              name: item.name,
              // The cart stores prices as strings for the UI; the checkout
              // re-prices everything from the database before charging, so a
              // stale figure here is a display value, never a charged one.
              price: String(item.price),
              image: item.image || "",
              colorName: item.color || undefined,
              colorId: item.colorId || undefined,
              sizeId: item.sizeId || undefined,
              sizeName: item.sizeName || undefined,
            },
            item.quantity
          );
        });

        if (restored.length) {
          toast.success(
            restored.length === 1
              ? "We put your item back in the cart"
              : `We put your ${restored.length} items back in the cart`
          );
        } else if (!data.unavailable) {
          toast.info("Everything from your email is already in your cart");
        }

        // Said out loud rather than passed over in silence: someone who counted
        // three bags in the email and finds two needs to know why.
        if (data.unavailable) {
          toast.warning(
            data.unavailable === 1
              ? "One item is no longer available and couldn't be added"
              : `${data.unavailable} items are no longer available and couldn't be added`
          );
        }
      } catch {
        toast.error("Couldn't restore your cart — please add the items again");
      } finally {
        cleanUrl();
      }
    })();
    // Deliberately runs once: `items` is read as a snapshot at restore time,
    // and listing it here would re-trigger on every cart change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
