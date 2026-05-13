import { supabase } from "@/lib/supabaseClient";
import { withRetry, formatError } from "@/lib/retry";

export interface MarqueeItem {
  id: string;
  text: string;
  display_order: number;
  is_active: boolean;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export interface MarqueeSettings {
  id: string;
  background_color: string;
  text_color: string;
  scroll_speed: number;
  is_active: boolean;
  type: string;
  created_at?: string;
  updated_at?: string;
}

// Default settings
export const DEFAULT_MARQUEE_SETTINGS: Omit<MarqueeSettings, 'id' | 'created_at' | 'updated_at'> = {
  background_color: '#000000',
  text_color: '#ffffff',
  scroll_speed: 30,
  is_active: true,
  type: 'top_banner',
};

export const marqueeService = {
  // ==================== ITEMS ====================
  
  // Get all active marquee items by type
  async getActiveItems(type: string = 'top_banner') {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from("marquee_items")
        .select("*")
        .eq("is_active", true)
        .eq("type", type)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as MarqueeItem[];
    }, { label: `marquee.getActiveItems(${type})` });
  },

  // Get all marquee items (for admin) by type
  async getAllItems(type: string = 'top_banner') {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from("marquee_items")
        .select("*")
        .eq("type", type)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as MarqueeItem[];
    }, { label: `marquee.getAllItems(${type})` });
  },

  // Create new marquee item
  async createItem(text: string, type: string = 'top_banner') {
    // Get max display_order
    const { data: maxOrder } = await supabase
      .from("marquee_items")
      .select("display_order")
      .eq("type", type)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from("marquee_items")
      .insert({
        text,
        display_order: newOrder,
        is_active: true,
        type,
      })
      .select()
      .single();

    if (error) throw error;
    return data as MarqueeItem;
  },

  // Update marquee item
  async updateItem(id: string, text: string) {
    const { data, error } = await supabase
      .from("marquee_items")
      .update({ text, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as MarqueeItem;
  },

  // Delete marquee item
  async deleteItem(id: string) {
    const { error } = await supabase
      .from("marquee_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Reorder items
  async reorderItems(items: { id: string; display_order: number }[]) {
    const updates = items.map((item) =>
      supabase
        .from("marquee_items")
        .update({ display_order: item.display_order })
        .eq("id", item.id)
    );

    await Promise.all(updates);
  },

  // ==================== SETTINGS ====================

  // Get marquee settings by type
  async getSettings(type: string = 'top_banner') {
    return await withRetry(async () => {
      const { data, error } = await supabase
        .from("marquee_settings")
        .select("*")
        .eq("type", type)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as MarqueeSettings | null;
    }, { label: `marquee.getSettings(${type})` });
  },

  // Update marquee settings
  async updateSettings(settings: Partial<Omit<MarqueeSettings, "id" | "created_at" | "updated_at">>, type: string = 'top_banner') {
    // First get existing settings
    const existing = await this.getSettings(type);

    if (existing) {
      const { data, error } = await supabase
        .from("marquee_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as MarqueeSettings;
    } else {
      // Create new settings with type
      const { data, error } = await supabase
        .from("marquee_settings")
        .insert({
          background_color: settings.background_color || "#000000",
          text_color: settings.text_color || "#ffffff",
          scroll_speed: settings.scroll_speed || 30,
          is_active: true,
          type,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MarqueeSettings;
    }
  },
};
