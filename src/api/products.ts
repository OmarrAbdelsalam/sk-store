// /src/api/products.ts
const API_BASE = "https://scrubstore.runasp.net";

export type ProductApi = {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  hasSizes: boolean;
  oneSizeAmount: number | null;
  genderType: string | null;
  sizeChartImageUrl: string | null;
  tags: string[] | null;
  colors: Array<{
    id: number;
    colorNameAr: string | null;
    colorNameEn: string | null;
    hexa: string | null;
  }>;
  categories: Array<{
    id: string;           // GUID
    arabicName: string;
    englishName: string;
  }>;
  photos: Array<{
    id: number;
    imageUrl: string;
    colorId: number | null;
    isMain: boolean;
  }>;
  variants: Array<{
    id: number;
    colorId: number | null;
    colorNameAr: string | null;
    colorNameEn: string | null;
    sizeId: number | null;
    name: string | null;
    quantity: number | null;
  }>;
  relatedProducts: Array<{
    id: number;
    nameEn: string;
    nameAr: string;
  }>;
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

/** يجلب المنتجات من API مع تحديد الصفحة والحجم */
export async function fetchProducts(pageNumber = 1, pageSize = 50): Promise<Paged<ProductApi>> {
  const url = `${API_BASE}/api/Product?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const res = await fetch(url, { headers: { accept: "*/*" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load products: ${res.status}`);
  const json: ApiResponse<Paged<ProductApi>> = await res.json();
  if (!json?.succeeded || !json?.data?.items) throw new Error("Invalid products response");
  return json.data;
}

/** أداة مساعدة لاستخراج صورة أساسية */
export const getMainImage = (p: ProductApi): string | null => {
  const main = p.photos?.find(ph => ph.isMain) || p.photos?.[0];
  return main?.imageUrl || null;
};

/** أداة مساعدة للتأكد من انتماء المنتج لفئة معيّنة */
export const matchesCategoryId = (p: ProductApi, categoryId: string): boolean =>
  Array.isArray(p.categories) && p.categories.some(c => String(c.id) === String(categoryId));
