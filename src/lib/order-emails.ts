import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail, emailEnabled, EMAIL_ADMIN } from "@/lib/email";
import { orderConfirmationEmail, type EmailOrder } from "@/lib/email-templates";
import { siteUrl } from "@/lib/site";

/**
 * Everything the templates read, in one query. Selected explicitly rather than
 * with `*` so a new column never silently ends up in a customer's inbox.
 */
const ORDER_EMAIL_SELECT = `
  id, order_number, customer_name, email, locale, phone_number,
  created_at, government, city, detailed_address,
  subtotal, shipping_cost, discount_amount, total,
  payment_plan, deposit_amount, remaining_amount,
  payment_status, easykash_customer_ref, easykash_voucher,
  easykash_provider, easykash_payment_method,
  items:order_items (
    product_name, product_name_ar, product_image,
    color_name, size_name, quantity, unit_price, total_price
  )
`;

export type OrderEmailOutcome = {
  sent: boolean;
  /** Why nothing was sent — for the sweep's log, not for the customer. */
  reason?: "disabled" | "already-sent" | "no-address" | "not-found" | "send-failed";
};

type OrderEmailRow = EmailOrder & {
  id: string;
  email?: string | null;
  locale?: string | null;
  created_at?: string | null;
  payment_status?: string | null;
  easykash_customer_ref?: string | null;
};

/**
 * The emails themselves are English only. The locale still decides which
 * version of the site a link lands on, so an Arabic shopper who taps through
 * doesn't get bounced to a language they didn't choose.
 */
function resolveLocale(value: string | null | undefined): "ar" | "en" {
  return value === "en" ? "en" : "ar";
}

/**
 * Takes the right to send one email of this kind for this order, atomically.
 *
 * Three code paths can settle a payment — the gateway callback, the
 * success-page status poll, and the reconcile sweep — and they can run at the
 * same moment for the same order. A read-then-send would let two of them both
 * see "not sent yet". A single UPDATE with a NULL guard cannot: Postgres hands
 * the row to exactly one of them, and everyone else gets no rows back.
 */
async function claim(
  orderId: string,
  column: "confirmation_email_sent_at"
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ [column]: new Date().toISOString() })
    .eq("id", orderId)
    .is(column, null)
    .select("id");

  if (error) {
    console.error(`Email claim failed (${column}):`, error.message);
    return false;
  }

  return Boolean(data?.length);
}

/** Hands the claim back so a later sweep retries — used only when sending failed. */
async function release(
  orderId: string,
  column: "confirmation_email_sent_at"
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ [column]: null })
    .eq("id", orderId);

  if (error) console.error(`Email claim release failed (${column}):`, error.message);
}

async function loadOrder(orderId: string): Promise<OrderEmailRow | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_EMAIL_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Order email load failed:", error.message);
    return null;
  }

  return (data as unknown as OrderEmailRow) || null;
}

/**
 * Order confirmation — sent once, after the payment has been verified.
 *
 * Safe to call from every path that can settle a payment; only the first one
 * to get there actually sends. Never throws: the payment is already recorded
 * by the time this runs, and no mail failure may undo that.
 */
export async function sendOrderConfirmation(orderId: string): Promise<OrderEmailOutcome> {
  if (!emailEnabled) return { sent: false, reason: "disabled" };

  try {
    if (!(await claim(orderId, "confirmation_email_sent_at"))) {
      return { sent: false, reason: "already-sent" };
    }

    const order = await loadOrder(orderId);
    if (!order) {
      await release(orderId, "confirmation_email_sent_at");
      return { sent: false, reason: "not-found" };
    }

    // Checkout requires an email, but orders placed before that rule — or by
    // hand in the admin panel — have none. Nothing to retry, so the claim
    // stays taken rather than making every sweep reconsider this row.
    if (!order.email) return { sent: false, reason: "no-address" };

    const locale = resolveLocale(order.locale);
    const trackUrl = order.easykash_customer_ref
      ? `${siteUrl}/${locale}/order-success?ref=${encodeURIComponent(String(order.easykash_customer_ref))}`
      : `${siteUrl}/${locale}`;

    const { subject, html, text } = orderConfirmationEmail(order, trackUrl);

    const result = await sendEmail({
      to: order.email,
      subject,
      html,
      text,
      kind: "order_confirmation",
      orderId: order.id,
      bcc: EMAIL_ADMIN ? [EMAIL_ADMIN] : undefined,
    });

    if (!result.sent) {
      await release(orderId, "confirmation_email_sent_at");
      return { sent: false, reason: "send-failed" };
    }

    return { sent: true };
  } catch (error: any) {
    console.error("sendOrderConfirmation failed:", error?.message);
    await release(orderId, "confirmation_email_sent_at").catch(() => {});
    return { sent: false, reason: "send-failed" };
  }
}
