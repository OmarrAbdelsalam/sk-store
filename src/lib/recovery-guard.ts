import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CUSTOMER_WINDOW_HOURS } from "@/lib/order-emails-config";

/**
 * The one place that answers "have we already dealt with this person?"
 *
 * There are two ways to chase someone — an abandoned order and an abandoned
 * cart — and they read different tables. If each enforced its own rules, the
 * same customer would get an email from the cart list and another from the
 * order list for the same shopping trip, and nothing in either flow would know
 * the other had fired. Both call this instead.
 *
 * The window is centred on the moment the customer walked away, not on now, so
 * the question is always "what else happened around this", never "what has this
 * person ever done". A regular who buys every month falls outside it and gets
 * chased normally next time.
 *
 * Loading and judging are separate on purpose. The admin list asks about fifty
 * orders at once; doing it one at a time would be a hundred round trips to
 * answer a question that three cover.
 */

export type RecoveryIdentity = {
  /** Normalised phone — the reliable key. Maintained by trigger on both tables. */
  phoneNorm: string | null;
  /** Fallback for rows that only ever captured an address. */
  email: string | null;
  /** When the abandonment happened; the window sits either side of it. */
  at: string;
  /** The order being considered, so it doesn't block itself. */
  excludeOrderId?: string;
  /** The cart being considered, so it doesn't block itself. */
  excludeSessionId?: string;
  /**
   * Which channel is being considered. Email and WhatsApp are different
   * conversations — a customer may get both — so "already chased" is asked per
   * channel. Every other rule here is shared.
   */
  channel: "email" | "whatsapp";
};

export type GuardVerdict =
  | { blocked: false }
  | { blocked: true; code: string; message: string };

type WindowOrder = {
  id: string;
  order_number: string;
  created_at: string;
  payment_status: string | null;
  recovery_email_sent_at: string | null;
  recovery_whatsapp_sent_at: string | null;
  phone_norm: string | null;
  email: string | null;
};

type WindowCart = {
  session_id: string;
  recovery_email_sent_at: string | null;
  recovery_whatsapp_sent_at: string | null;
  phone_norm: string | null;
  email: string | null;
};

export type CustomerWindowContext = {
  orders: WindowOrder[];
  carts: WindowCart[];
  /** Set when a lookup failed, so callers refuse rather than send blind. */
  failed?: string;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "an earlier date";
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Africa/Cairo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Two rows belong to the same person if the phone matches, else the email. */
function sameCustomer(
  identity: RecoveryIdentity,
  row: { phone_norm: string | null; email: string | null }
): boolean {
  if (identity.phoneNorm) return row.phone_norm === identity.phoneNorm;
  if (identity.email) return (row.email || "").toLowerCase() === identity.email.toLowerCase();
  return false;
}

/**
 * Fetches everything the given identities could possibly be blocked by, in a
 * fixed number of queries however many are asked about.
 */
export async function loadCustomerWindowContext(
  identities: RecoveryIdentity[]
): Promise<CustomerWindowContext> {
  const usable = identities.filter((i) => i.phoneNorm || i.email);
  if (!usable.length) return { orders: [], carts: [] };

  const windowMs = CUSTOMER_WINDOW_HOURS * 3600_000;
  const times = usable.map((i) => new Date(i.at).getTime()).filter(Number.isFinite);
  if (!times.length) return { orders: [], carts: [] };

  // One span covering every identity's window. Wider than any single one, so
  // each verdict still has to re-check its own bounds in memory.
  const from = new Date(Math.min(...times) - windowMs).toISOString();
  const to = new Date(Math.max(...times) + windowMs).toISOString();

  const phones = Array.from(
    new Set(usable.map((i) => i.phoneNorm).filter(Boolean) as string[])
  );
  const emails = Array.from(
    new Set(
      usable
        .filter((i) => !i.phoneNorm && i.email)
        .map((i) => (i.email as string).toLowerCase())
    )
  );

  const orders: WindowOrder[] = [];
  const carts: WindowCart[] = [];

  const orderColumns =
    "id, order_number, created_at, payment_status, recovery_email_sent_at, recovery_whatsapp_sent_at, phone_norm, email";

  if (phones.length) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(orderColumns)
      .in("phone_norm", phones)
      .gte("created_at", from)
      .lte("created_at", to);
    if (error) {
      console.error("Recovery guard: order lookup failed", error.message);
      return { orders: [], carts: [], failed: error.message };
    }
    orders.push(...((data as unknown as WindowOrder[]) || []));
  }

  if (emails.length) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(orderColumns)
      .in("email", emails)
      .gte("created_at", from)
      .lte("created_at", to);
    if (error) {
      console.error("Recovery guard: order lookup by email failed", error.message);
      return { orders: [], carts: [], failed: error.message };
    }
    orders.push(...((data as unknown as WindowOrder[]) || []));
  }

  const cartColumns =
    "session_id, recovery_email_sent_at, recovery_whatsapp_sent_at, phone_norm, email";
  const cartKeys = [...phones.map((p) => ({ phone: p })), ...emails.map((e) => ({ email: e }))];

  if (cartKeys.length) {
    // Both channels are fetched and filtered in memory: a single query can't
    // express "either column is inside the window" without an OR that collides
    // with the identity OR below.
    let query = supabaseAdmin
      .from("abandoned_carts")
      .select(cartColumns)
      .or("recovery_email_sent_at.not.is.null,recovery_whatsapp_sent_at.not.is.null");

    // One OR filter rather than a query per key — the whole point of batching.
    const or = [
      phones.length ? `phone_norm.in.(${phones.join(",")})` : "",
      emails.length ? `email.in.(${emails.join(",")})` : "",
    ]
      .filter(Boolean)
      .join(",");

    if (or) query = query.or(or);

    const { data, error } = await query;
    if (error) {
      console.error("Recovery guard: cart lookup failed", error.message);
      return { orders: [], carts: [], failed: error.message };
    }
    carts.push(...((data as unknown as WindowCart[]) || []));
  }

  return { orders, carts };
}

/**
 * The rules themselves. Pure — every caller feeds it the same context shape,
 * so the single-order check and the fifty-row list can never drift apart.
 */
export function evaluateCustomerWindow(
  identity: RecoveryIdentity,
  context: CustomerWindowContext
): GuardVerdict {
  if (context.failed) {
    return {
      blocked: true,
      code: "check-failed",
      message: "Couldn't check this customer's recent activity. Try again in a moment.",
    };
  }

  if (!identity.phoneNorm && !identity.email) return { blocked: false };

  const centre = new Date(identity.at).getTime();
  const windowMs = CUSTOMER_WINDOW_HOURS * 3600_000;

  const orders = context.orders.filter(
    (o) =>
      o.id !== identity.excludeOrderId &&
      sameCustomer(identity, o) &&
      Math.abs(new Date(o.created_at).getTime() - centre) <= windowMs
  );

  // Paid anything nearby → they are a customer, not a lost sale. Offering a
  // discount now tells someone who paid full price that they missed money.
  const paid = orders.find((o) => ["paid", "delivered"].includes(String(o.payment_status)));
  if (paid) {
    return {
      blocked: true,
      code: "customer-paid-recently",
      message: `This customer paid order ${paid.order_number} on ${formatDate(paid.created_at)} — within ${CUSTOMER_WINDOW_HOURS} hours of this one. Chasing it would offer a discount on something they've already bought.`,
    };
  }

  // Placed something later, paid or not — they came back on their own.
  const later = orders
    .filter((o) => new Date(o.created_at).getTime() > centre)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
  if (later) {
    return {
      blocked: true,
      code: "superseded",
      message: `The customer went on to place order ${later.order_number} on ${formatDate(later.created_at)}. That's the live one — chase it there, not here.`,
    };
  }

  // Per channel from here down. Email and WhatsApp may both reach the same
  // person; what must not happen is the same one arriving twice.
  const channelLabel = identity.channel === "whatsapp" ? "WhatsApp message" : "email follow-up";
  const sentAt = (row: { recovery_email_sent_at: string | null; recovery_whatsapp_sent_at: string | null }) =>
    identity.channel === "whatsapp" ? row.recovery_whatsapp_sent_at : row.recovery_email_sent_at;

  const chasedOrder = orders.find((o) => sentAt(o));
  if (chasedOrder) {
    return {
      blocked: true,
      code: "customer-already-chased",
      message: `A ${channelLabel} already went to this customer on ${formatDate(sentAt(chasedOrder))} for order ${chasedOrder.order_number}. One per channel per ${CUSTOMER_WINDOW_HOURS} hours.`,
    };
  }

  // The half a per-flow rule would miss: chased on a phone, then an order
  // abandoned on a laptop, or the other way round.
  const chasedCart = context.carts.find((c) => {
    if (c.session_id === identity.excludeSessionId) return false;
    if (!sameCustomer(identity, c)) return false;
    const at = sentAt(c);
    return Boolean(at) && Math.abs(new Date(at as string).getTime() - centre) <= windowMs;
  });
  if (chasedCart) {
    return {
      blocked: true,
      code: "customer-already-chased",
      message: `A cart ${channelLabel} already went to this customer on ${formatDate(sentAt(chasedCart))} — within ${CUSTOMER_WINDOW_HOURS} hours of this one. Same person, same shopping trip.`,
    };
  }

  return { blocked: false };
}

/** Single-identity convenience: load then judge. */
export async function checkCustomerWindow(
  identity: RecoveryIdentity
): Promise<GuardVerdict> {
  const context = await loadCustomerWindowContext([identity]);
  return evaluateCustomerWindow(identity, context);
}
