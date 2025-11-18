// lib/api.ts
import type { 
  Color, ColorFormData, ApiResponse 
} from "@/types/color";
import type { 
  Product, PaginatedResponse, ProductFormData, VariantFormData 
} from "@/types/product";
import type { Size } from "@/types/size";

const API_BASE_URL = "https://scrubstore.runasp.net/api";

/* ===== Helper: Token ===== */
function getToken() {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
  } catch {}
  return null;
}

/* ===== Helper: Fetch Wrapper ===== */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      accept: "*/*",
      ...(init?.body instanceof FormData
        ? {} // FormData ⇒ لا نضيف content-type يدويًا
        : { "content-type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const msg = (body as any)?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return body as T;
}

/* =========================
   Colors API
========================= */
export const colorApi = {
  getAll: async (): Promise<Color[]> => {
    const data = await apiFetch<ApiResponse<Color[]>>(`/Color`);
    return data.data;
  },

  getById: async (id: number): Promise<Color> => {
    const data = await apiFetch<ApiResponse<Color>>(`/Color/${id}`);
    return data.data;
  },

  create: async (colors: ColorFormData[]): Promise<void> => {
    await apiFetch<void>(`/Color`, {
      method: "POST",
      body: JSON.stringify({ colors }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`/Color/${id}`, { method: "DELETE" });
  },
};

/* =========================
   Sizes API
========================= */
export const sizeApi = {
  getAll: async (): Promise<Size[]> => {
    const data = await apiFetch<ApiResponse<Size[]>>(`/Size`);
    return data.data;
  },
};

/* =========================
   Categories API
========================= */
export const categoryApi = {
  getAll: async (): Promise<any[]> => {
    const data = await apiFetch<ApiResponse<PaginatedResponse<any>>>(`/Category?pageNumber=1&pageSize=100`);
    return data.data.items;
  },
};

/* =========================
   Products API
========================= */
export const productApi = {
  getAll: async (pageNumber = 1, pageSize = 10): Promise<PaginatedResponse<Product>> => {
    const data = await apiFetch<ApiResponse<PaginatedResponse<Product>>>(
      `/Product?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const data = await apiFetch<ApiResponse<Product>>(`/Product/${id}`);
    return data.data;
  },

  search: async (keyword?: string, pageNumber = 1, pageSize = 10): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (keyword) params.append("keyword", keyword);
    const data = await apiFetch<ApiResponse<PaginatedResponse<Product>>>(`/Product/Search?${params}`);
    return data.data;
  },

  filter: async (filters: {
    priceFrom?: number;
    priceTo?: number;
    colorName?: string;
    sizeName?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams({
      pageNumber: (filters.pageNumber || 1).toString(),
      pageSize: (filters.pageSize || 10).toString(),
    });
    if (filters.priceFrom !== undefined) params.append("priceFrom", filters.priceFrom.toString());
    if (filters.priceTo !== undefined) params.append("priceTo", filters.priceTo.toString());
    if (filters.colorName) params.append("colorName", filters.colorName);
    if (filters.sizeName) params.append("sizeName", filters.sizeName);

    const data = await apiFetch<ApiResponse<PaginatedResponse<Product>>>(`/Product/Filter?${params}`);
    return data.data;
  },

  create: async (formData: ProductFormData): Promise<void> => {
    const data = new FormData();
    data.append("NameAr", formData.nameAr);
    data.append("NameEn", formData.nameEn);
    data.append("DescriptionAr", formData.descriptionAr);
    data.append("DescriptionEn", formData.descriptionEn);
    data.append("Price", formData.price.toString());
    data.append("HasSizes", formData.hasSizes.toString());
    data.append("GenderType", formData.genderType);

    if (formData.oneSizeAmount !== undefined)
      data.append("OneSizeAmount", formData.oneSizeAmount.toString());

    if (formData.sizeChartImage) data.append("SizeChartImage", formData.sizeChartImage);

    formData.tags.forEach(tag => data.append("Tags", tag));
    formData.colorIds.forEach(id => data.append("ColorIds", id.toString()));
    formData.categoryIds.forEach(id => data.append("CategoryIds", id));
    formData.relatedProductIds.forEach(id => data.append("RelatedProductIds", id.toString()));

    await apiFetch<void>(`/Product`, { method: "POST", body: data });
  },

  update: async (id: number, formData: Partial<ProductFormData>): Promise<void> => {
    const data = new FormData();
    if (formData.nameAr) data.append("NameAr", formData.nameAr);
    if (formData.nameEn) data.append("NameEn", formData.nameEn);
    if (formData.descriptionAr) data.append("DescriptionAr", formData.descriptionAr);
    if (formData.descriptionEn) data.append("DescriptionEn", formData.descriptionEn);
    if (formData.price !== undefined) data.append("Price", formData.price.toString());
    if (formData.hasSizes !== undefined) data.append("HasSizes", formData.hasSizes.toString());
    if (formData.genderType) data.append("GenderType", formData.genderType);
    if (formData.oneSizeAmount !== undefined)
      data.append("OneSizeAmount", formData.oneSizeAmount.toString());
    if (formData.sizeChartImage) data.append("SizeChartImage", formData.sizeChartImage);

    formData.tags?.forEach(tag => data.append("Tags", tag));

    await apiFetch<void>(`/Product/${id}`, { method: "PUT", body: data });
  },

  delete: async (id: number): Promise<void> => {
    await apiFetch<void>(`/Product/${id}`, { method: "DELETE" });
  },

  createVariants: async (productId: number, variants: VariantFormData[]): Promise<void> => {
    await apiFetch<void>(`/Product/ProductVariant`, {
      method: "POST",
      body: JSON.stringify({ productId, variants }),
    });
  },

  updateVariant: async (variant: { id: number; colorId: number; sizeId: number; quantity: number }): Promise<void> => {
    await apiFetch<void>(`/Product/ProductVariant`, {
      method: "PUT",
      body: JSON.stringify(variant),
    });
  },

  deleteVariant: async (productId: number, variantId: number): Promise<void> => {
    await apiFetch<void>(`/Product/${productId}/variants/${variantId}`, {
      method: "DELETE",
    });
  },

  addPhotos: async (
    productId: number,
    colors: Array<{ colorId: number; photos: Array<{ isMain: boolean; photo: File }> }>
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("ProductId", productId.toString());

    colors.forEach((colorData, i) => {
      formData.append(`Colors[${i}].colorId`, colorData.colorId.toString());
      colorData.photos.forEach((photoData, j) => {
        formData.append(`Colors[${i}].photos[${j}].isMain`, photoData.isMain.toString());
        formData.append(`Colors[${i}].photos[${j}].photo`, photoData.photo);
      });
    });

    await apiFetch<void>(`/Picture/add-photos`, { method: "POST", body: formData });
  },

  deletePhoto: async (productId: number, photoId: number): Promise<void> => {
    await apiFetch<void>(`/Picture/${productId}/photos/${photoId}`, { method: "DELETE" });
  },
};
