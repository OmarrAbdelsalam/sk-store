import "server-only";

import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail, emailEnabled } from "@/lib/email";
import { orderRecoveryEmail, type EmailOrder } from "@/lib/email-templates";
import { siteUrl } from "@/lib/site";
import {
  checkCustomerWindow,
  loadCustomerWindowContext,
  evaluateCustomerWindow,
} from "@/lib/recovery-guard";
import { buildOrderWhatsAppMessage } from "@/lib/whatsapp-messages";
import {
  RECOVERY_EMAIL_ENABLED,
  RECOVERY_DISCOUNT_ENABLED,
  RECOVERY_DISCOUNT_MAX_PERCENT,
  RECOVERY_MIN_AGE_MINUTES,
  CUSTOMER_WINDOW_HOURS,
} from "@/lib/order-emails-config";

const ORDER_SELECT = `
  id, order_number, customer_name, email, locale, phone_number, phone_norm,
  created_at, status, payment_status, government, city, detailed_address,
  subtotal, shipping_cost, discount_amount, total,
  payment_plan, deposit_amount, remaining_amount,
  easykash_customer_ref, easykash_voucher, easykash_provider,
  recovery_token, recovery_email_sent_at, recovery_whatsapp_sent_at,
  recovery_discount_amount,
  recovery_discount_percent, recovery_original_total, session_id,
  items:order_items (
    product_name, product_name_ar, product_image,
    color_name, size_name, quantity, unit_price, total_price
  )
`;

export type RecoveryChannel = "email" | "whatsapp";

export type RecoveryBlockCode =
  | "emails-not-configured"
  | "recovery-disabled"
  | "order-not-found"
  | "order-cancelled"
  | "already-paid"
  | "no-email-address"
  | "already-sent"
  | "customer-already-chased"
  | "customer-paid-recently"
  | "superseded"
  | "too-new"
  | "check-failed";

export type RecoveryEligibility = {
  canSend: boolean;
  code: RecoveryBlockCode | "ok";
  /** Written for the admin reading it in the panel, not for the customer. */
  message: string;
  /** Everything the panel needs to render the control without a second call. */
  order?: {
    id: string;
    orderNumber: string;
    email: string | null;
    total: number;
    subtotal: number;
    paymentStatus: string | null;
    createdAt: string | null;
    recoverySentAt: string | null;
    recoveryDiscountPercent: number | null;
    recoveryDiscountAmount: number | null;
  };
  discountAllowed: boolean;
  maxDiscountPercent: number;
  /** WhatsApp needs a number; the panel greys its button out without one. */
  hasPhone: boolean;
};

type OrderRow = EmailOrder & Record<string, any>;

function formatDate(value: string | null | undefined): string {
  if (!value) return "an earlier date";
  // Cairo time: the admin reading this is looking at the same clock the
  // customer was.
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Africa/Cairo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadOrder(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Recovery: order load failed", error.message);
    return null;
  }
  return (data as unknown as OrderRow) || null;
}

function shell(
  canSend: boolean,
  code: RecoveryEligibility["code"],
  message: string,
  order?: OrderRow
): RecoveryEligibility {
  return {
    canSend,
    code,
    message,
    discountAllowed: RECOVERY_DISCOUNT_ENABLED,
    maxDiscountPercent: RECOVERY_DISCOUNT_MAX_PERCENT,
    hasPhone: Boolean(order?.phone_number),
    order: order
      ? {
          id: order.id,
          orderNumber: order.order_number,
          email: order.email ?? null,
          total: Number(order.total || 0),
          subtotal: Number(order.subtotal || 0),
          paymentStatus: order.payment_status ?? null,
          createdAt: order.created_at ?? null,
          recoverySentAt: order.recovery_email_sent_at ?? null,
          recoveryDiscountPercent:
            order.recovery_discount_percent != null
              ? Number(order.recovery_discount_percent)
              : null,
          recoveryDiscountAmount:
            order.recovery_discount_amount != null
              ? Number(order.recovery_discount_amount)
              : null,
        }
      : undefined,
  };
}

/**
 * Answers one question: may we email this customer a follow-up right now, and
 * if not, why not.
 *
 * Every refusal carries a sentence the admin can act on, because a disabled
 * button with no explanation is how someone ends up chasing a paying customer
 * through WhatsApp instead.
 */
export async function checkRecoveryEligibility(
  orderId: string,
  channel: RecoveryChannel = "email"
): Promise<RecoveryEligibility> {
  if (!RECOVERY_EMAIL_ENABLED) {
    return shell(
      false,
      "recovery-disabled",
      "Recovery emails are switched off in the code (RECOVERY_EMAIL_ENABLED)."
    );
  }

  if (!emailEnabled) {
    return shell(
      false,
      "emails-not-configured",
      "Email isn't configured on the server — RESEND_API_KEY and EMAIL_FROM need to be set."
    );
  }

  const order = await loadOrder(orderId);
  if (!order) {
    return shell(false, "order-not-found", "This order no longer exists.");
  }

  if (String(order.status).toLowerCase() === "cancelled") {
    return shell(false, "order-cancelled", "This order was cancelled.", order);
  }

  const paid = ["paid", "delivered", "refunded"].includes(
    String(order.payment_status)
  );
  if (paid) {
    return shell(
      false,
      "already-paid",
      `Nothing to chase — this order is already marked "${order.payment_status}".`,
      order
    );
  }

  if (!order.email) {
    return shell(
      false,
      "no-email-address",
      "This order has no email address on it, so there's nowhere to send the follow-up. Reach out on WhatsApp instead.",
      order
    );
  }

  // Per channel: the customer may get both an email and a WhatsApp message,
  // but never the same one twice.
  const sentAt =
    channel === "whatsapp"
      ? order.recovery_whatsapp_sent_at
      : order.recovery_email_sent_at;

  if (sentAt) {
    return shell(
      false,
      "already-sent",
      `A ${channel === "whatsapp" ? "WhatsApp message" : "follow-up email"} already went out for this order on ${formatDate(sentAt)}.`,
      order
    );
  }

  if (channel === "whatsapp" && !order.phone_number) {
    return shell(
      false,
      "no-email-address",
      "This order has no phone number, so there's nowhere to send a WhatsApp message.",
      order
    );
  }

  const ageMinutes = (Date.now() - new Date(order.created_at).getTime()) / 60_000;
  if (ageMinutes < RECOVERY_MIN_AGE_MINUTES) {
    const wait = Math.ceil(RECOVERY_MIN_AGE_MINUTES - ageMinutes);
    return shell(
      false,
      "too-new",
      `This order is only ${Math.floor(ageMinutes)} minute(s) old — the customer may still be on the payment page. Try again in about ${wait} minute(s).`,
      order
    );
  }

  // ── Everything below is about the customer, not this row ─────────────────
  // Shared with the cart flow on purpose. If each kept its own copy of these
  // rules, the same person could be chased once from the abandoned-cart list
  // and once from here for the same shopping trip.
  const verdict = await checkCustomerWindow({
    phoneNorm: order.phone_norm ?? null,
    email: order.email ?? null,
    at: order.created_at,
    excludeOrderId: order.id,
    channel,
  });

  if (verdict.blocked) {
    return shell(false, verdict.code as RecoveryBlockCode, verdict.message, order);
  }

  return shell(true, "ok", "Ready to send.", order);
}

// ── Sending ────────────────────────────────────────────────────────────────

export type SendRecoveryResult =
  | {
      sent: true;
      channel: RecoveryChannel;
      discountApplied: number;
      newTotal: number;
      /** Only for the whatsapp channel: the link the admin's browser opens. */
      whatsappUrl?: string;
    }
  | { sent: false; code: RecoveryEligibility["code"] | "send-failed"; message: string };

/** Money arithmetic that has to agree with the checkout, to the piastre. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Recomputes the payment split after a discount, using the same rule the
 * checkout applies: shipping is never charged online, and a deposit plan takes
 * half the goods value up front.
 */
function paymentSplit(total: number, shipping: number, plan: string | null) {
  const goods = Math.max(0, total - shipping);
  const online = plan === "deposit" ? round2(goods * 0.5) : goods;
  return { depositAmount: online, remainingAmount: round2(total - online) };
}

/**
 * Grants the discount, emails the customer, and marks the order as chased.
 *
 * The write happens before the send so the price in the email is a price that
 * actually exists in the database — a customer must never be shown a figure the
 * payment page won't honour. If the send then fails, the discount is reversed
 * exactly, using the total stored before it was touched.
 */
export async function sendRecoveryEmail(
  orderId: string,
  options: {
    discountPercent?: number;
    actorId?: string | null;
    /**
     * WhatsApp goes through the identical path — same eligibility, same
     * discount, same one-per-customer claim — and simply hands the admin a
     * composed message instead of posting to Resend. Sharing the claim is the
     * point: a customer contacted on WhatsApp must not then get an email too.
     */
    channel?: RecoveryChannel;
  } = {}
): Promise<SendRecoveryResult> {
  // Re-checked here rather than trusted from the caller: the panel's view can
  // be minutes stale, and in those minutes the customer may have paid.
  const channel: RecoveryChannel = options.channel === "whatsapp" ? "whatsapp" : "email";
  const claimColumn =
    channel === "whatsapp" ? "recovery_whatsapp_sent_at" : "recovery_email_sent_at";

  const eligibility = await checkRecoveryEligibility(orderId, channel);
  if (!eligibility.canSend) {
    return { sent: false, code: eligibility.code, message: eligibility.message };
  }

  const requested = Number(options.discountPercent ?? 0);
  const percent =
    RECOVERY_DISCOUNT_ENABLED && Number.isFinite(requested) && requested > 0
      ? Math.min(requested, RECOVERY_DISCOUNT_MAX_PERCENT)
      : 0;

  const order = await loadOrder(orderId);
  if (!order) {
    return { sent: false, code: "order-not-found", message: "This order no longer exists." };
  }

  // Claim the right to send. Atomic, so two admins clicking at the same moment
  // cannot both get through — the second gets no rows back.
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("orders")
    .update({ [claimColumn]: new Date().toISOString() })
    .eq("id", orderId)
    .is(claimColumn, null)
    .select("id");

  if (claimError) {
    console.error("Recovery claim failed:", claimError.message);
    return { sent: false, code: "check-failed", message: "Couldn't reserve the send. Try again." };
  }

  if (!claimed?.length) {
    return {
      sent: false,
      code: "already-sent",
      message: "A follow-up on this channel was just sent by someone else.",
    };
  }

  const originalTotal = Number(order.total || 0);
  const shipping = Number(order.shipping_cost || 0);
  let discountAmount = 0;
  let newTotal = originalTotal;

  // ── Apply the discount ───────────────────────────────────────────────────
  // recovery_discount_amount being NULL is what makes this once-only: the
  // eligibility check refuses a second follow-up, and this column records that
  // the price on this order has already been cut.
  if (percent > 0 && order.recovery_discount_amount == null) {
    // The percentage comes off the goods, but the cap has to be measured
    // against what is actually charged online — total minus shipping. An order
    // that already carries a large promo code can have a total worth less than
    // the percentage of its subtotal, and then the charge lands at zero:
    // EasyKash refuses to open a payment for nothing, so the "Pay now" button
    // in the email would lead to a dead page. Leave at least 1 EGP to charge.
    const chargeable = round2(Math.max(0, originalTotal - shipping - 1));
    const requestedAmount = round2(Number(order.subtotal || 0) * (percent / 100));

    discountAmount = Math.min(requestedAmount, chargeable);
    newTotal = round2(originalTotal - discountAmount);

    if (discountAmount < requestedAmount) {
      console.warn(
        `Recovery discount capped for ${order.order_number}: ` +
          `${requestedAmount} → ${discountAmount} (order too small to give the full ${percent}%)`
      );
    }
  }

  // A percentage that rounds away to nothing on a tiny order is not a failure —
  // the follow-up still goes out, just as a plain reminder.
  if (discountAmount > 0) {
    const split = paymentSplit(newTotal, shipping, order.payment_plan ?? null);

    const { error: discountError } = await supabaseAdmin
      .from("orders")
      .update({
        discount_amount: round2(Number(order.discount_amount || 0) + discountAmount),
        total: newTotal,
        deposit_amount: split.depositAmount,
        remaining_amount: split.remainingAmount,
        recovery_discount_amount: discountAmount,
        recovery_discount_percent: percent,
        recovery_original_total: originalTotal,
        recovery_sent_by: options.actorId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (discountError) {
      console.error("Recovery discount write failed:", discountError.message);
      await supabaseAdmin
        .from("orders")
        .update({ [claimColumn]: null })
        .eq("id", orderId);
      return {
        sent: false,
        code: "check-failed",
        message: "Couldn't apply the discount, so nothing was sent. Try again.",
      };
    }
  } else if (options.actorId) {
    await supabaseAdmin
      .from("orders")
      .update({ recovery_sent_by: options.actorId })
      .eq("id", orderId);
  }

  // ── The link is the credential ───────────────────────────────────────────
  // A random token, not the sequential easykash_customer_ref, so nobody can
  // walk the range and open payment pages for other people's orders.
  let token = order.recovery_token as string | null;
  if (!token) {
    token = randomUUID();
    await supabaseAdmin.from("orders").update({ recovery_token: token }).eq("id", orderId);
  }

  const payUrl = `${siteUrl}/api/pay/resume?t=${encodeURIComponent(token)}`;

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  // Everything above already happened: the claim is taken and the discount is
  // on the order. All that differs is who carries the message. Returning here
  // means no email is composed and Resend is never called.
  if (channel === "whatsapp") {
    const whatsapp = buildOrderWhatsAppMessage({
      customerName: order.customer_name,
      phone: order.phone_norm || order.phone_number,
      orderNumber: order.order_number,
      total: newTotal,
      productNames: (order.items || []).map((i: any) => i.product_name),
      payUrl,
      discountPercent: discountAmount > 0 ? percent : undefined,
      previousTotal: discountAmount > 0 ? originalTotal : undefined,
    });

    if (order.session_id) {
      await supabaseAdmin
        .rpc("analytics_mark_cart_contacted", { p_session_id: order.session_id })
        .then(({ error }) => {
          if (error) console.error("Cart contact marking failed:", error.message);
        });
    }

    return {
      sent: true,
      channel: "whatsapp",
      discountApplied: discountAmount,
      newTotal,
      whatsappUrl: whatsapp.url,
    };
  }

  const built = orderRecoveryEmail(
    {
      // The recovery discount gets its own line in the email, so the order's
      // original discount is passed through unchanged — adding them together
      // here would show the same money twice.
      ...(order as EmailOrder),
      total: newTotal,
    },
    payUrl,
    discountAmount > 0
      ? {
          // The headline percentage has to describe the money actually taken
          // off. When the cap above trimmed it, printing the requested figure
          // would promise a discount the total doesn't show.
          percent: Math.max(
            1,
            Math.round((discountAmount / Math.max(1, Number(order.subtotal || 0))) * 100)
          ),
          amount: discountAmount,
          previousTotal: originalTotal,
        }
      : undefined
  );

  const result = await sendEmail({
    to: String(order.email),
    subject: built.subject,
    html: built.html,
    text: built.text,
    kind: "order_recovery",
    orderId,
  });

  if (!result.sent) {
    // Undo everything. A discounted order whose customer was never told about
    // the discount is money given away for nothing.
    const restore: Record<string, any> = { [claimColumn]: null };
    if (discountAmount > 0) {
      const split = paymentSplit(originalTotal, shipping, order.payment_plan ?? null);
      restore.total = originalTotal;
      restore.discount_amount = Number(order.discount_amount || 0);
      restore.deposit_amount = split.depositAmount;
      restore.remaining_amount = split.remainingAmount;
      restore.recovery_discount_amount = null;
      restore.recovery_discount_percent = null;
      restore.recovery_original_total = null;
    }
    await supabaseAdmin.from("orders").update(restore).eq("id", orderId);

    return {
      sent: false,
      code: "send-failed",
      message: result.error || "The mail provider rejected the message. Nothing was changed.",
    };
  }

  // Attribution: this cart has now been chased. When the payment lands, the
  // callback's mark_cart_converted turns "contacted" into "recovered", which is
  // what makes the follow-up's worth measurable instead of assumed.
  if (order.session_id) {
    const { error: cartError } = await supabaseAdmin.rpc("analytics_mark_cart_contacted", {
      p_session_id: order.session_id,
    });
    if (cartError) console.error("Cart contact marking failed:", cartError.message);
  }

  return { sent: true, channel: "email", discountApplied: discountAmount, newTotal };
}


/**
 * Reverses a recovery discount, putting the order back to what it cost before.
 *
 * Deliberately does NOT clear the "already contacted" marks: the message went
 * out and cannot be recalled. That is also why this is dangerous — the
 * customer is holding a message quoting the lower price, and the payment page
 * will now ask for the higher one. The caller is expected to have said so out
 * loud before getting here.
 */
export async function undoRecoveryDiscount(
  orderId: string
): Promise<{ undone: boolean; message: string; restoredTotal?: number }> {
  const order = await loadOrder(orderId);
  if (!order) return { undone: false, message: "This order no longer exists." };

  if (order.recovery_discount_amount == null || order.recovery_original_total == null) {
    return { undone: false, message: "There's no recovery discount on this order." };
  }

  if (["paid", "delivered", "refunded"].includes(String(order.payment_status))) {
    // Changing the price of something already paid for would leave the order
    // disagreeing with the money that actually moved.
    return {
      undone: false,
      message: "This order has already been paid — reversing the discount now would misstate what was charged.",
    };
  }

  const originalTotal = Number(order.recovery_original_total);
  const discountAmount = Number(order.recovery_discount_amount);
  const shipping = Number(order.shipping_cost || 0);
  const split = paymentSplit(originalTotal, shipping, order.payment_plan ?? null);

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      total: originalTotal,
      discount_amount: round2(Math.max(0, Number(order.discount_amount || 0) - discountAmount)),
      deposit_amount: split.depositAmount,
      remaining_amount: split.remainingAmount,
      recovery_discount_amount: null,
      recovery_discount_percent: null,
      recovery_original_total: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Recovery discount undo failed:", error.message);
    return { undone: false, message: "Couldn't reverse the discount. Try again." };
  }

  return {
    undone: true,
    restoredTotal: originalTotal,
    message: `Discount reversed — the order is back to ${originalTotal.toFixed(2)} EGP.`,
  };
}


// ── Bulk ───────────────────────────────────────────────────────────────────

export type BulkEligibility = { canSend: boolean; code: string; message: string };

/**
 * The same question as checkRecoveryEligibility, asked about many orders at
 * once, in a fixed number of queries.
 *
 * The admin list needs this to mark which rows are worth opening. Calling the
 * single-order version fifty times would be a hundred and fifty round trips to
 * paint one column, so the guard's context is loaded once and every order is
 * judged against it.
 *
 * The per-order rules below are the same sequence, in the same order, as the
 * single check — they read the order row and nothing else, so there is no
 * shared state for the two to disagree about.
 */
export async function checkRecoveryEligibilityBulk(
  orderIds: string[],
  channel: RecoveryChannel = "email"
): Promise<Record<string, BulkEligibility>> {
  const out: Record<string, BulkEligibility> = {};
  if (!orderIds.length) return out;

  const blocked = (id: string, code: string, message: string) => {
    out[id] = { canSend: false, code, message };
  };

  if (!RECOVERY_EMAIL_ENABLED) {
    orderIds.forEach((id) => blocked(id, "recovery-disabled", "Recovery emails are switched off."));
    return out;
  }

  if (!emailEnabled && channel === "email") {
    orderIds.forEach((id) => blocked(id, "emails-not-configured", "Email isn't configured."));
    return out;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, status, payment_status, email, phone_number, phone_norm, created_at, recovery_email_sent_at, recovery_whatsapp_sent_at"
    )
    .in("id", orderIds.slice(0, 200));

  if (error) {
    console.error("Bulk eligibility: order load failed", error.message);
    orderIds.forEach((id) => blocked(id, "check-failed", "Couldn't check this order."));
    return out;
  }

  const rows = (data as any[]) || [];

  // Rows that fail on their own merits never reach the guard, so the shared
  // lookup only carries the orders that could still be chased.
  const candidates: any[] = [];

  for (const order of rows) {
    if (String(order.status).toLowerCase() === "cancelled") {
      blocked(order.id, "order-cancelled", "This order was cancelled.");
      continue;
    }
    if (["paid", "delivered", "refunded"].includes(String(order.payment_status))) {
      blocked(order.id, "already-paid", `Already ${order.payment_status}.`);
      continue;
    }
    if (channel === "email" && !order.email) {
      blocked(order.id, "no-email-address", "No email address on this order.");
      continue;
    }
    if (channel === "whatsapp" && !order.phone_number) {
      blocked(order.id, "no-email-address", "No phone number on this order.");
      continue;
    }
    const sentAt =
      channel === "whatsapp" ? order.recovery_whatsapp_sent_at : order.recovery_email_sent_at;
    if (sentAt) {
      blocked(order.id, "already-sent", `Already contacted on ${formatDate(sentAt)}.`);
      continue;
    }
    const ageMinutes = (Date.now() - new Date(order.created_at).getTime()) / 60_000;
    if (ageMinutes < RECOVERY_MIN_AGE_MINUTES) {
      blocked(
        order.id,
        "too-new",
        `Too new — try again in about ${Math.ceil(RECOVERY_MIN_AGE_MINUTES - ageMinutes)} minute(s).`
      );
      continue;
    }
    candidates.push(order);
  }

  if (!candidates.length) return out;

  const identities = candidates.map((order) => ({
    phoneNorm: order.phone_norm ?? null,
    email: order.email ?? null,
    at: order.created_at,
    excludeOrderId: order.id,
    channel,
  }));

  const context = await loadCustomerWindowContext(identities);

  candidates.forEach((order, index) => {
    const verdict = evaluateCustomerWindow(identities[index], context);
    out[order.id] = verdict.blocked
      ? { canSend: false, code: verdict.code, message: verdict.message }
      : { canSend: true, code: "ok", message: "Ready to send." };
  });

  return out;
}
