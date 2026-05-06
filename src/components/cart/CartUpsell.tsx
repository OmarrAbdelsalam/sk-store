"use client";

import { useEffect, useState, useMemo } from "react";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import DropboxImage from "@/components/DropboxImage";
import { Plus } from "lucide-react";

export default function CartUpsell() {
  const locale = useLocale();
  const router = useRouter();
  const { products, isLoading } = useProducts();
  const { items, addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

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

  if (!mounted || isLoading || suggestions.length === 0) return null;

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    // Get default variant
    const raw = product.raw;
    const firstVariant = raw?.variants?.[0];
    const firstColor = raw?.colors?.[0];

    if (!firstVariant) return;

    addToCart({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.priceNum.toString(),
      image: product.image,
      colorId: firstColor?.id || "",
      colorName: firstColor?.colorNameEn || "",
      sizeId: firstVariant.sizeId || "",
      sizeName: firstVariant.name || "",
      availableStock: firstVariant.quantity || 999,
    });

    setAddedIds((prev) => new Set([...prev, String(product.id)]));
  };

  return (
    <div className="mt-8 sm:mt-12">
      {/* Section Header */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-sm sm:text-base font-medium tracking-widest uppercase">
          You Might Also Like
        </h2>
        <div className="h-px w-12 bg-foreground mt-3" />
      </div>

      {/* Scrollable product row */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {suggestions.map((product) => {
          const isAdded = addedIds.has(String(product.id)) || cartProductIds.has(String(product.id));

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-[140px] sm:w-[180px] cursor-pointer group"
              onClick={() => router.push(`/${locale}/product/${product.id}`)}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] bg-[#f5f5f5] mb-3 overflow-hidden">
                <DropboxImage
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="180px"
                  className="object-cover object-center"
                  showLoader={false}
                />

                {/* Quick Add Button - always visible on mobile, hover on desktop */}
                {!isAdded && (
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-foreground text-background flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 hover:bg-foreground/80"
                    aria-label="Add to cart"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}

                {isAdded && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-green-600 text-white text-[10px] tracking-wider uppercase font-medium">
                    Added
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium line-clamp-1">{product.name}</p>
                <div className="flex items-center gap-2">
                  {product.beforePrice && (
                    <span className="text-[11px] text-muted-foreground line-through">
                      {product.beforePrice} EGP
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-semibold">{product.price}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
