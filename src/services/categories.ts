
import { supabase } from "@/lib/supabaseClient";

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  display_order: number;
  is_active: number;
  description_en?: string; // Optional in backend
  description_ar?: string;
}

export type CategoryInput = {
  name_en: string;
  image_url?: string;
  description_en?: string;
  is_active?: number;
};

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data as Category[];
  },

  async create(input: CategoryInput) {
    // Get max display_order to append to end
    const { data: maxOrderData } = await supabase
      .from("categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle(); // Safe for empty table

    const nextOrder = (maxOrderData?.display_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name_en: input.name_en,
        name_ar: input.name_en, // Auto-fill AR with EN for now as requested
        image_url: input.image_url,
        // description_en: input.description_en, // TODO: Uncomment after running SQL migration
        display_order: nextOrder,
        is_active: input.is_active ?? 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async update(id: string, input: Partial<CategoryInput>) {
    const updateData: any = { ...input };
    if (input.name_en) {
      updateData.name_ar = input.name_en; // Keep synchronized
    }
    
    // Remove description from update until schema is ready
    delete updateData.description_en;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async delete(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },

  async reorder(items: { id: string; display_order: number }[]) {
    // Upsert might be better, but simple update loop is easier for now to avoid conflicts constraints
    // Or we can use a stored procedure if available.
    // For small number of categories, promise.all updates is fine.
    
    const updates = items.map((item) =>
      supabase
        .from("categories")
        .update({ display_order: item.display_order })
        .eq("id", item.id)
    );

    const results = await Promise.all(updates);
    const error = results.find((r) => r.error)?.error;
    if (error) throw error;
  },
};
