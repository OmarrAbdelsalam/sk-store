import { supabase } from "@/lib/supabaseClient";

export interface BannerSettings {
  id: string;
  text_ar: string;
  text_en: string;
  is_active: boolean;
  background_color: string;
  text_color: string;
  created_at?: string;
  updated_at?: string;
}

export type BannerInput = {
  text_ar: string;
  text_en: string;
  is_active?: boolean;
  background_color?: string;
  text_color?: string;
};

export const bannerService = {
  // Get the active banner settings
  async getActive() {
    const { data, error } = await supabase
      .from("banner_settings")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return data as BannerSettings | null;
  },

  // Get all banner settings
  async getAll() {
    const { data, error } = await supabase
      .from("banner_settings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as BannerSettings[];
  },

  // Get single banner by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("banner_settings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as BannerSettings;
  },

  // Create new banner settings
  async create(input: BannerInput) {
    // If creating an active banner, deactivate others first
    if (input.is_active) {
      await supabase
        .from("banner_settings")
        .update({ is_active: false })
        .eq("is_active", true);
    }

    const { data, error } = await supabase
      .from("banner_settings")
      .insert({
        text_ar: input.text_ar,
        text_en: input.text_en,
        is_active: input.is_active ?? true,
        background_color: input.background_color ?? "#000000",
        text_color: input.text_color ?? "#ffffff",
      })
      .select()
      .single();

    if (error) throw error;
    return data as BannerSettings;
  },

  // Update banner settings
  async update(id: string, input: Partial<BannerInput>) {
    // If setting this banner as active, deactivate others first
    if (input.is_active) {
      await supabase
        .from("banner_settings")
        .update({ is_active: false })
        .neq("id", id);
    }

    const { data, error } = await supabase
      .from("banner_settings")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as BannerSettings;
  },

  // Delete banner settings
  async delete(id: string) {
    const { error } = await supabase.from("banner_settings").delete().eq("id", id);
    if (error) throw error;
  },

  // Toggle banner active status
  async toggleActive(id: string, isActive: boolean) {
    // If activating, deactivate others first
    if (isActive) {
      await supabase
        .from("banner_settings")
        .update({ is_active: false })
        .eq("is_active", true);
    }

    const { data, error } = await supabase
      .from("banner_settings")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as BannerSettings;
  },
};
