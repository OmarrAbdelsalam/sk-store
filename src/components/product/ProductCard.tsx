"use client";

import Image from "next/image";
import { Link as IntlLink } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { prefetchProduct } from "@/hooks/useProduct";
import * as React from "react";

interface Product {
  id: number;
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
  raw?: {
    beforePrice?: number | null;
    photos?: Array<{
      id: number;
      imageUrl: string;
      colorId: number;
      isMain: boolean;
    }>;
    colors?: Array<{
      id: number;
      colorNameAr?: string;
      colorNameEn?: string;
      hexa?: string;
    }>;
    variants?: Array<{
      id: number;
      quantity: number;
      colorId: number;
      sizeId: number;
      name: string;
    }>;
  };
}

interface ProductCardProps {
  product: Product;
  index?: number;
  hideViewDetails?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  hideViewDetails = false,
}) => {
  const locale = useLocale();
  const t = useTranslations("ProductCard");

  const [isHovered, setIsHovered] = React.useState(false);
  const [showStockBadge, setShowStockBadge] = React.useState(true);
  const [selectedColorId, setSelectedColorId] = React.useState<number | null>(null);

  const photos = product.raw?.photos || [];
  const colors = product.raw?.colors || [];
  const variants = product.raw?.variants || [];

  // Calculate total stock
  const totalStock = React.useMemo(() => {
    return variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
  }, [variants]);

  const availableImages = React.useMemo(() => {
    if (selectedColorId !== null) {
      const colorPhotos = photos.filter(p => p.colorId === selectedColorId);
      if (colorPhotos.length > 0) return colorPhotos.map(p => p.imageUrl);
    }
    if (photos.length > 0) {
      return photos.map(p => p.imageUrl);
    }
    return [product.image];
  }, [selectedColorId, photos, product.image]);

  const displayImage = React.useMemo(() => {
    if (isHovered && availableImages.length > 1) {
      return availableImages[1];
    }
    return availableImages[0] || product.image;
  }, [isHovered, availableImages, product.image]);

  const handleColorClick = React.useCallback((e: React.MouseEvent, colorId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColorId(colorId);
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    prefetchProduct(product.id);
  }, [product.id]);

  // Toggle stock badge - only for low stock items
  React.useEffect(() => {
    if (totalStock > 0 && totalStock <= 10) {
      const interval = setInterval(() => {
        setShowStockBadge(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [totalStock]);

  // Prefetch on mount for first 4 visible products only
  React.useEffect(() => {
    if (index < 4) {
      prefetchProduct(product.id);
    }
  }, [product.id, index]);

  return (
    <IntlLink href={`/${product.id}`} prefetch={index < 8}>
      <div
        className="cursor-pointer flex flex-col h-full transition-all duration-300"
        style={{ animationDelay: `${Math.min(index, 4) * 0.05}s` }}
      >
        {/* Product Image */}
        <div 
          className="group relative overflow-hidden bg-luxury-cream rounded-lg mb-4 aspect-[3/4]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            key={displayImage}
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 2}
            loading={index < 4 ? "eager" : "lazy"}
          />
          
          {/* View Details Button */}
          {!hideViewDetails && (
            <div className="absolute bottom-4 left-4 right-4 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-white text-black font-medium text-sm md:text-base py-3 px-4 rounded-full text-center shadow-lg">
                {t("viewDetails")}
              </div>
            </div>
          )}
          
          {/* Sold Out Badge */}
          {totalStock === 0 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="relative w-0 h-0 border-t-[70px] md:border-t-[80px] border-t-red-600 border-l-[70px] md:border-l-[80px] border-l-transparent shadow-lg">
                <span className={`absolute -top-[60px] md:-top-[68px] text-white font-bold text-[11px] text-center leading-tight rotate-45 w-12 ${locale === 'ar' ? 'right-[0px] md:right-[2px] md:text-[12px]' : 'right-[10px] md:right-[13px] -mr-2 mt-2'}`}>
                  {t("soldOut")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 flex flex-col flex-1">
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-sm md:text-base transition-colors line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 text-start">
                {product.raw?.beforePrice && (
                  <p className="text-xs md:text-sm text-red-700 line-through font-medium">
                    {product.raw.beforePrice} {locale === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                )}
                <p className="font-semibold text-sm md:text-base">
                  {product.price}
                </p>
              </div>
            </div>

            {/* Stock/Description - Simple CSS transition instead of framer-motion */}
            <div className="relative min-h-[2.5rem]">
              {totalStock > 0 && totalStock <= 10 ? (
                <p 
                  className={`text-xs md:text-sm font-medium transition-opacity duration-300 ${
                    showStockBadge ? 'text-red-600' : 'text-muted-foreground line-clamp-2'
                  }`}
                >
                  {showStockBadge 
                    ? (locale === 'ar' 
                        ? `${totalStock === 1 ? 'قطعة واحدة متبقية!' : `${totalStock} قطع متبقية!`}`
                        : `Only ${totalStock} piece${totalStock === 1 ? '' : 's'} left!`)
                    : product.description
                  }
                </p>
              ) : (
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            {/* Color Options */}
            {Array.isArray(product.availableColors) && product.availableColors.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {product.availableColors.map((color, i) => {
                    const colorId = colors[i]?.id;
                    const isSelected = selectedColorId === colorId;
                    return (
                      <div
                        key={`${color.name}-${i}`}
                        onClick={(e) => colorId && handleColorClick(e, colorId)}
                        className={`w-4 h-4 md:w-6 md:h-6 rounded-full border shadow-md relative overflow-hidden cursor-pointer transition-all hover:scale-110 ${
                          isSelected ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-gray-400'
                        }`}
                        title={color.name}
                        aria-label={color.name}
                      >
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ backgroundColor: color.hex }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </IntlLink>
  );
};

export default React.memo(ProductCard);
