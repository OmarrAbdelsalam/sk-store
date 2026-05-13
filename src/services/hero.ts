import { supabase } from "@/lib/supabaseClient";
import { withRetry, formatError } from "@/lib/retry";

export interface HeroSettings {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default values if no settings exist
export const DEFAULT_HERO: Omit<HeroSettings, 'id' | 'created_at' | 'updated_at'> = {
  title: 'Crafted for Every Moment',
  subtitle: '',
  description: 'Discover our curated collection of handcrafted bags and accessories — where timeless elegance meets everyday luxury.',
  button_text: 'SHOP NOW',
  button_link: '/products',
  image_url: '/hero.webp',
  is_active: true,
};

export const heroService = {
  // Get active hero settings
  async getActive(): Promise<HeroSettings> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from("hero_settings")
          .select("*")
          .eq("is_active", true)
          .limit(1)
          .single();

        if (error || !data) {
          // Return defaults if no data exists
          return {
            id: 'default',
            ...DEFAULT_HERO,
          };
        }
        
        return data as HeroSettings;
      }, { label: "hero.getActive" });
    } catch (error) {
      console.error("Error fetching hero settings:", formatError(error));
      return {
        id: 'default',
        ...DEFAULT_HERO,
      };
    }
  },

  // Update hero settings
  async update(id: string, input: Partial<Omit<HeroSettings, 'id' | 'created_at' | 'updated_at'>>) {
    // Check if settings exist
    const existing = await this.getActive();
    
    if (existing.id === 'default') {
      // Create new settings
      const { data, error } = await supabase
        .from("hero_settings")
        .insert({
          ...DEFAULT_HERO,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as HeroSettings;
    } else {
      // Update existing settings
      const { data, error } = await supabase
        .from("hero_settings")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as HeroSettings;
    }
  },
};
