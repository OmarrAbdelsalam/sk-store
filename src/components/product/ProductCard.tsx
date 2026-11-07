"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { prefetchProduct } from "@/hooks/useProduct";
import DropboxImage from "@/components/DropboxImage";
import * as React from "react";
import QuickAddModal from "@/components/product/QuickAddModal";
import { formatPrice } from "@/lib/price";

interface Product {
  id: string | number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  description: string;
  gender: string;
  availableColors: Array<{
    name: string;
    hex: string;
  }>;
  raw?: any;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  hideViewDetails?: boolean;
  showNewBadge?: boolean;
  hideStockBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  hideViewDetails = false,
  showNewBadge = false,
  hideStockBadge = false,
}) => {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("ProductCard");

  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedColorId, setSelectedColorId] = React.useState<number | string | null>(null);

  const photos = product.raw?.photos || [];
  const colors = product.raw?.colors || [];
  const variants = product.raw?.variants || [];

  // Calculate total stock
  const totalStock = React.useMemo(() => {
    return variants.reduce((sum: number, variant: any) => sum + (variant.quantity || 0), 0);
  }, [variants]);

  // Handle navigation
  const handleClick = React.useCallback(() => {
    router.push(`/product/${product.id}`);
  }, [router, locale, product.id]);

  const availableImages = React.useMemo(() => {
    let targetPhotos = photos;
    
    if (selectedColorId !== null) {
      const colorPhotos = photos.filter((p: any) => {
        // Handle both old and new field names
        const cId = p.color_id ?? p.colorId;
        return String(cId) === String(selectedColorId);
      });
      if (colorPhotos.length > 0) {
        targetPhotos = colorPhotos;
      }
    }
    
    if (targetPhotos.length > 0) {
      // Sort so that the main image comes first
      const sortedPhotos = [...targetPhotos].sort((a: any, b: any) => {
        const aIsMain = a.isMain || a.is_main ? 1 : 0;
        const bIsMain = b.isMain || b.is_main ? 1 : 0;
        return bIsMain - aIsMain; // higher score (main) comes first
      });

      return sortedPhotos.map((p: any) => {
        const path = p.file_path ?? p.imageUrl;
        // Return path as-is - DropboxImage will handle it
        return path;
      });
    }
    return [product.image];
  }, [selectedColorId, photos, product.image]);

  const primaryImage = React.useMemo(() => availableImages[0] || product.image, [availableImages, product.image]);
  const secondaryImage = React.useMemo(() => availableImages.length > 1 ? availableImages[1] : null, [availableImages]);

  const handleColorClick = React.useCallback((e: React.MouseEvent, colorId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColorId(typeof colorId === 'string' ? parseInt(colorId) || colorId : colorId);
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    // Only enable hover on non-touch devices
    if (window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
    prefetchProduct(product.id);
  }, [product.id]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleTouchStart = React.useCallback(() => {
    // Reset hover state on touch to prevent stuck hover states
    setIsHovered(false);
  }, []);

  // Stock badge is always visible (no toggle) when stock is low
  const showStock = !hideStockBadge && totalStock > 0 && totalStock <= 10;

  // Reset hover state when component unmounts or when touch events occur
  React.useEffect(() => {
    const handleTouchAnywhere = () => {
      setIsHovered(false);
    };

    // Add touch listener to document to reset hover state
    document.addEventListener('touchstart', handleTouchAnywhere, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchAnywhere);
    };
  }, []);

  // Prefetch on mount for first 4 visible products only
  React.useEffect(() => {
    if (index < 4) {
      prefetchProduct(product.id);
    }
  }, [product.id, index]);

  // ── Quick add (Dead Sea Luxe pattern) ──────────────────────────────────
  // The card's "Quick add" opens QuickAddModal (colour, quantity, add to cart).
  const [quickOpen, setQuickOpen] = React.useState(false);
  const soldOut = variants.length > 0 && totalStock <= 0;
  const openQuickAdd = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickOpen(true);
  }, []);
  const quickAddLabel = soldOut
    ? locale === "ar" ? "نفدت الكمية" : "Sold out"
    : locale === "ar" ? "إضافة سريعة" : "Quick add";

  const before =
    Number(product.raw?.beforePrice ?? (product as any).beforePrice ?? product.raw?.compareAtPrice) || 0;
  const onSale = before > product.priceNum && product.priceNum > 0;

  /*
   * Product card — DESIGN_SYSTEM.md › Product tile (Parfois).
   * Light-gray 3:4 tile, photo fills it (white studio backgrounds blend into
   * the gray), white round "+" at the bottom. Under it, left-aligned: 13px
   * uppercase name, 13px price (sale: old struck + new in red).
   */
  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer flex-col"
      style={{ animationDelay: `${Math.min(index, 4) * 0.05}s` }}
    >
      <div
        className="ds-cutout-frame relative aspect-product overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        <DropboxImage
          src={primaryImage}
          cutout
          cutoutWidth={828}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className={`ds-cutout object-center transition-[opacity,transform] duration-500 ease-brand lg:group-hover:scale-[1.06] ${secondaryImage ? "group-hover:opacity-0" : ""}`}
          priority={index < 2}
          showLoader={false}
        />

        {secondaryImage && (
          <DropboxImage
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="ds-cutout-cover absolute inset-0 object-center opacity-0 transition-opacity duration-image ease-brand group-hover:opacity-100"
            showLoader={false}
            priority={index < 2}
          />
        )}

        {showNewBadge && (
          <span className="absolute start-2 top-2 z-10 bg-white px-2 py-0.5 font-sans text-[12px] font-semibold uppercase leading-[18px] tracking-[0.04em] text-ink">
            {locale === "ar" ? "جديد" : "New"}
          </span>
        )}
        {onSale && (
          <span className="absolute end-2 top-2 z-10 bg-accent-2 px-2 py-0.5 font-sans text-[12px] font-semibold uppercase leading-[18px] tracking-[0.04em] text-white">
            {locale === "ar" ? "خصم" : "Sale"}
          </span>
        )}

        {/* Quick add — desktop: a light floating bar, inset from the tile
            edges, that rises in on hover; fills ink when pointed at. */}
        <button
          type="button"
          onClick={openQuickAdd}
          disabled={soldOut}
          aria-label={`${quickAddLabel}: ${product.name}`}
          className="invisible absolute inset-x-3 bottom-3 z-20 hidden h-10 translate-y-2 items-center justify-center gap-1.5 bg-white/95 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink opacity-0 shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-[opacity,visibility,transform,background-color,color] duration-300 ease-brand hover:bg-ink hover:text-white focus-visible:visible focus-visible:translate-y-0 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-white/95 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        >
          {quickAddLabel}
        </button>
      </div>

      <div className="flex flex-col gap-0.5 px-2.5 pt-2.5">
        <h3 className="truncate font-sans text-[13px] uppercase leading-5 tracking-[0.04em] text-ink">
          {product.name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-2 font-sans text-[13px] leading-5">
          {onSale && (
            <span className="text-ink line-through">
              {formatPrice(before, locale)}
            </span>
          )}
          <span className={onSale ? "text-accent-2" : "text-ink"}>{product.price}</span>
        </div>

        {/* Colour swatches (Parfois): 12px squares, selected one framed in
            ink, first 3 then "+N". Clicking switches the card photo. */}
        {colors.length > 1 && (
          <div className="flex flex-wrap items-center gap-1 pt-1.5" onClick={(e) => e.stopPropagation()}>
            {colors.slice(0, 3).map((c: any, i: number) => {
              const name = (locale === "ar" ? c.colorNameAr || c.colorNameEn : c.colorNameEn || c.colorNameAr) || "";
              const selected = selectedColorId !== null ? String(selectedColorId) === String(c.id) : i === 0;
              return (
                <button
                  key={String(c.id)}
                  type="button"
                  aria-label={name}
                  title={name}
                  aria-pressed={selected}
                  onClick={(e) => handleColorClick(e, c.id)}
                  className={`shrink-0 border p-0.5 transition-colors duration-fast ${selected ? "border-ink" : "border-transparent hover:border-gray-300"}`}
                >
                  <span className="block size-3 border border-gray-200" style={{ backgroundColor: c.hexa || undefined }} />
                </button>
              );
            })}
            {colors.length > 3 && (
              <span className="ps-0.5 font-sans text-[10px] leading-4 text-gray-500">+{colors.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Quick add — phone: always visible under the price */}
      <div className="mt-auto px-2.5 pt-2.5 lg:hidden">
        <button
          type="button"
          onClick={openQuickAdd}
          disabled={soldOut}
          aria-label={`${quickAddLabel}: ${product.name}`}
          className="flex h-9 w-full items-center justify-center gap-1.5 border border-ink/80 bg-transparent font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors duration-fast active:bg-ink active:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-500"
        >
          {quickAddLabel}
        </button>
      </div>

      <QuickAddModal
        open={quickOpen}
        onOpenChange={setQuickOpen}
        product={product}
        initialColorId={selectedColorId}
      />
    </div>
  );
};

export default React.memo(ProductCard);
