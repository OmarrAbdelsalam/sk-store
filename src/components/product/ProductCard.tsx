"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { prefetchProduct } from "@/hooks/useProduct";
import DropboxImage from "@/components/DropboxImage";
import * as React from "react";

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

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col group cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 4) * 0.05}s` }}
    >
      <div 
        className="relative aspect-[4/5] bg-[#f5f5f5] mb-3 overflow-hidden rounded-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        {/* Primary Image */}
        <DropboxImage
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className={`object-cover object-center transition-opacity duration-[400ms] ease-in-out ${secondaryImage ? 'group-hover:opacity-0' : ''}`}
          priority={index < 2}
          showLoader={false}
        />
        
        {/* Secondary Image (Hover) */}
        {secondaryImage && (
          <DropboxImage
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-in-out absolute inset-0"
            showLoader={false}
            priority={index < 2} // Also prioritize if primary is prioritized
          />
        )}
        
        {/* Wishlist Button */}

        {/* New Badge - positioned at bottom left/right of image */}
        {showNewBadge && (
          <div className={`absolute bottom-4 ${locale === 'ar' ? 'right-4' : 'left-4'} bg-black text-white text-xs font-bold px-3 py-1 tracking-[0.2em] uppercase z-10 shadow-lg rounded-full`}>
            {locale === 'ar' ? 'جديد' : 'New'}
          </div>
        )}




      </div>

      {/* Product Details */}
      <div className="text-center space-y-1">
        <h3 className="font-sans font-medium text-sm text-gray-900 truncate px-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-center gap-2">
           {product.raw?.beforePrice && (
              <p className="text-xs text-gray-500 line-through">
                {product.raw.beforePrice} {locale === 'ar' ? 'ج.م' : 'EGP'}
              </p>
           )}
           <p className="text-sm font-bold text-gray-900">
             {product.price}
           </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
