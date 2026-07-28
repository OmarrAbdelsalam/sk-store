
import { supabase } from "@/lib/supabaseClient";

// File size limit for product images (500KB)
export const PRODUCT_IMAGE_MAX_SIZE = 500 * 1024;

// Badge types
export type ProductBadge = 'new_arrival' | 'best_seller' | 'sold_out' | 'last_piece' | 'sale' | null;

export const BADGE_OPTIONS = [
  { value: 'none', label: 'No Badge' },
  { value: 'new_arrival', label: 'New Arrival' },
  { value: 'best_seller', label: 'Best Seller' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'last_piece', label: 'Last Piece' },
  { value: 'sale', label: 'Sale' },
];

export type Product = {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  base_price: number;
  compare_at_price?: number;
  material_en: string;
  material_ar: string;
  category_id: string;
  badge?: ProductBadge;
  badge_order?: number;
  category_order?: number;
  global_order?: number;
  main_image_second?: number;
  is_active: number;
  created_at?: string;
  
  // Relations
  category?: { name_en: string };
  colors?: { id: string; name_en: string; hex_code: string }[];
  images?: { id: string; file_path: string; color_id: string | null; is_main: number }[];
  related_ids?: string[];
  
  // For UI display
  main_image?: string;
};

export type ProductInput = {
  name_en: string;
  description_en: string;
  base_price: number;
  compare_at_price?: number;
  material_en: string;
  category_id: string;
  badge?: ProductBadge;
  main_image_second?: number;
  
  color_ids: string[];
  images: { file_path: string; color_id: string | null; chain_option_value_id?: string | null; is_main: number }[];
  related_product_ids: string[];
};

// Validate image file size
export const validateProductImageSize = (file: File): { valid: boolean; error?: string } => {
  if (file.size > PRODUCT_IMAGE_MAX_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds 500KB limit. Current size: ${(file.size / 1024).toFixed(0)}KB`,
    };
  }
  return { valid: true };
};

export const productService = {
  async getAll() {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories (name_en),
        product_colors (
          color:colors (id, name_en, hex_code)
        ),
        product_images (id, file_path, is_main, color_id)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform data to cleaner structure
    return data.map((p: any) => ({
      ...p,
      colors: p.product_colors.map((pc: any) => pc.color),
      images: p.product_images,
      main_image: p.product_images.find((img: any) => img.is_main === 1)?.file_path || p.product_images[0]?.file_path
    })) as Product[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_colors (color_id),
        product_images (id, file_path, is_main, color_id, chain_option_value_id),
        related_products!related_products_product_id_fkey (related_product_id),
        product_options (id, name_en, name_ar, option_values (id, value_en, value_ar))
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    // Extract chain options (Gold/Silver) from product_options
    const chainOpt = (data.product_options || []).find((o: any) => 
      o.name_en?.toLowerCase().includes('chain')
    );

    return {
      ...data,
      main_image_second: data.main_image_second ?? 0,
      related_ids: data.related_products.map((rp: any) => rp.related_product_id),
      color_ids: data.product_colors.map((pc: any) => pc.color_id),
      chain_options: chainOpt?.option_values || [],
      images: data.product_images,
    };
  },

  async create(input: ProductInput) {
    // 1. Create Product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name_en: input.name_en,
        name_ar: input.name_en, // Auto-fill
        description_en: input.description_en,
        description_ar: input.description_en, // Auto-fill
        base_price: input.base_price,
        compare_at_price: input.compare_at_price,
        material_en: input.material_en,
        material_ar: input.material_en, // Auto-fill
        category_id: input.category_id,
        badge: input.badge || null,
        main_image_second: input.main_image_second ?? 0,
        is_active: 1
      })
      .select()
      .single();

    if (productError) throw productError;

    const productId = product.id;

    // 2. Link Colors
    if (input.color_ids.length > 0) {
      const colorInserts = input.color_ids.map(colorId => ({
        product_id: productId,
        color_id: colorId
      }));
      const { error: colorError } = await supabase.from("product_colors").insert(colorInserts);
      if (colorError) console.error("Error linking colors:", colorError);
    }

    // 3. Link Images
    if (input.images.length > 0) {
      const imageInserts = input.images.map(img => ({
        product_id: productId,
        file_path: img.file_path,
        color_id: img.color_id,
        chain_option_value_id: img.chain_option_value_id || null,
        is_main: img.is_main
      }));
      const { error: imgError } = await supabase.from("product_images").insert(imageInserts);
      if (imgError) console.error("Error linking images:", imgError);
    }

    // 4. Link Related Products
    if (input.related_product_ids.length > 0) {
        const relatedInserts = input.related_product_ids.map(relId => ({
            product_id: productId,
            related_product_id: relId
        }));
        const { error: relError } = await supabase.from("related_products").insert(relatedInserts);
        if (relError) console.error("Error linking related products:", relError);
    }

    return product;
  },

  async update(id: string, input: ProductInput) {
    // 1. Update Product
    const { error: productError } = await supabase
      .from("products")
      .update({
        name_en: input.name_en,
        name_ar: input.name_en,
        description_en: input.description_en,
        description_ar: input.description_en,
        base_price: input.base_price,
        compare_at_price: input.compare_at_price,
        material_en: input.material_en,
        material_ar: input.material_en,
        category_id: input.category_id,
        badge: input.badge || null,
        main_image_second: input.main_image_second ?? 0,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
      
    if (productError) throw productError;

    // 2. Sync Colors (Delete all and re-insert)
    await supabase.from("product_colors").delete().eq("product_id", id);
    if (input.color_ids.length > 0) {
       const colorInserts = input.color_ids.map(colorId => ({
        product_id: id,
        color_id: colorId
      }));
      await supabase.from("product_colors").insert(colorInserts);
    }

    // 3. Sync Images (Delete all and re-insert)
    await supabase.from("product_images").delete().eq("product_id", id);
    if (input.images.length > 0) {
      const imageInserts = input.images.map(img => ({
        product_id: id,
        file_path: img.file_path,
        color_id: img.color_id,
        chain_option_value_id: img.chain_option_value_id || null,
        is_main: img.is_main
      }));
      await supabase.from("product_images").insert(imageInserts);
    }

    // 4. Sync Related Products
    await supabase.from("related_products").delete().eq("product_id", id);
    if (input.related_product_ids.length > 0) {
        const relatedInserts = input.related_product_ids.map(relId => ({
            product_id: id,
            related_product_id: relId
        }));
        await supabase.from("related_products").insert(relatedInserts);
    }

    return await this.getById(id);
  },

  async delete(id: string) {
      // Soft delete
       const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    
    if (error) throw error;
  },

  async updateOrders(updates: { id: string; badge_order?: number; category_order?: number }[]) {
    // Supabase JS doesn't have a bulk update for multiple rows with different values easily,
    // so we can either use an RPC or do multiple small updates via Promise.all
    // Since this is for admin and usually a small list, Promise.all is acceptable.
    const promises = updates.map(update => {
      const data: any = {};
      if (update.badge_order !== undefined) data.badge_order = update.badge_order;
      if (update.category_order !== undefined) data.category_order = update.category_order;
      
      return supabase
        .from('products')
        .update(data)
        .eq('id', update.id);
    });

    await Promise.all(promises);
  }
};
