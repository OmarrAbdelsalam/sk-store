// /src/api/categories.ts - Fetches categories from Supabase
import { categoryService, Category } from "@/services/categories";

export type CategoryOption = {
  key: string;
  label: string;
  arabicName: string;
  englishName: string;
  imageUrl?: string;
  productCount?: number;
};

/** Fetch categories from Supabase */
export async function fetchCategories(
  pageNumber = 1,
  pageSize = 50,
  locale = "ar"
): Promise<CategoryOption[]> {
  try {
    const categories = await categoryService.getAll();
    
    // Filter only active categories
    const activeCategories = categories.filter((c: Category) => c.is_active === 1);
    
    return activeCategories.map((c: Category) => ({
      key: c.id,
      label: locale === "ar" 
        ? (c.name_ar || c.name_en || "بدون اسم")
        : (c.name_en || c.name_ar || "No name"),
      arabicName: c.name_ar || "بدون اسم",
      englishName: c.name_en || "No name",
      imageUrl: c.image_url || undefined,
      productCount: 0, // Will be calculated separately if needed
    }));
  } catch (error) {
    console.error('Error fetching categories from Supabase:', error);
    throw error;
  }
}

/** Fetch single category by ID */
export async function fetchCategoryById(id: string): Promise<CategoryOption | null> {
  try {
    const categories = await categoryService.getAll();
    const category = categories.find((c: Category) => c.id === id && c.is_active === 1);
    
    if (!category) return null;
    
    return {
      key: category.id,
      label: category.name_ar || category.name_en,
      arabicName: category.name_ar || "بدون اسم",
      englishName: category.name_en || "No name",
      imageUrl: category.image_url || undefined,
    };
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
}

// Enhanced caching with timestamp
type CacheEntry = {
  data: CategoryOption[];
  timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
let _categoriesCache: { [locale: string]: CacheEntry } = {};

export async function getCategories(locale = "ar"): Promise<CategoryOption[]> {
  const now = Date.now();
  const cached = _categoriesCache[locale];
  
  // Return cached data if it's still fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  // Fetch fresh data from database
  const data = await fetchCategories(1, 50, locale);
  _categoriesCache[locale] = { data, timestamp: now };
  
  return data;
}

// Clear cache manually if needed
export function clearCategoriesCache() {
  _categoriesCache = {};
}
