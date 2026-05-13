import { supabase } from "@/lib/supabaseClient";
import { withRetry, formatError } from "@/lib/retry";

// ======================== MORE TO DISCOVER ITEMS ========================
export interface MoreToDiscoverItem {
  id: string;
  image_url: string;
  title?: string;
  link: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ======================== SETTINGS ========================
export interface MoreToDiscoverSettings {
  id: string;
  section_title: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default settings
export const DEFAULT_SETTINGS: Omit<MoreToDiscoverSettings, 'id' | 'created_at' | 'updated_at'> = {
  section_title: 'More to Discover',
  is_active: true,
};

export const moreToDiscoverService = {
  // ======================== ITEMS ========================
  
  // Get all active items
  async getActiveItems(): Promise<MoreToDiscoverItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("more_to_discover")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        return data as MoreToDiscoverItem[];
      }, { label: "moreToDiscover.getActiveItems" });
    } catch (error) {
      console.error("Error fetching more to discover items:", formatError(error));
      return [];
    }
  },

  // Get all items (for admin)
  async getAllItems(): Promise<MoreToDiscoverItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("more_to_discover")
          .select("*")
          .order("display_order", { ascending: true });

        if (error) throw error;
        return data as MoreToDiscoverItem[];
      }, { label: "moreToDiscover.getAllItems" });
    } catch (error) {
      console.error("Error fetching more to discover items:", formatError(error));
      return [];
    }
  },

  // Create new item
  async createItem(input: {
    image_url: string;
    title?: string;
    link?: string;
  }): Promise<MoreToDiscoverItem> {
    // Get max display_order
    const { data: maxOrder } = await supabase
      .from("more_to_discover")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from("more_to_discover")
      .insert({
        image_url: input.image_url,
        title: input.title,
        link: input.link || '/products',
        display_order: newOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as MoreToDiscoverItem;
  },

  // Update item
  async updateItem(id: string, input: Partial<MoreToDiscoverItem>): Promise<MoreToDiscoverItem> {
    const { data, error } = await supabase
      .from("more_to_discover")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as MoreToDiscoverItem;
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("more_to_discover")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // ======================== SETTINGS ========================
  
  // Get settings
  async getSettings(): Promise<MoreToDiscoverSettings> {
    try {
      const { data, error } = await supabase
        .from("more_to_discover_settings")
        .select("*")
        .limit(1)
        .single();

      if (error || !data) {
        return {
          id: 'default',
          ...DEFAULT_SETTINGS,
        };
      }

      return data as MoreToDiscoverSettings;
    } catch (error) {
      console.error("Error fetching settings:", formatError(error));
      return {
        id: 'default',
        ...DEFAULT_SETTINGS,
      };
    }
  },

  // Update settings
  async updateSettings(input: Partial<Omit<MoreToDiscoverSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<MoreToDiscoverSettings> {
    const existing = await this.getSettings();

    if (existing.id === 'default') {
      const { data, error } = await supabase
        .from("more_to_discover_settings")
        .insert({
          ...DEFAULT_SETTINGS,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MoreToDiscoverSettings;
    } else {
      const { data, error } = await supabase
        .from("more_to_discover_settings")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as MoreToDiscoverSettings;
    }
  },
};
