export type ProductVariant = {
  id: number;
  colorId: number;
  colorNameAr?: string;
  colorNameEn?: string;
  sizeId: number;
  name: string;          // "S" | "M" | "XL"
  quantity: number;      // stock
};

export type ProductColor = {
  id: number;
  colorNameAr?: string;
  colorNameEn?: string;
  hexa?: string;
};

export type ProductPhoto = {
  id: number;
  imageUrl: string;
  colorId: number;
  isMain: boolean;
};

export type ProductApi = {
  id: number;
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  material?: string;
  price: number;
  beforePrice?: number | null;
  hasSizes: boolean;
  oneSizeAmount?: number | null;
  genderType?: string;
  sizeChartImageUrl?: string;
  averageRating?: number | null;
  tags?: string[];
  colors: ProductColor[];
  categories?: { id: string; arabicName?: string; englishName?: string }[];
  photos: ProductPhoto[];
  variants: ProductVariant[];
  relatedProducts?: { id: number; nameAr?: string; nameEn?: string }[];
  reviews?: ProductReview[];
};

export type ProductReview = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string | null;
  verified?: boolean;
  colorName?: string;
  sizeName?: string;
};

type Envelope<T> = { succeeded: boolean; message: string; data: T };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://scrubstore.runasp.net";

/* =========================
   Helpers
========================= */
export function getMainImage(p: ProductApi): string | null {
  const mainPhoto =
    p.photos?.find((ph) => ph.isMain && !!ph.imageUrl) ?? p.photos?.[0];
  return mainPhoto?.imageUrl ?? null;
}

/**
 * ✅ mapApiProductToUI
 * بياخد الـ locale ويختار Ar/En حسب لغة الموقع
 */
export function mapApiProductToUI(p: ProductApi, locale: string = "ar") {
  const isArabic = locale === "ar";

  // الاسم
  const rawNameAr = (p.nameAr ?? "").trim();
  const rawNameEn = (p.nameEn ?? "").trim();
  const displayName = isArabic
    ? rawNameAr || rawNameEn || `#${p.id}`
    : rawNameEn || rawNameAr || `#${p.id}`;

  // الكاتيجوري
  const firstCat = p.categories?.[0];
  const rawCatAr = (firstCat?.arabicName ?? "").trim();
  const rawCatEn = (firstCat?.englishName ?? "").trim();
  const categoryName = isArabic
    ? rawCatAr || rawCatEn || "غير مصنف"
    : rawCatEn || rawCatAr || "Uncategorized";

  // السعر
  const priceNum = Number(p.price) || 0;
  const priceLabel = isArabic ? `${priceNum} جنيه` : `${priceNum} EGP`;

  // الوصف
  const rawDescAr = (p.descriptionAr ?? "").trim();
  const rawDescEn = (p.descriptionEn ?? "").trim();
  const description = isArabic
    ? rawDescAr || rawDescEn || ""
    : rawDescEn || rawDescAr || "";

  // النوع (رجالي / حريمي / unisex)
  const g = (p.genderType ?? "").toLowerCase();
  const gender =
    g === "men" ? "men" : g === "women" ? "women" : "unisex";

  // الألوان
  const availableColors = (p.colors ?? []).map((c) => {
    const rawColorAr = (c.colorNameAr ?? "").trim();
    const rawColorEn = (c.colorNameEn ?? "").trim();
    const name = isArabic
      ? rawColorAr ||
        rawColorEn ||
        (c.hexa ?? "").toUpperCase() ||
        "لون"
      : rawColorEn ||
        rawColorAr ||
        (c.hexa ?? "").toUpperCase() ||
        "Color";

    return {
      name,
      hex: (c.hexa ?? "#000000").toUpperCase(),
    };
  });

  // الصور
  const image = getMainImage(p) ?? "/placeholder-product.png";

  return {
    id: p.id,
    name: displayName,
    category: categoryName,
    price: priceLabel,
    priceNum,
    image,
    description,
    gender,
    availableColors,
    categoryIds: (p.categories ?? []).map((c) => c.id),
    raw: p as ProductApi,
  };
}

/* =========================
   API calls
========================= */
export async function getProductsPage(pageNumber = 1, pageSize = 12) {
  const url = `${API_BASE}/api/Product?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const res = await fetch(url, { 
    headers: { accept: "*/*" }, 
    next: { revalidate: 300 } // Cache for 5 minutes
  });
  if (!res.ok) throw new Error(`Failed to load products page (HTTP ${res.status})`);
  const json = (await res.json()) as Envelope<{
    pageIndex: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: ProductApi[];
  }>;
  return json.data;
}

export async function getProductById(productId: number) {
  const res = await fetch(`${API_BASE}/api/Product/${productId}`, {
    headers: { accept: "*/*" },
    next: { revalidate: 900 } // Cache for 15 minutes (increased for better performance)
  });
  if (!res.ok)
    throw new Error(`Failed to load product ${productId} (HTTP ${res.status})`);
  const json = (await res.json()) as Envelope<ProductApi>;
  return json.data;
}

/* =========================
   Filter API
========================= */
export type FilterParams = {
  priceFrom?: number;
  priceTo?: number;
  colorName?: string;
  sizeName?: string;
  pageNumber?: number;
  pageSize?: number;
};

export async function filterProducts(params: FilterParams) {
  const q = new URLSearchParams();
  if (params.priceFrom != null) q.set("priceFrom", String(params.priceFrom));
  if (params.priceTo != null) q.set("priceTo", String(params.priceTo));
  if (params.colorName) q.set("colorName", params.colorName);
  if (params.sizeName) q.set("sizeName", params.sizeName);
  q.set("pageNumber", String(params.pageNumber ?? 1));
  q.set("pageSize", String(params.pageSize ?? 12));

  const url = `${API_BASE}/api/Product/Filter?${q.toString()}`;
  const res = await fetch(url, { 
    headers: { accept: "*/*" }, 
    next: { revalidate: 180 } // Cache for 3 minutes
  });
  if (!res.ok) throw new Error(`Filter API failed (HTTP ${res.status})`);

  const json = (await res.json()) as Envelope<{
    pageIndex: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    items: ProductApi[];
  }>;
  return json.data;
}
