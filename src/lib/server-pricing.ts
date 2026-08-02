import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getShippingPrice } from "@/lib/checkout-utils";
import { promotionService } from "@/services/promotions";
import type { AppliedPromotion } from "@/lib/localStorage";

/**
 * Recomputes an order's money from the database.
 *
 * The browser sends what it *thinks* the order costs. None of that is trusted:
 * item prices, shipping, discounts and the total are all derived here from the
 * products and promotions tables. Without this, a tampered checkout request can
 * order anything for any price — the gateway charges what it's told, and the
 * callback marks the order paid.
 */

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_DISTINCT_ITEMS = 50;

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export type RequestedItem = {
  productId?: string;
  quantity?: number;
  colorId?: string;
  colorName?: string;
  sizeId?: string;
  sizeName?: string;
  image?: string;
};

export type PricedItem = {
  productId: string;
  productName: string;
  productNameAr?: string;
  productImage?: string;
  colorId?: string;
  colorName?: string;
  sizeId?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
};

export type PricedOrder = {
  items: PricedItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  discountCode?: string;
  bogoDiscount: number;
  appliedPromotions: AppliedPromotion[];
  total: number;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function priceOrder(input: {
  items: RequestedItem[];
  governorate: string;
  city?: string;
  discountCode?: string;
  sessionId?: string;
  phoneNumber?: string;
}): Promise<PricedOrder> {
  const { items, governorate, city = "", discountCode, sessionId, phoneNumber } = input;

  if (!Array.isArray(items) || items.length === 0) {
    throw new PricingError("Cart is empty");
  }
  if (items.length > MAX_DISTINCT_ITEMS) {
    throw new PricingError("Too many items in cart");
  }

  // ── Quantities ──────────────────────────────────────────────────────────────
  // Anything non-integer, zero, negative or absurd is rejected outright rather
  // than coerced — a negative quantity would subtract from the total.
  const normalized = items.map((item) => {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw new PricingError("Invalid item quantity");
    }
    if (!item.productId || typeof item.productId !== "string") {
      throw new PricingError("Every item must reference a product");
    }
    return { ...item, productId: item.productId, quantity };
  });

  // ── Authoritative prices ────────────────────────────────────────────────────
  const productIds = [...new Set(normalized.map((i) => i.productId))];

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, name_en, name_ar, base_price, is_active, deleted_at")
    .in("id", productIds);

  if (error) throw new PricingError(`Could not load products: ${error.message}`);

  const byId = new Map((products || []).map((p: any) => [p.id, p]));

  const priced: PricedItem[] = normalized.map((item) => {
    const product: any = byId.get(item.productId);

    // A product that no longer exists, is deactivated or soft-deleted must not
    // be purchasable — otherwise a stale or forged cart can still order it.
    if (!product || product.deleted_at || product.is_active === 0) {
      throw new PricingError("One or more products are no longer available");
    }

    const unitPrice = Number(product.base_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new PricingError("One or more products have an invalid price");
    }

    return {
      productId: item.productId,
      productName: product.name_en || "",
      productNameAr: product.name_ar || undefined,
      productImage: item.image,
      colorId: item.colorId,
      colorName: item.colorName,
      sizeId: item.sizeId,
      sizeName: item.sizeName,
      quantity: item.quantity,
      unitPrice,
    };
  });

  const subtotal = round2(
    priced.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  );

  // ── Automatic promotions ────────────────────────────────────────────────────
  // Mirrors the client-side rules in useCart so a legitimate customer is charged
  // exactly what they were shown — the difference is that here the promotion is
  // read from the database instead of being asserted by the browser.
  const appliedPromotions: AppliedPromotion[] = [];
  let bogoDiscount = 0;
  let freeShipping = false;

  let activePromotions: any[] = [];
  try {
    activePromotions = await promotionService.getActiveQuickPromotions(supabaseAdmin);
  } catch (err) {
    // A promotions outage must not silently drop a discount the customer was
    // shown, nor invent one. Falling through with none applied is the safe
    // direction: the order is priced at full value and can be adjusted.
    console.error("Could not load active promotions while pricing order:", err);
  }

  const bogoPromos = activePromotions
    .filter((p) => p.promo_type === "buy_x_get_y_free")
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const promo of bogoPromos) {
    let eligibleIds: string[] = [];
    try {
      eligibleIds = JSON.parse(promo.product_ids || "[]");
    } catch {
      continue;
    }

    const eligible = priced.filter((i) => eligibleIds.includes(i.productId));
    // Quantity, not line count: two of the same product still qualifies.
    const eligibleUnits = eligible.reduce((n, i) => n + i.quantity, 0);

    if (eligibleUnits >= 2) {
      const cheapest = eligible.reduce((min, i) => (i.unitPrice < min.unitPrice ? i : min));
      bogoDiscount = round2(cheapest.unitPrice);
      appliedPromotions.push({
        type: "bogo",
        promotionId: promo.id,
        name: promo.name_en,
        amountSaved: bogoDiscount,
      } as AppliedPromotion);
      break; // one BOGO at a time
    }
  }

  const freeShippingPromo = activePromotions.find(
    (p) => p.promo_type === "free_shipping_min_amount"
  );
  if (freeShippingPromo && subtotal >= (freeShippingPromo.min_amount ?? 0)) {
    freeShipping = true;
  }

  const baseShipping = getShippingPrice(governorate, city);
  const shippingCost = freeShipping ? 0 : baseShipping;

  if (freeShipping && freeShippingPromo) {
    appliedPromotions.push({
      type: "free_shipping",
      promotionId: freeShippingPromo.id,
      name: freeShippingPromo.name_en,
      amountSaved: baseShipping,
    } as AppliedPromotion);
  }

  // ── Promo code ──────────────────────────────────────────────────────────────
  // Revalidated here, against the real subtotal. The browser's claimed discount
  // is ignored entirely, and usage limits / first-order / one-per-phone rules
  // are enforced server-side where they cannot be skipped.
  let discountAmount = 0;
  let appliedCode: string | undefined;

  if (discountCode && typeof discountCode === "string") {
    try {
      const result = await promotionService.validatePromoCode(
        discountCode,
        subtotal,
        { sessionId, phoneNumber },
        supabaseAdmin
      );

      if (result.valid && result.discountAmount) {
        discountAmount = round2(result.discountAmount);
        appliedCode = discountCode.toUpperCase();
        appliedPromotions.push({
          type: "promo_code",
          promotionId: result.promoCodeId,
          name: appliedCode,
          amountSaved: discountAmount,
        } as AppliedPromotion);
      }
      // An invalid code is simply not applied. Rejecting the whole order would
      // strand a customer whose code expired between opening checkout and
      // submitting it.
    } catch (err) {
      console.error("Promo code validation failed while pricing order:", err);
    }
  }

  const total = round2(
    Math.max(0, subtotal + shippingCost - discountAmount - bogoDiscount)
  );

  return {
    items: priced,
    subtotal,
    shippingCost,
    discountAmount,
    discountCode: appliedCode,
    bogoDiscount,
    appliedPromotions,
    total,
  };
}
