import { supabase } from "@/lib/supabaseClient";
import { withRetry, formatError } from "@/lib/retry";

// ======================== OUR VIBES ITEMS ========================
export interface OurVibesItem {
  id: string;
  video_url: string;        // Required: Dropbox path
  thumbnail_url?: string;   // Optional: Dropbox path
  caption: string;          // Required: English only
  product_id?: string;      // Optional: Link to product
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined product data
  product?: {
    id: string;
    name_en: string;
    name_ar: string;
  };
}

// ======================== SETTINGS ========================
export interface OurVibesSettings {
  id: string;
  section_title: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default settings
export const DEFAULT_SETTINGS: Omit<OurVibesSettings, 'id' | 'created_at' | 'updated_at'> = {
  section_title: 'Our Vibes',
  is_active: true,
};

export const ourVibesService = {
  // ======================== ITEMS ========================
  
  // Get all active items with product info
  async getActiveItems(): Promise<OurVibesItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("our_vibes")
          .select(`
            *,
            product:products(id, name_en, name_ar)
          `)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        return data as OurVibesItem[];
      }, { label: "ourVibes.getActiveItems" });
    } catch (error) {
      console.error("Error fetching our vibes items:", formatError(error));
      return [];
    }
  },

  // Get all items (for admin)
  async getAllItems(): Promise<OurVibesItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("our_vibes")
          .select(`
            *,
            product:products(id, name_en, name_ar)
          `)
          .order("display_order", { ascending: true });

        if (error) throw error;
        return data as OurVibesItem[];
      }, { label: "ourVibes.getAllItems" });
    } catch (error) {
      console.error("Error fetching our vibes items:", formatError(error));
      return [];
    }
  },

  // Create new item
  async createItem(input: {
    video_url: string;       // Required
    caption: string;         // Required
    thumbnail_url?: string;  // Optional
    product_id?: string;     // Optional
  }): Promise<OurVibesItem> {
    // Validate required fields
    if (!input.video_url) throw new Error("Video URL is required");
    if (!input.caption) throw new Error("Caption is required");

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from("our_vibes")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from("our_vibes")
      .insert({
        video_url: input.video_url,
        thumbnail_url: input.thumbnail_url || null,
        caption: input.caption,
        product_id: input.product_id || null,
        display_order: newOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as OurVibesItem;
  },

  // Update item
  async updateItem(id: string, input: Partial<{
    video_url: string;
    thumbnail_url: string;
    caption: string;
    product_id: string | null;
    is_active: boolean;
  }>): Promise<OurVibesItem> {
    const { data, error } = await supabase
      .from("our_vibes")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as OurVibesItem;
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("our_vibes")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // ======================== SETTINGS ========================
  
  // Get settings
  async getSettings(): Promise<OurVibesSettings> {
    try {
      const { data, error } = await supabase
        .from("our_vibes_settings")
        .select("*")
        .limit(1)
        .single();

      if (error || !data) {
        return {
          id: 'default',
          ...DEFAULT_SETTINGS,
        };
      }

      return data as OurVibesSettings;
    } catch (error) {
      console.error("Error fetching settings:", formatError(error));
      return {
        id: 'default',
        ...DEFAULT_SETTINGS,
      };
    }
  },

  // Update settings
  async updateSettings(input: Partial<Omit<OurVibesSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<OurVibesSettings> {
    const existing = await this.getSettings();

    if (existing.id === 'default') {
      const { data, error } = await supabase
        .from("our_vibes_settings")
        .insert({
          ...DEFAULT_SETTINGS,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as OurVibesSettings;
    } else {
      const { data, error } = await supabase
        .from("our_vibes_settings")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as OurVibesSettings;
    }
  },
};
