// /src/api/categories.ts
const API_BASE = "https://scrubstore.runasp.net";

type CategoryItem = {
  id: string;
  arabicName: string;
  englishName: string;
};

type Paged<T> = {
  pageIndex: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: T[];
};

type ApiResponse<T> = {
  succeeded: boolean;
  message: string | null;
  data: T;
};

export type CategoryOption = {
  key: string;       // سنستخدم id كـ key
  label: string;     // الاسم العربي للعرض
  arabicName: string;
  englishName: string;
};

export async function fetchCategories(
  pageNumber = 1,
  pageSize = 50,
  locale = "ar"
): Promise<CategoryOption[]> {
  const url = `${API_BASE}/api/Category?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const res = await fetch(url, { 
    headers: { accept: "*/*" }, 
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.status}`);
  }

  const json: ApiResponse<Paged<CategoryItem>> = await res.json();

  if (!json?.succeeded || !json?.data?.items) {
    throw new Error("Invalid categories response");
  }

  return json.data.items.map((c) => ({
    key: c.id,
    label: locale === "ar" 
      ? (c.arabicName || c.englishName || "بدون اسم")
      : (c.englishName || c.arabicName || "No name"),
    arabicName: c.arabicName,
    englishName: c.englishName,
  }));
}

// Enhanced caching with timestamp
type CacheEntry = {
  data: CategoryOption[];
  timestamp: number;
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
let _categoriesCache: { [locale: string]: CacheEntry } = {};

export async function getCategories(locale = "ar"): Promise<CategoryOption[]> {
  const now = Date.now();
  const cached = _categoriesCache[locale];
  
  // Return cached data if it's still fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  // Fetch fresh data
  const data = await fetchCategories(1, 50, locale);
  _categoriesCache[locale] = { data, timestamp: now };
  
  return data;
}

// Clear cache manually if needed
export function clearCategoriesCache() {
  _categoriesCache = {};
}
