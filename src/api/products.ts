// /src/api/products.ts - Supabase Version
import { supabase } from "@/lib/supabaseClient";

export type ProductApi = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  compareAtPrice?: number | null;
  beforePrice?: number | null;
  hasSizes: boolean;
  oneSizeAmount: number | null;
  genderType: string | null;
  sizeChartImageUrl: string | null;
  tags: string[] | null;
  badge?: string | null;
  colors: Array<{
    id: string;
    colorNameAr: string | null;
    colorNameEn: string | null;
    hexa: string | null;
  }>;
  categories: Array<{
    id: string;
    arabicName: string;
    englishName: string;
  }>;
  photos: Array<{
    id: string;
    imageUrl: string;
    colorId: string | null;
    optionValueId: string | null;
    isMain: boolean;
  }>;
  variants: Array<{
    id: string;
    colorId: string | null;
    colorNameAr: string | null;
    colorNameEn: string | null;
    sizeId: string | null;
    name: string | null;
    quantity: number | null;
  }>;
  relatedProducts: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
  }>;
  material_en?: string | null;
  material_ar?: string | null;
  seo_title_en?: string | null;
  seo_title_ar?: string | null;
  seo_description_en?: string | null;
  seo_description_ar?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: number;
  chain_type?: 'gold' | 'silver' | 'both' | null;
  options?: Array<{
    id: string;
    name_en: string;
    name_ar: string;
    values: Array<{
      id: string;
      value_en: string;
      value_ar: string;
    }>;
  }>;
  main_image_second?: number;
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

/** Map Supabase row to ProductApi */
function mapRow(row: any): ProductApi {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    descriptionAr: row.description_ar || null,
    descriptionEn: row.description_en || null,
    price: row.base_price,
    compareAtPrice: row.compare_at_price || null,
    beforePrice: row.compare_at_price || null,
    hasSizes: false,
    oneSizeAmount: null,
    genderType: null,
    sizeChartImageUrl: row.size_chart_url || null,
    badge: row.badge || null,
    tags: row.tags_en ? row.tags_en.split(',').map((t: string) => t.trim()) : [],
    colors: (row.product_colors || []).map((pc: any) => ({
      id: pc.colors?.id || pc.color_id,
      colorNameAr: pc.colors?.name_ar || null,
      colorNameEn: pc.colors?.name_en || null,
      hexa: pc.colors?.hex_code || null,
    })),
    categories: row.categories
      ? [{
          id: row.categories.id,
          arabicName: row.categories.name_ar || '',
          englishName: row.categories.name_en || '',
        }]
      : [],
    photos: (row.product_images || []).map((img: any) => ({
      id: img.id,
      imageUrl: img.file_path,
      colorId: img.color_id || null,
      optionValueId: img.option_value_id || null,
      isMain: img.is_main === 1,
    })),
    variants: (row.product_variants || []).map((v: any) => ({
      id: v.id,
      colorId: v.color_id || null,
      colorNameAr: null,
      colorNameEn: null,
      sizeId: null,
      name: v.sku || null,
      quantity: v.quantity || 0,
    })),
    relatedProducts: (row.related_products || []).map((rp: any) => ({
      id: rp.products?.id || rp.related_product_id,
      nameEn: rp.products?.name_en || '',
      nameAr: rp.products?.name_ar || '',
    })),
    material_en: row.material_en || null,
    material_ar: row.material_ar || null,
    seo_title_en: row.seo_title_en || null,
    seo_title_ar: row.seo_title_ar || null,
    seo_description_en: row.seo_description_en || null,
    seo_description_ar: row.seo_description_ar || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_active: row.is_active,
    chain_type: row.chain_type || null,
    options: (row.product_options || []).map((opt: any) => ({
      id: opt.id,
      name_en: opt.name_en,
      name_ar: opt.name_ar,
      values: (opt.option_values || []).map((v: any) => ({
        id: v.id,
        value_en: v.value_en,
        value_ar: v.value_ar,
      })),
    })),
    main_image_second: row.main_image_second || 0,
  };
}

const PRODUCT_SELECT = `
  *,
  categories (id, name_en, name_ar),
  product_colors (
    color_id,
    colors (id, name_en, name_ar, hex_code)
  ),
  product_images (id, file_path, is_main, color_id, option_value_id, display_order),
  product_variants (id, sku, quantity, price_override),
  related_products!related_products_product_id_fkey (
    related_product_id,
    products:related_product_id (id, name_en, name_ar)
  ),
  product_options (id, name_en, name_ar, display_order,
    option_values (id, value_en, value_ar, display_order)
  )
`;

/** Fetch products from Supabase */
export async function fetchProducts(pageNumber = 1, pageSize = 50): Promise<Paged<ProductApi>> {
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', 1)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    pageIndex: pageNumber,
    totalPages,
    pageSize,
    totalCount,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
    items: (data || []).map(mapRow),
  };
}

/** Fetch single product by ID */
export async function fetchProductById(id: string): Promise<ProductApi | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data ? mapRow(data) : null;
}

/** Search products */
export async function searchProducts(query: string, pageNumber = 1, pageSize = 50): Promise<Paged<ProductApi>> {
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', 1)
    .is('deleted_at', null)
    .or(`name_en.ilike.%${query}%,name_ar.ilike.%${query}%,tags_en.ilike.%${query}%,tags_ar.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    pageIndex: pageNumber,
    totalPages,
    pageSize,
    totalCount,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
    items: (data || []).map(mapRow),
  };
}

/** Filter products */
export async function filterProducts(params: {
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  badge?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paged<ProductApi>> {
  const pageNumber = params.page || 1;
  const pageSize = params.pageSize || 50;
  const from = (pageNumber - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', 1)
    .is('deleted_at', null);

  if (params.categoryId) {
    query = query.eq('category_id', params.categoryId);
  }
  if (params.badge) {
    query = query.eq('badge', params.badge);
  }
  if (params.minPrice !== undefined) {
    query = query.gte('base_price', params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte('base_price', params.maxPrice);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    pageIndex: pageNumber,
    totalPages,
    pageSize,
    totalCount,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
    items: (data || []).map(mapRow),
  };
}

/** Get main image helper */
export const getMainImage = (p: ProductApi): string | null => {
  const main = p.photos?.find(ph => ph.isMain) || p.photos?.[0];
  return main?.imageUrl || null;
};

/** Check if product matches category */
export const matchesCategoryId = (p: ProductApi, categoryId: string): boolean =>
  Array.isArray(p.categories) && p.categories.some(c => String(c.id) === String(categoryId));
