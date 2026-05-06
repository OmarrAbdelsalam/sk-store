import { supabase } from "@/lib/supabaseClient";

// ================================================
// Types
// ================================================

export interface PromoCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  first_order_only: number;
  first_order_only_check: boolean;
  one_use_per_phone: boolean;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface QuickPromotion {
  id: string;
  promo_type:
    | "buy_x_get_y_free"
    | "buy_x_get_y_discount"
    | "free_shipping_min_amount"
    | "free_shipping_min_items"
    | "percentage_off_min_amount"
    | "fixed_discount_min_amount"
    | "bundle_discount"
    | "first_order_discount"
    | "free_gift_min_amount";
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  badge_text_en: string | null;
  badge_text_ar: string | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  min_amount: number | null;
  min_items: number | null;
  discount_type: "percentage" | "fixed" | "free" | null;
  discount_value: number | null;
  applies_to: "all" | "category" | "product" | "shipping";
  category_id: string | null;
  product_id: string | null;
  gift_product_id: string | null;
  category_ids: string | null;
  product_ids: string | null; // JSON array string e.g. '["uuid1","uuid2"]'
  exclude_category_ids: string | null;
  exclude_product_ids: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: number;
  show_in_cart: number;
  show_in_product: number;
  show_banner: number;
  priority: number;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeInput {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number | null;
  usage_limit?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: number;
  first_order_only_check?: boolean;
  one_use_per_phone?: boolean;
}

export interface QuickPromotionInput {
  promo_type: QuickPromotion["promo_type"];
  name_en: string;
  name_ar: string;
  badge_text_en?: string | null;
  badge_text_ar?: string | null;
  product_ids?: string | null;
  category_ids?: string | null;
  min_amount?: number | null;
  discount_type?: "percentage" | "fixed" | "free" | null;
  discount_value?: number | null;
  applies_to?: "all" | "category" | "product" | "shipping";
  buy_quantity?: number | null;
  get_quantity?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: number;
  priority?: number;
  show_in_cart?: number;
  show_in_product?: number;
}

export interface ValidationResult {
  valid: boolean;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  promoCodeId?: string;
  errorCode?: "NOT_FOUND" | "INACTIVE" | "EXPIRED" | "USAGE_LIMIT" | "MIN_ORDER";
  errorMessage?: string;
}

export class PromotionServiceError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "PromotionServiceError";
  }
}

// ================================================
// Promotion Service
// ================================================

export const promotionService = {
  // ── Promo Codes ──────────────────────────────

  async getAllPromoCodes(): Promise<PromoCode[]> {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new PromotionServiceError("Failed to fetch promo codes", error);
    return data as PromoCode[];
  },

  async createPromoCode(input: PromoCodeInput): Promise<PromoCode> {
    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        code: input.code.toUpperCase(),
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        min_order_amount: input.min_order_amount ?? null,
        usage_limit: input.usage_limit ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        is_active: input.is_active ?? 1,
        usage_count: 0,
        first_order_only_check: input.first_order_only_check ?? false,
        one_use_per_phone: input.one_use_per_phone ?? false,
      })
      .select()
      .single();

    if (error) throw new PromotionServiceError("Failed to create promo code", error);
    return data as PromoCode;
  },

  async updatePromoCode(id: string, input: PromoCodeInput): Promise<PromoCode> {
    const { data, error } = await supabase
      .from("promo_codes")
      .update({
        code: input.code.toUpperCase(),
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        min_order_amount: input.min_order_amount ?? null,
        usage_limit: input.usage_limit ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        is_active: input.is_active ?? 1,
        first_order_only_check: input.first_order_only_check ?? false,
        one_use_per_phone: input.one_use_per_phone ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new PromotionServiceError("Failed to update promo code", error);
    return data as PromoCode;
  },

  async deletePromoCode(id: string): Promise<void> {
    const { error } = await supabase
      .from("promo_codes")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new PromotionServiceError("Failed to delete promo code", error);
  },

  // ── Quick Promotions ─────────────────────────

  async getQuickPromotions(promoType?: string): Promise<QuickPromotion[]> {
    let query = supabase
      .from("quick_promotions")
      .select("*")
      .eq("is_active", 1)
      .order("priority", { ascending: false });

    if (promoType) {
      query = query.eq("promo_type", promoType);
    }

    const { data, error } = await query;
    if (error) throw new PromotionServiceError("Failed to fetch quick promotions", error);
    return data as QuickPromotion[];
  },

  async createQuickPromotion(input: QuickPromotionInput): Promise<QuickPromotion> {
    const { data, error } = await supabase
      .from("quick_promotions")
      .insert({
        promo_type: input.promo_type,
        name_en: input.name_en,
        name_ar: input.name_ar || input.name_en,
        badge_text_en: input.badge_text_en ?? null,
        badge_text_ar: input.badge_text_ar ?? input.badge_text_en ?? null,
        product_ids: input.product_ids ?? null,
        category_ids: input.category_ids ?? null,
        min_amount: input.min_amount ?? null,
        discount_type: input.discount_type ?? null,
        discount_value: input.discount_value ?? null,
        applies_to: input.applies_to ?? "all",
        buy_quantity: input.buy_quantity ?? null,
        get_quantity: input.get_quantity ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        is_active: input.is_active ?? 1,
        priority: input.priority ?? 0,
        show_in_cart: input.show_in_cart ?? 1,
        show_in_product: input.show_in_product ?? 0,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) throw new PromotionServiceError("Failed to create quick promotion", error);
    return data as QuickPromotion;
  },

  async updateQuickPromotion(id: string, input: Partial<QuickPromotionInput>): Promise<QuickPromotion> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name_en !== undefined) updateData.name_en = input.name_en;
    if (input.name_ar !== undefined) updateData.name_ar = input.name_ar || input.name_en;
    if (input.badge_text_en !== undefined) updateData.badge_text_en = input.badge_text_en;
    if (input.badge_text_ar !== undefined) updateData.badge_text_ar = input.badge_text_ar;
    if (input.product_ids !== undefined) updateData.product_ids = input.product_ids;
    if (input.min_amount !== undefined) updateData.min_amount = input.min_amount;
    if (input.discount_type !== undefined) updateData.discount_type = input.discount_type;
    if (input.discount_value !== undefined) updateData.discount_value = input.discount_value;
    if (input.applies_to !== undefined) updateData.applies_to = input.applies_to;
    if (input.start_date !== undefined) updateData.start_date = input.start_date;
    if (input.end_date !== undefined) updateData.end_date = input.end_date;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.show_in_cart !== undefined) updateData.show_in_cart = input.show_in_cart;
    if (input.show_in_product !== undefined) updateData.show_in_product = input.show_in_product;

    const { data, error } = await supabase
      .from("quick_promotions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new PromotionServiceError("Failed to update quick promotion", error);
    return data as QuickPromotion;
  },

  async deactivateQuickPromotion(id: string): Promise<void> {
    const { error } = await supabase
      .from("quick_promotions")
      .update({ is_active: 0, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new PromotionServiceError("Failed to deactivate quick promotion", error);
  },

  // ── Storefront ───────────────────────────────

  async validatePromoCode(code: string, cartSubtotal: number, context?: { sessionId?: string; phoneNumber?: string }): Promise<ValidationResult> {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", 1)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return { valid: false, errorCode: "NOT_FOUND", errorMessage: "Invalid or expired promo code" };
    }

    const promo = data as PromoCode;
    const now = new Date();

    // Check date range
    if (promo.start_date && new Date(promo.start_date) > now) {
      return { valid: false, errorCode: "INACTIVE", errorMessage: "This promo code is not active yet" };
    }
    if (promo.end_date && new Date(promo.end_date) < now) {
      return { valid: false, errorCode: "EXPIRED", errorMessage: "This promo code has expired" };
    }

    // Check usage limit
    if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
      return { valid: false, errorCode: "USAGE_LIMIT", errorMessage: "This promo code has reached its usage limit" };
    }

    // Check minimum order amount
    if (promo.min_order_amount !== null && cartSubtotal < promo.min_order_amount) {
      return {
        valid: false,
        errorCode: "MIN_ORDER",
        errorMessage: `Minimum order of ${promo.min_order_amount} EGP required for this code`,
      };
    }

    // ── First Order Check (session + phone) ──────────────────────────────
    if (promo.first_order_only_check && context) {
      const conditions: string[] = [];

      if (context.sessionId) conditions.push(`session_id.eq.${context.sessionId}`);
      if (context.phoneNumber) conditions.push(`phone_number.eq.${context.phoneNumber}`);

      if (conditions.length > 0) {
        const { count } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .or(conditions.join(","));

        if ((count ?? 0) > 0) {
          return {
            valid: false,
            errorCode: "NOT_FOUND",
            errorMessage: "This code is only valid for first-time orders",
          };
        }
      }
    }

    // ── One Use Per Phone ────────────────────────────────────────────────
    if (promo.one_use_per_phone && context?.phoneNumber) {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("phone_number", context.phoneNumber)
        .eq("discount_code", promo.code);

      if ((count ?? 0) > 0) {
        return {
          valid: false,
          errorCode: "USAGE_LIMIT",
          errorMessage: "This code has already been used with this phone number",
        };
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (promo.discount_type === "percentage") {
      discountAmount = cartSubtotal * (promo.discount_value / 100);
    } else {
      discountAmount = promo.discount_value;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);

    return {
      valid: true,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      discountAmount,
      promoCodeId: promo.id,
    };
  },

  async getActiveQuickPromotions(): Promise<QuickPromotion[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("quick_promotions")
      .select("*")
      .eq("is_active", 1)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("priority", { ascending: false });

    if (error) throw new PromotionServiceError("Failed to fetch active quick promotions", error);
    return data as QuickPromotion[];
  },

  async incrementUsage(promoCodeId: string): Promise<void> {
    // Read current count then increment (safe for low-concurrency storefront)
    const { data: current, error: fetchError } = await supabase
      .from("promo_codes")
      .select("usage_count")
      .eq("id", promoCodeId)
      .single();

    if (fetchError || !current) {
      throw new PromotionServiceError("Failed to fetch promo code for usage increment", fetchError);
    }

    const { error } = await supabase
      .from("promo_codes")
      .update({
        usage_count: (current.usage_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", promoCodeId);

    if (error) throw new PromotionServiceError("Failed to increment promo code usage", error);
  },
};
