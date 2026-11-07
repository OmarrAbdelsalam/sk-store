"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

export default function CartUpsell() {
  const locale = useLocale();
  const { products, isLoading } = useProducts();
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get product IDs currently in cart
  const cartProductIds = useMemo(
    () => new Set(items.map((item) => String(item.productId))),
    [items]
  );

  // Get category IDs from cart items to find related products
  const cartCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((item) => {
      const raw = (item as any).raw;
      if (raw?.categories) {
        raw.categories.forEach((c: any) => ids.add(c.id));
      }
    });
    return ids;
  }, [items]);

  // Build suggestion list: same category first, then other products, exclude cart items
  const suggestions = useMemo(() => {
    if (!products.length) return [];

    const notInCart = products.filter((p) => !cartProductIds.has(String(p.id)));

    // Sort: same category products first
    const scored = notInCart.map((p) => {
      const inSameCategory = p.categoryIds?.some((cId) => cartCategoryIds.has(cId));
      return { product: p, score: inSameCategory ? 1 : 0 };
    });

    scored.sort((a, b) => b.score - a.score);

    // Shuffle within each score group for variety
    const sameCategory = scored.filter((s) => s.score === 1).map((s) => s.product);
    const other = scored.filter((s) => s.score === 0).map((s) => s.product);

    // Shuffle helper
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    return [...shuffle(sameCategory), ...shuffle(other)].slice(0, 8);
  }, [products, cartProductIds, cartCategoryIds]);

  // RTL-aware: "next" always moves toward the end of the reading direction.
  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const step = el.clientWidth * 0.9 * (dir === "next" ? 1 : -1) * (rtl ? -1 : 1);
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  if (!mounted || isLoading || suggestions.length === 0) return null;

  const isAr = locale === "ar";

  // Same product card as the shop grid (photo, swatches, sale price, Quick
  // add modal with colour choice) in a horizontal row.
  return (
    <section className="mt-12 border-t border-gray-200 pt-10 sm:mt-16" aria-labelledby="cart-upsell-title">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="cart-upsell-title" className="font-display text-[22px] leading-tight text-ink sm:text-[26px]">
          {isAr ? "ممكن يعجبك كمان" : "You may also like"}
        </h2>
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scroll("prev")}
            className="flex size-10 items-center justify-center border border-gray-300 text-ink transition-colors duration-fast hover:border-ink"
            aria-label={isAr ? "السابق" : "Previous"}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            className="flex size-10 items-center justify-center border border-gray-300 text-ink transition-colors duration-fast hover:border-ink"
            aria-label={isAr ? "التالي" : "Next"}
          >
            <ChevronRight className="size-4 rtl:rotate-180" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <ul
        ref={scrollRef}
        className="scrollbar-hide -mx-gutter flex snap-x snap-mandatory gap-tile overflow-x-auto scroll-px-gutter px-gutter pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {suggestions.map((product, i) => (
          <li key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.5%]">
            <ProductCard product={product} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}
