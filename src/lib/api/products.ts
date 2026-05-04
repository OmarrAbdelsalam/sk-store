// Product API utilities for frontend-only store
import { fetchProducts, fetchProductById, filterProducts as filterProductsApi, getMainImage as getMainImageApi, type ProductApi } from "@/api/products";

export type { ProductApi };

// Get products with pagination
export const getProductsPage = async (page = 1, pageSize = 50) => {
  return await fetchProducts(page, pageSize);
};

// Get single product by ID
export const getProductById = async (id: string) => {
  return await fetchProductById(id);
};

// Filter products
export const filterProducts = async (filters: {
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) => {
  return await filterProductsApi(filters);
};

// Get main image helper
export const getMainImage = (p: ProductApi): string | null => {
  return getMainImageApi(p);
};

// Map ProductApi to UI Product format
export const mapApiProductToUI = (apiProduct: ProductApi, locale: 'ar' | 'en') => {
  const name = locale === 'ar' ? apiProduct.nameAr : apiProduct.nameEn;
  const description = locale === 'ar' 
    ? (apiProduct.descriptionAr || apiProduct.descriptionEn || '')
    : (apiProduct.descriptionEn || apiProduct.descriptionAr || '');
  
  const mainImage = apiProduct.photos?.find(p => p.isMain)?.imageUrl || 
                   apiProduct.photos?.[0]?.imageUrl || 
                   '/placeholder-product.jpg';

  return {
    id: parseInt(apiProduct.id),
    name,
    nameAr: apiProduct.nameAr,
    nameEn: apiProduct.nameEn,
    category: apiProduct.categories?.[0]?.arabicName || 'عام',
    price: `${apiProduct.price} ${locale === 'ar' ? 'جنيه' : 'EGP'}`,
    priceNum: apiProduct.price,
    image: mainImage,
    description,
    gender: "unisex",
    availableColors: apiProduct.colors?.map(c => ({
      name: locale === 'ar' ? (c.colorNameAr || c.colorNameEn || '') : (c.colorNameEn || c.colorNameAr || ''),
      hex: c.hexa || '#000000'
    })) || [],
    categoryIds: apiProduct.categories?.map(c => c.id) || [],
    raw: apiProduct,
  };
};