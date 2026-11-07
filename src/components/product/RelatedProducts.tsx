"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/product/ProductCard";
import { getProductsPage, getMainImage, type ProductApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/price";

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
    price: formatPrice(product.price, isAr ? 'ar' : 'en'),
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
      <section className="pt-section">
        <h2 className="ds-title-md mb-6 text-center text-ink">
          {t("title")}
        </h2>
        {/* Product row skeleton: 2 up on phone, 4 up on desktop */}
        <div className="grid grid-cols-2 gap-tile lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-product bg-beige"></div>
              <div className="flex flex-col items-center gap-2 px-4 pt-2 pb-4">
                <div className="h-2.5 w-2/3 bg-gray-100"></div>
                <div className="h-2.5 w-1/3 bg-gray-100"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="pt-section">
      <h2 className="ds-title-md mb-6 text-center text-ink">
        {t("title")}
      </h2>

      {/* Product row: 2 up on phone, 4 up on desktop, 2px gutters */}
      <div className="grid grid-cols-2 gap-tile lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            index={index}
            product={mapProduct(product, index)}
            hideViewDetails
          />
        ))}
      </div>
    </section>
  );
}
