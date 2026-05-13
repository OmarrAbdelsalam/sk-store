import { supabase } from "@/lib/supabaseClient";

export type Color = {
  id: string;
  name_en: string;
  name_ar: string;
  hex_code: string;
  created_at?: string;
};

export type ColorInput = {
  name_en: string;
  name_ar: string;
  hex_code: string;
};

export const colorService = {
  async getAll(): Promise<Color[]> {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .is("deleted_at", null)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data || []).map((c: any) => ({
      id: c.id,
      name_en: c.name_en,
      name_ar: c.name_ar,
      hex_code: c.hex_code,
      created_at: c.created_at,
    }));
  },

  async getById(id: string): Promise<Color | null> {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return null;

    return data ? {
      id: data.id,
      name_en: data.name_en,
      name_ar: data.name_ar,
      hex_code: data.hex_code,
      created_at: data.created_at,
    } : null;
  },

  async create(input: ColorInput): Promise<Color> {
    const { data, error } = await supabase
      .from("colors")
      .insert({
        name_en: input.name_en,
        name_ar: input.name_ar || input.name_en,
        hex_code: input.hex_code,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name_en: data.name_en,
      name_ar: data.name_ar,
      hex_code: data.hex_code,
    };
  },

  async update(id: string, input: Partial<ColorInput>): Promise<Color | null> {
    const { data, error } = await supabase
      .from("colors")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data ? {
      id: data.id,
      name_en: data.name_en,
      name_ar: data.name_ar,
      hex_code: data.hex_code,
    } : null;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("colors")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};
