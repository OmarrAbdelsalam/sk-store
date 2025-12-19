"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prefetchProduct } from "@/hooks/useProduct";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";

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
  variant?: "grid" | "related";
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  variant = "grid",
}) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ProductCard");
  const { startNavigation } = useNavigationLoading();
  
  const productUrl = `/${locale}/${product.id}`;

  const handleProductClick = React.useCallback(() => {
    setIsNavigating(true);
    startNavigation();
    router.push(productUrl);
  }, [productUrl, router, startNavigation]);

  const handleButtonClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setIsNavigating(true);
      startNavigation();
      router.push(productUrl);
    },
    [productUrl, router, startNavigation]
  );

  if (variant === "related") {
    const [isRelatedNavigating, setIsRelatedNavigating] = React.useState(false);
    
    const handleRelatedClick = React.useCallback(() => {
      setIsRelatedNavigating(true);
      startNavigation();
    }, [startNavigation]);

    return (
      <Link href={productUrl} prefetch={true} onClick={handleRelatedClick}>
        <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 ${
          isRelatedNavigating ? 'opacity-75 scale-[0.98]' : ''
        }`}>
          <CardContent className="p-4">
            <div className="aspect-square bg-luxury-cream rounded-lg overflow-hidden mb-4 relative">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={index < 3}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2 text-start">
                {product.raw?.beforePrice && (
                  <p className="text-xs text-red-500 line-through font-medium">
                    {product.raw.beforePrice} {locale === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                )}
                <p className="font-semibold text-primary text-sm">
                  {product.price}
                </p>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={handleButtonClick}
              >
                {t("viewDetails")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const [selectedColorId, setSelectedColorId] = React.useState<number | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showStockBadge, setShowStockBadge] = React.useState(true);
  const [isNavigating, setIsNavigating] = React.useState(false);

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
    e.stopPropagation();
    setSelectedColorId(colorId);
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    // Prefetch product data on hover
    prefetchProduct(product.id);
  }, [product.id]);

  // Toggle between stock badge and description every 3 seconds
  React.useEffect(() => {
    if (totalStock > 0 && totalStock <= 10) {
      const interval = setInterval(() => {
        setShowStockBadge(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [totalStock]);

  return (
    <div
      className={`group cursor-pointer animate-slide-up flex flex-col h-full transition-all duration-300 ${
        isNavigating ? 'opacity-75 scale-[0.98]' : ''
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
        {/* Product Image */}
        <div className="relative overflow-hidden bg-luxury-cream rounded-lg mb-4 aspect-[3/4]">
          <Image
            key={displayImage}
            src={displayImage}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
            priority={index < 3}
          />
          <div className={`absolute inset-0 transition-colors duration-700 ${
            isNavigating 
              ? 'bg-black/20 navigation-shimmer' 
              : 'bg-black/0 group-hover:bg-black/10'
          }`} />
          
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
            <h3 className="font-medium text-sm md:text-base group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 text-start">
              {product.raw?.beforePrice && (
                <p className="text-xs md:text-sm text-red-500 line-through font-medium">
                  {product.raw.beforePrice} {locale === 'ar' ? 'جنيه' : 'EGP'}
                </p>
              )}
              <p className="font-semibold text-sm md:text-base">
                {product.price}
              </p>
            </div>
          </div>

          <div className="relative">
            {totalStock > 0 && totalStock <= 10 ? (
              <AnimatePresence mode="wait">
                {showStockBadge ? (
                  <motion.p
                    key="stock-badge"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-red-600 text-xs md:text-sm font-medium"
                  >
                    {locale === 'ar' 
                      ? `${totalStock === 1 ? 'قطعة واحدة متبقية!' : `${totalStock} قطع متبقية!`}`
                      : `Only ${totalStock} piece${totalStock === 1 ? '' : 's'} left!`
                    }
                  </motion.p>
                ) : (
                  <motion.p
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2"
                  >
                    {product.description}
                  </motion.p>
                )}
              </AnimatePresence>
            ) : (
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {Array.isArray(product.availableColors) &&
            product.availableColors.length > 0 && (
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

        <Button
          variant="outline"
          size="sm"
          className="w-full transition-all duration-300 py-2 px-3 text-xs md:py-3 md:px-4 md:text-sm mt-3"
          onClick={handleButtonClick}
          disabled={isNavigating}
        >
          {isNavigating ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full smooth-spinner" />
              <span>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : (
            t("viewDetails")
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
