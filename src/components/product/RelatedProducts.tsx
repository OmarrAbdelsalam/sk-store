"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/product/ProductCard";
import { getProductsPage, getMainImage, type ProductApi } from "@/lib/api/products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface RelatedProductsProps {
  currentProductId: number | string;
  relatedProducts?: { id: number | string; nameAr?: string; nameEn?: string }[];
  categoryId?: string;
}

export default function RelatedProducts({ 
  currentProductId, 
  relatedProducts = [],
  categoryId 
}: RelatedProductsProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("RelatedProducts");
  
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchRelatedProducts = async () => {
      if (!currentProductId || !mounted) return;
      
      try {
        setLoading(true);
        
        const allProductsResponse = await getProductsPage(1, 20);
        if (!mounted) return;
        
        const allProducts = allProductsResponse?.items || [];
        const otherProducts = allProducts.filter(p => p.id !== currentProductId);
        
        // أخذ أول 4 منتجات فقط لتجنب التعقيد
        const finalProducts = otherProducts.slice(0, 4);
        
        if (mounted) {
          setProducts(finalProducts);
        }
        
      } catch (error) {
        if (mounted) {
          console.error('Error fetching related products:', error);
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRelatedProducts();
    
    return () => {
      mounted = false;
    };
  }, [currentProductId]);

  const mapProduct = (product: ProductApi, index: number) => ({
    id: product.id,
    name: isAr ? (product.nameAr || product.nameEn || "") : (product.nameEn || product.nameAr || ""),
    price: `${product.price} ${isAr ? 'جنيه' : 'EGP'}`,
    priceNum: product.price,
    image: getMainImage(product) || "/placeholder.png",
    description: isAr ? (product.descriptionAr || product.descriptionEn || "") : (product.descriptionEn || product.descriptionAr || ""),
    gender: product.genderType?.toLowerCase() === "men" ? "men" : product.genderType?.toLowerCase() === "women" ? "women" : "unisex",
    availableColors: product.colors?.map(c => ({
      name: isAr ? (c.colorNameAr || c.colorNameEn || "") : (c.colorNameEn || c.colorNameAr || ""),
      hex: c.hexa || "#000000"
    })) || [],
    raw: {
      beforePrice: product.beforePrice,
      photos: product.photos,
      colors: product.colors,
      variants: product.variants
    }
  });

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">
          {t("title")}
        </h2>
        {/* Mobile Loading */}
        <div className="flex gap-4 overflow-hidden lg:hidden">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse min-w-[60%]">
              <div className="bg-gray-100 aspect-[4/5] rounded mb-3"></div>
              <div className="bg-gray-100 h-4 rounded mb-2"></div>
              <div className="bg-gray-100 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        {/* Desktop Loading */}
        <div className="hidden lg:grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[4/5] rounded mb-3"></div>
              <div className="bg-gray-100 h-4 rounded mb-2"></div>
              <div className="bg-gray-100 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {t("title")}
        </h2>
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden">
        <Carousel
          opts={{
            align: "start",
            direction: isAr ? "rtl" : "ltr",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {products.map((product, index) => (
              <CarouselItem key={product.id} className="pl-3 basis-[65%]">
                <ProductCard
                  index={index}
                  product={mapProduct(product, index)}
                  hideViewDetails
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            index={index}
            product={mapProduct(product, index)}
            hideViewDetails
          />
        ))}
      </div>
    </div>
  );
}
