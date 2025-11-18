// api/categories.ts
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
  key: string;        // سنستخدم الـ id كـ key
  label: string;      // الاسم العربي للعرض
  arabicName: string;
  englishName: string;
};

/** جلب الأقسام من الـ API مع دعم الـ pagination (افتراضي 1/50) */
export async function fetchCategories(
  pageNumber = 1,
  pageSize = 50
): Promise<CategoryOption[]> {
  const url = `${API_BASE}/api/Category?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const res = await fetch(url, { headers: { accept: "*/*" }, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.status}`);
  }

  const json: ApiResponse<Paged<CategoryItem>> = await res.json();

  if (!json?.succeeded || !json?.data?.items) {
    throw new Error("Invalid categories response");
  }

  // تحويل البيانات لشكل موحّد للاستخدام في الواجهة
  return json.data.items.map((c) => ({
    key: c.id,
    label: c.arabicName || c.englishName || "بدون اسم",
    arabicName: c.arabicName,
    englishName: c.englishName,
  }));
}

/** اختيارياً: كاش بسيط في الذاكرة لتقليل الاستدعاءات */
let _categoriesCache: CategoryOption[] | null = null;
export async function getCategories(): Promise<CategoryOption[]> {
  if (_categoriesCache) return _categoriesCache;
  _categoriesCache = await fetchCategories();
  return _categoriesCache;
}
