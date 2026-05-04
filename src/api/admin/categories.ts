// Mock Admin Categories API for frontend-only store
import { getMockCategories, getMockCategoryById, type MockCategory } from "@/constants/mockData";

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name_en: string;
  name_ar: string;
  image_url?: string;
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

// Map mock category to admin format
const mapCategory = (c: MockCategory): Category => ({
  id: c.id,
  name_en: c.nameEn,
  name_ar: c.nameAr,
  image_url: c.imageUrl,
  is_active: c.isActive,
});

// Get all categories (mock)
export const getCategories = async (page = 1, pageSize = 50): Promise<PaginatedResponse<Category>> => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const mockCategories = getMockCategories();
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = mockCategories.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: paginatedCategories.map(mapCategory),
    pagination: {
      page,
      pageSize,
      total: mockCategories.length,
      totalPages: Math.ceil(mockCategories.length / pageSize),
    },
  };
};

// Get category by ID (mock)
export const getCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const category = getMockCategoryById(id);
  if (!category) {
    return { success: false, message: 'Category not found' };
  }
  
  return {
    success: true,
    data: mapCategory(category),
  };
};

// Create category (mock)
export const createCategory = async (data: CategoryFormData): Promise<ApiResponse<Category>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      id: `mock-${Date.now()}`,
      ...data,
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
    } as Category,
  };
};

// Update category (mock)
export const updateCategory = async (id: string, data: CategoryFormData): Promise<ApiResponse<Category>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: {
      id,
      ...data,
      is_active: data.is_active !== false,
      updated_at: new Date().toISOString(),
    } as Category,
  };
};

// Delete category (mock)
export const deleteCategory = async (id: string): Promise<ApiResponse<null>> => {
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
    const result = await uploadFile(file, 'categories');
    
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