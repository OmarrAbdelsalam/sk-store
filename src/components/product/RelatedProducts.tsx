"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/product/ProductCard";
import { getProductsPage, type ProductApi } from "@/lib/api/products";

interface RelatedProductsProps {
  currentProductId: number;
  relatedProducts?: { id: number; nameAr?: string; nameEn?: string }[];
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

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">
          {t("title")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
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

      {/* عرض المنتجات */}
      <div className="relative">
        {/* عرض المنتجات - موحد للديسكتوب والموبايل */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              variant="related"
              product={{
                id: product.id,
                name: isAr ? (product.nameAr || product.nameEn || "") : (product.nameEn || product.nameAr || ""),
                price: `${product.price} ${isAr ? 'جنيه' : 'EGP'}`,
                priceNum: product.price,
                image: product.photos?.[0]?.imageUrl || "/placeholder.png",
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
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}