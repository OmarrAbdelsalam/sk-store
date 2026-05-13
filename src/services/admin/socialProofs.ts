import { supabase } from "@/lib/supabaseClient";

export interface SocialProofAdmin {
  id: string;
  video_url: string;
  thumbnail_url?: string;
  title_en?: string;
  title_ar?: string;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  product_id?: string;
  product?: { id: string; name_en: string; name_ar: string };
  created_at: string;
  updated_at: string;
}

function mapRow(row: any): SocialProofAdmin {
  return {
    id: row.id,
    video_url: row.video_url,
    thumbnail_url: row.thumbnail_url || undefined,
    title_en: row.title_en || undefined,
    title_ar: row.title_ar || undefined,
    is_approved: row.is_approved === 1 || row.is_approved === true,
    is_featured: row.is_featured === 1 || row.is_featured === true,
    display_order: row.display_order ?? 0,
    product_id: row.product_id || undefined,
    product: row.products
      ? { id: row.products.id, name_en: row.products.name_en, name_ar: row.products.name_ar }
      : undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const socialProofsAdminService = {
  async getAll(): Promise<SocialProofAdmin[]> {
    const { data, error } = await supabase
      .from("social_proofs")
      .select("*, products(id, name_en, name_ar)")
      .is("deleted_at", null)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  async create(input: {
    video_url: string;
    thumbnail_url?: string;
    title_en?: string;
    title_ar?: string;
    product_id?: string;
    is_featured?: boolean;
  }): Promise<SocialProofAdmin> {
    const { data, error } = await supabase
      .from("social_proofs")
      .insert({
        video_url: input.video_url,
        thumbnail_url: input.thumbnail_url || null,
        title_en: input.title_en || null,
        title_ar: input.title_ar || null,
        product_id: input.product_id || null,
        is_approved: 1,
        is_featured: input.is_featured ? 1 : 0,
      })
      .select("*, products(id, name_en, name_ar)")
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async update(id: string, input: Partial<{
    video_url: string;
    thumbnail_url: string;
    title_en: string;
    title_ar: string;
    product_id: string | null;
    is_approved: boolean;
    is_featured: boolean;
  }>): Promise<void> {
    const payload: any = { ...input, updated_at: new Date().toISOString() };
    if ("is_approved" in input) payload.is_approved = input.is_approved ? 1 : 0;
    if ("is_featured" in input) payload.is_featured = input.is_featured ? 1 : 0;

    const { error } = await supabase
      .from("social_proofs")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("social_proofs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async reorder(orderedIds: string[]): Promise<void> {
    // Update display_order for each item based on its position in the array
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("social_proofs")
        .update({ display_order: index + 1 })
        .eq("id", id)
    );
    await Promise.all(updates);
  },
};
