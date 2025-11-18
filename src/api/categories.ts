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

let _categoriesCache: { [locale: string]: CategoryOption[] } = {};
export async function getCategories(locale = "ar"): Promise<CategoryOption[]> {
  if (_categoriesCache[locale]) return _categoriesCache[locale];
  _categoriesCache[locale] = await fetchCategories(1, 50, locale);
  return _categoriesCache[locale];
}
