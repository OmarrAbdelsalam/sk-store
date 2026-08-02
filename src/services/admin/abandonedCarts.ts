import { supabase } from "@/lib/supabaseClient";
import { CONTACT_INFO } from "@/lib/constants";

/**
 * Abandoned carts + product cart stats for the admin panel.
 *
 * Everything is aggregated in Postgres rather than pulled into the browser:
 * PostgREST caps plain selects at 1000 rows, so a client-side sum goes quietly
 * wrong once the store passes that — the numbers still render, they're just
 * false.
 */

export type AbandonedCartItem = {
  productId: string | null;
  name: string | null;
  color: string | null;
  quantity: number;
  price: number;
  image: string | null;
};

export type AbandonedCart = {
  sessionId: string;
  customerName: string | null;
  phone: string | null;
  phoneNorm: string | null;
  email: string | null;
  government: string | null;
  items: AbandonedCartItem[];
  itemCount: number;
  subtotal: number;
  furthestStage: string;
  hasContact: boolean;
  status: string;
  contactCount: number;
  contactedAt: string | null;
  lastActivityAt: string;
  isKnownCustomer: boolean;
};

export type AbandonedSummary = {
  openCarts: number;
  contactable: number;
  stuckValue: number;
  contactableValue: number;
  recovered: number;
  recoveredValue: number;
  avgCartValue: number;
};

export type ProductCartStat = {
  productId: string;
  productName: string | null;
  addedToCart: number;
  removedFromCart: number;
  purchased: number;
  cartToPurchase: number;
  inAbandoned: number;
  stuckValue: number;
};

/** Minutes of inactivity before a cart counts as abandoned. */
export const STALE_AFTER_MINUTES = 30;

function rangeFor(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export const abandonedCartsService = {
  async getSummary(days = 30): Promise<AbandonedSummary> {
    const { from, to } = rangeFor(days);
    const { data, error } = await supabase.rpc("analytics_abandoned_summary", {
      p_from: from,
      p_to: to,
      p_stale_after: STALE_AFTER_MINUTES,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return {
      openCarts: Number(row?.open_carts ?? 0),
      contactable: Number(row?.contactable ?? 0),
      stuckValue: Number(row?.stuck_value ?? 0),
      contactableValue: Number(row?.contactable_value ?? 0),
      recovered: Number(row?.recovered ?? 0),
      recoveredValue: Number(row?.recovered_value ?? 0),
      avgCartValue: Number(row?.avg_cart_value ?? 0),
    };
  },

  async getList(days = 30, onlyContactable = false): Promise<AbandonedCart[]> {
    const { from, to } = rangeFor(days);
    const { data, error } = await supabase.rpc("analytics_abandoned_list", {
      p_from: from,
      p_to: to,
      p_stale_after: STALE_AFTER_MINUTES,
      p_only_contactable: onlyContactable,
      p_limit: 200,
    });
    if (error) throw error;

    return (data || []).map((row: any) => ({
      sessionId: row.session_id,
      customerName: row.customer_name,
      phone: row.phone,
      phoneNorm: row.phone_norm,
      email: row.email,
      government: row.government,
      items: Array.isArray(row.items) ? row.items : [],
      itemCount: Number(row.item_count ?? 0),
      subtotal: Number(row.subtotal ?? 0),
      furthestStage: row.furthest_stage,
      hasContact: Boolean(row.has_contact),
      status: row.status,
      contactCount: Number(row.contact_count ?? 0),
      contactedAt: row.contacted_at,
      lastActivityAt: row.last_activity_at,
      isKnownCustomer: Boolean(row.is_known_customer),
    }));
  },

  async getProductCartStats(days = 30): Promise<ProductCartStat[]> {
    const { from, to } = rangeFor(days);
    const { data, error } = await supabase.rpc("analytics_product_cart_stats", {
      p_from: from,
      p_to: to,
    });
    if (error) throw error;

    return (data || []).map((row: any) => ({
      productId: row.product_id,
      productName: row.product_name,
      addedToCart: Number(row.added_to_cart ?? 0),
      removedFromCart: Number(row.removed_from_cart ?? 0),
      purchased: Number(row.purchased ?? 0),
      cartToPurchase: Number(row.cart_to_purchase ?? 0),
      inAbandoned: Number(row.in_abandoned ?? 0),
      stuckValue: Number(row.stuck_value ?? 0),
    }));
  },

  async markContacted(sessionId: string): Promise<void> {
    const { error } = await supabase.rpc("analytics_mark_cart_contacted", {
      p_session_id: sessionId,
    });
    if (error) throw error;
  },
};

/**
 * Build the follow-up message. Naming the actual bag matters — a generic "you
 * left something behind" reads as a mass blast and gets ignored.
 */
export function buildRecoveryLink(cart: AbandonedCart): string {
  const digits = (cart.phoneNorm || cart.phone || "").replace(/\D/g, "");
  const first = (cart.customerName || "").trim().split(/\s+/)[0];
  const productNames = cart.items
    .map((i) => i.name)
    .filter(Boolean)
    .slice(0, 3)
    .join("، ");

  const greeting = first ? `أهلاً ${first}` : "أهلاً";
  const what = productNames ? ` على ${productNames}` : "";

  const message =
    `${greeting} 👋\n` +
    `لاحظنا إنك سبتي طلبك${what} من غير ما تكمليه.\n` +
    `لو محتاجة أي مساعدة أو عندك أي سؤال، إحنا هنا.\n` +
    `${CONTACT_INFO.whatsappLink}`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
