import type { Color } from "./color";

export interface Size {
  id: number;
  name: string;
  sizeType: "Letter" | "Numeric";
}

export interface Category {
  id: string;
  arabicName: string;
  englishName: string;
}

export interface Photo {
  id: number;
  imageUrl: string;
  colorId: number;
  isMain: boolean;
}

export interface ProductVariant {
  id: number;
  colorId: number;
  colorNameAr: string;
  colorNameEn: string;
  sizeId: number;
  name: string;
  quantity: number;
  color: Color;
  size: {
    id: number;
    sizeNameEn: string;
    sizeNameAr: string;
    sizeType: string;
  };
}

export interface RelatedProduct {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  mainPhotoUrl: string | null;
}

export interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  hasSizes: boolean;
  oneSizeAmount: number | null;
  genderType: "Men" | "Women" | "Unisex";
  sizeChartImageUrl: string;
  tags: string[];
  colors: Color[];
  categories: Category[];
  photos: Photo[];
  productPhotos: Photo[];
  variants: ProductVariant[];
  productVariants: ProductVariant[];
  relatedProducts: RelatedProduct[];
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: T[];
}

export interface ProductFormData {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  hasSizes: boolean;
  oneSizeAmount?: number;
  genderType: "Men" | "Women" | "Unisex";
  sizeChartImage?: File;
  tags: string[];
  colorIds: number[];
  categoryIds: string[];
  relatedProductIds: number[];
}

export interface VariantFormData {
  colorId: number;
  sizeId: number;
  quantity: number;
}

export interface PhotoFormData {
  colorId: number;
  photo: File;
  isMain: boolean;
}
