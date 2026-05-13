import { supabase } from "@/lib/supabaseClient";
import { withRetry, formatError } from "@/lib/retry";

// ======================== CUSTOMER LOVE ITEMS ========================
export interface CustomerLoveItem {
  id: string;
  image_url: string;
  video_url?: string;
  customer_name?: string;
  rating: number;
  review_text?: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ======================== CUSTOMER LOVE SETTINGS ========================
export interface CustomerLoveSettings {
  id: string;
  title: string;
  subtitle: string;
  instagram_handle: string;
  cta_text: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default settings
export const DEFAULT_CUSTOMER_LOVE_SETTINGS: Omit<CustomerLoveSettings, 'id' | 'created_at' | 'updated_at'> = {
  title: 'Customer Love',
  subtitle: 'See what our customers are saying about their SK Bags',
  instagram_handle: '@skbags',
  cta_text: 'Share your SK Bags moment with us!',
  is_active: true,
};

export const customerLoveService = {
  // ======================== ITEMS ========================
  
  // Get all active items
  async getActiveItems(): Promise<CustomerLoveItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("customer_love")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        return data as CustomerLoveItem[];
      });
    } catch (error) {
      console.error("Error fetching customer love items:", formatError(error));
      return [];
    }
  },

  // Get all items (for admin)
  async getAllItems(): Promise<CustomerLoveItem[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("customer_love")
          .select("*")
          .order("display_order", { ascending: true });

        if (error) throw error;
        return data as CustomerLoveItem[];
      });
    } catch (error) {
      console.error("Error fetching customer love items:", formatError(error));
      return [];
    }
  },

  // Create new item
  async createItem(input: {
    image_url: string;
    video_url?: string;
    customer_name?: string;
    rating?: number;
    review_text?: string;
    is_featured?: boolean;
  }): Promise<CustomerLoveItem> {
    // Get max display_order
    const { data: maxOrder } = await supabase
      .from("customer_love")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from("customer_love")
      .insert({
        image_url: input.image_url,
        video_url: input.video_url,
        customer_name: input.customer_name,
        rating: input.rating || 5,
        review_text: input.review_text,
        is_featured: input.is_featured || false,
        display_order: newOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as CustomerLoveItem;
  },

  // Update item
  async updateItem(id: string, input: Partial<CustomerLoveItem>): Promise<CustomerLoveItem> {
    const { data, error } = await supabase
      .from("customer_love")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerLoveItem;
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("customer_love")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // ======================== SETTINGS ========================
  
  // Get settings
  async getSettings(): Promise<CustomerLoveSettings> {
    try {
      const { data, error } = await supabase
        .from("customer_love_settings")
        .select("*")
        .limit(1)
        .single();

      if (error || !data) {
        return {
          id: 'default',
          ...DEFAULT_CUSTOMER_LOVE_SETTINGS,
        };
      }

      return data as CustomerLoveSettings;
    } catch (error) {
      console.error("Error fetching customer love settings:", formatError(error));
      return {
        id: 'default',
        ...DEFAULT_CUSTOMER_LOVE_SETTINGS,
      };
    }
  },

  // Update settings
  async updateSettings(input: Partial<Omit<CustomerLoveSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<CustomerLoveSettings> {
    const existing = await this.getSettings();

    if (existing.id === 'default') {
      // Create new
      const { data, error } = await supabase
        .from("customer_love_settings")
        .insert({
          ...DEFAULT_CUSTOMER_LOVE_SETTINGS,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CustomerLoveSettings;
    } else {
      // Update existing
      const { data, error } = await supabase
        .from("customer_love_settings")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as CustomerLoveSettings;
    }
  },
};
