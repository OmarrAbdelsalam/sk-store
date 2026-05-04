// Navigation categories helper - uses Supabase via categoryService
import { getCategories } from "@/api/categories";

export type CategoryOption = {
  key: string;
  label: string;
  arabicName: string;
  englishName: string;
};

export async function fetchCategories(
  pageNumber = 1,
  pageSize = 50
): Promise<CategoryOption[]> {
  try {
    const categories = await getCategories();
    return categories.map(c => ({
      key: c.key,
      label: c.label,
      arabicName: c.arabicName,
      englishName: c.englishName,
    }));
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [];
  }
}

let _categoriesCache: CategoryOption[] | null = null;
export async function getCategoriesNav(): Promise<CategoryOption[]> {
  if (_categoriesCache) return _categoriesCache;
  _categoriesCache = await fetchCategories();
  return _categoriesCache;
}
