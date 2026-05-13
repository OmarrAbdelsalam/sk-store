import { supabase } from "@/lib/supabaseClient";

export interface MobileHero {
  id: string;
  button_text: string;
  button_link: string;
  text_color: string;
  media_url: string;
  media_type: 'image' | 'video';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default values
export const DEFAULT_MOBILE_HERO: Omit<MobileHero, 'id' | 'created_at' | 'updated_at'> = {
  button_text: 'SHOP BAGS',
  button_link: '/products',
  text_color: '#ffffff',
  media_url: '/hero.webp',
  media_type: 'image',
  is_active: true,
};

// File size limits
export const FILE_LIMITS = {
  image: 2 * 1024 * 1024, // 2MB
  video: 5 * 1024 * 1024, // 5MB
};

export const mobileHeroService = {
  // Get active mobile hero settings
  async getActive(): Promise<MobileHero> {
    try {
      const { data, error } = await supabase
        .from("mobile_hero")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return {
          id: 'default',
          ...DEFAULT_MOBILE_HERO,
        };
      }

      return data as MobileHero;
    } catch (error) {
      console.error("Error fetching mobile hero:", error);
      return {
        id: 'default',
        ...DEFAULT_MOBILE_HERO,
      };
    }
  },

  // Update mobile hero settings
  async update(id: string, input: Partial<Omit<MobileHero, 'id' | 'created_at' | 'updated_at'>>): Promise<MobileHero> {
    const existing = await this.getActive();

    if (existing.id === 'default') {
      // Create new
      const { data, error } = await supabase
        .from("mobile_hero")
        .insert({
          ...DEFAULT_MOBILE_HERO,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MobileHero;
    } else {
      // Update existing
      const { data, error } = await supabase
        .from("mobile_hero")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MobileHero;
    }
  },

  // Validate file size before upload
  validateFileSize(file: File, type: 'image' | 'video'): { valid: boolean; error?: string } {
    const limit = FILE_LIMITS[type];
    const limitMB = limit / (1024 * 1024);
    
    if (file.size > limit) {
      return {
        valid: false,
        error: `File size exceeds ${limitMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      };
    }
    
    return { valid: true };
  },
};
