// /src/api/socialProof.ts - Supabase Version
import { supabase } from "@/lib/supabaseClient";

export interface SocialProofVideo {
  id: string;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  video_url: string;
  thumbnail_url?: string;
  product_id?: string;
  product_name_en?: string;
  product_name_ar?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

function mapRow(row: any): SocialProofVideo {
  return {
    id: row.id,
    title_en: row.title_en || undefined,
    title_ar: row.title_ar || undefined,
    description_en: row.description_en || undefined,
    description_ar: row.description_ar || undefined,
    video_url: row.video_url,
    thumbnail_url: row.thumbnail_url || undefined,
    product_id: row.product_id || undefined,
    product_name_en: row.products?.name_en || undefined,
    product_name_ar: row.products?.name_ar || undefined,
    is_approved: row.is_approved === 1 || row.is_approved === true,
    is_featured: row.is_featured === 1 || row.is_featured === true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Get approved and featured social proof videos for public display
export const getFeaturedSocialProofs = async (): Promise<SocialProofVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('social_proofs')
      .select(`*, products (id, name_en, name_ar)`)
      .eq('is_approved', 1)
      .eq('is_featured', 1)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRow);
  } catch (error) {
    console.error('Failed to fetch featured social proofs:', error);
    return [];
  }
};

// Get all approved social proof videos for public display
export const getApprovedSocialProofs = async (): Promise<SocialProofVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('social_proofs')
      .select(`*, products (id, name_en, name_ar)`)
      .eq('is_approved', 1)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRow);
  } catch (error) {
    console.error('Failed to fetch approved social proofs:', error);
    return [];
  }
};
