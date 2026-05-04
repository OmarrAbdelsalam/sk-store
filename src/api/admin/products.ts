// Mock Admin Products API for frontend-only store
import { getMockProducts, getMockProductById, type MockProduct } from "@/constants/mockData";

export interface Product {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  base_price: number;
  category_id: string;
  category_name_ar?: string;
  category_name_en?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  main_image_url?: string;
  variant_count?: number;
  material_en?: string;
  material_ar?: string;
  size_chart_url?: string;
  images?: Array<{ id: string; file_path: string; is_main: boolean }>;
}

export interface ProductFormData {
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  base_price: number;
  category_id: string;
  is_active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Map mock product to admin format
const mapProduct = (p: MockProduct): Product => ({
  id: p.id,
  name_en: p.nameEn,
  name_ar: p.nameAr,
  description_en: p.descriptionEn,
  description_ar: p.descriptionAr,
  base_price: p.price,
  category_id: p.categoryId,
  is_active: p.isActive,
  created_at: p.createdAt,
  main_image_url: p.mainImage,
  images: p.images.map((img, index) => ({
    id: `${p.id}-img-${index}`,
    file_path: img,
    is_main: index === 0,
  })),
});

// Get all products (mock)
export const getProducts = async (
  page = 1, 
  pageSize = 50, 
  categoryId?: string
): Promise<PaginatedResponse<Product>> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const mockProducts = getMockProducts(categoryId);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = mockProducts.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: paginatedProducts.map(mapProduct),
    pagination: {
      page,
      pageSize,
      total: mockProducts.length,
      totalPages: Math.ceil(mockProducts.length / pageSize),
    },
  };
};

// Get product by ID (mock)
export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const product = getMockProductById(id);
  if (!product) {
    return { success: false, message: 'Product not found' };
  }
  
  return {
    success: true,
    data: mapProduct(product),
  };
};

// Create product (mock)
export const createProduct = async (data: ProductFormData): Promise<ApiResponse<Product>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock creation - just return success
  return {
    success: true,
    data: {
      id: `mock-${Date.now()}`,
      ...data,
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
    } as Product,
  };
};

// Update product (mock)
export const updateProduct = async (id: string, data: ProductFormData): Promise<ApiResponse<Product>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      id,
      ...data,
      is_active: data.is_active !== false,
      updated_at: new Date().toISOString(),
    } as Product,
  };
};

// Delete product (mock)
export const deleteProduct = async (id: string): Promise<ApiResponse<null>> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    data: null,
  };
};

// Upload image - Uses Supabase Storage
import { uploadFile } from '@/api/admin/upload';

export const uploadImage = async (file: File): Promise<ApiResponse<{ url: string; filename: string }>> => {
  try {
    const result = await uploadFile(file, 'products');
    
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          url: result.data.url,
          filename: result.data.fileName,
        },
      };
    } else {
      return { success: false, message: result.error };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};