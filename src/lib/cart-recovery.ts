import "server-only";

import { randomUUID, randomInt } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail, emailEnabled } from "@/lib/email";
import { cartRecoveryEmail, type EmailCart } from "@/lib/email-templates";
import { siteUrl } from "@/lib/site";
import { checkCustomerWindow } from "@/lib/recovery-guard";
import { buildCartWhatsAppMessage } from "@/lib/whatsapp-messages";
import {
  RECOVERY_EMAIL_ENABLED,
  RECOVERY_DISCOUNT_ENABLED,
  RECOVERY_DISCOUNT_MAX_PERCENT,
  RECOVERY_MIN_AGE_MINUTES,
  CART_CODE_VALID_DAYS,
} from "@/lib/order-emails-config";

const CART_SELECT = `
  session_id, items, item_count, subtotal, customer_name, phone, phone_norm,
  email, government, city, status, furthest_stage, last_activity_at,
  recovery_email_sent_at, recovery_whatsapp_sent_at, recovery_token,
  recovery_promo_code, recovery_discount_percent, contact_count
`;

export type CartRecoveryEligibility = {
  canSend: boolean;
  code: string;
  message: string;
  cart?: {
    sessionId: string;
    email: string | null;
    itemCount: number;
    subtotal: number;
    recoverySentAt: string | null;
    recoveryPromoCode: string | null;
    recoveryDiscountPercent: number | null;
  };
  discountAllowed: boolean;
  maxDiscountPercent: number;
  /** WhatsApp needs a number; the panel greys its button out without one. */
  hasPhone: boolean;
};

type CartRow = Record<string, any>;

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

async function loadCart(sessionId: string): Promise<CartRow | null> {
  const { data, error } = await supabaseAdmin
    .from("abandoned_carts")
    .select(CART_SELECT)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Cart recovery: load failed", error.message);
    return null;
  }
  return data || null;
}

function shell(
  canSend: boolean,
  code: string,
  message: string,
  cart?: CartRow
): CartRecoveryEligibility {
  return {
    canSend,
    code,
    message,
    discountAllowed: RECOVERY_DISCOUNT_ENABLED,
    maxDiscountPercent: RECOVERY_DISCOUNT_MAX_PERCENT,
    hasPhone: Boolean(cart?.phone),
    cart: cart
      ? {
          sessionId: cart.session_id,
          email: cart.email ?? null,
          itemCount: Number(cart.item_count || 0),
          subtotal: Number(cart.subtotal || 0),
          recoverySentAt: cart.recovery_email_sent_at ?? null,
          recoveryPromoCode: cart.recovery_promo_code ?? null,
          recoveryDiscountPercent:
            cart.recovery_discount_percent != null
              ? Number(cart.recovery_discount_percent)
              : null,
        }
      : undefined,
  };
}

/**
 * May we email the person behind this cart, and if not, why.
 *
 * Mirrors the order-side rules on purpose — a customer who abandoned a cart on
 * their phone and then ordered from a laptop must not hear from us twice, and
 * the two flows have no idea the other exists unless the checks say so.
 */
export async function checkCartRecoveryEligibility(
  sessionId: string,
  channel: "email" | "whatsapp" = "email"
): Promise<CartRecoveryEligibility> {
  if (!RECOVERY_EMAIL_ENABLED) {
    return shell(false, "recovery-disabled", "Recovery emails are switched off in the code.");
  }

  if (!emailEnabled) {
    return shell(
      false,
      "emails-not-configured",
      "Email isn't configured on the server — RESEND_API_KEY and EMAIL_FROM need to be set."
    );
  }

  const cart = await loadCart(sessionId);
  if (!cart) {
    return shell(false, "cart-not-found", "This cart no longer exists.");
  }

  if (["converted", "recovered"].includes(String(cart.status))) {
    return shell(
      false,
      "already-ordered",
      "This cart turned into an order — there's nothing left to chase.",
      cart
    );
  }

  if (!cart.email) {
    return shell(
      false,
      "no-email-address",
      "This cart has no email address on it. If there's a phone number, WhatsApp is the only way to reach them.",
      cart
    );
  }

  if (!Number(cart.item_count) || !Number(cart.subtotal)) {
    return shell(false, "empty-cart", "This cart is empty, so there's nothing to remind them about.", cart);
  }

  // Per channel: both may reach the same person, neither may arrive twice.
  const sentAt =
    channel === "whatsapp" ? cart.recovery_whatsapp_sent_at : cart.recovery_email_sent_at;

  if (sentAt) {
    return shell(
      false,
      "already-sent",
      `A ${channel === "whatsapp" ? "WhatsApp message" : "reminder email"} already went out for this cart on ${formatDate(sentAt)}.`,
      cart
    );
  }

  if (channel === "whatsapp" && !cart.phone) {
    return shell(
      false,
      "no-email-address",
      "This cart has no phone number, so there's nowhere to send a WhatsApp message.",
      cart
    );
  }

  const activity = new Date(cart.last_activity_at).getTime();
  const idleMinutes = (Date.now() - activity) / 60_000;
  if (idleMinutes < RECOVERY_MIN_AGE_MINUTES) {
    return shell(
      false,
      "too-new",
      `They were active ${Math.floor(idleMinutes)} minute(s) ago — they may still be shopping. Give it about ${Math.ceil(
        RECOVERY_MIN_AGE_MINUTES - idleMinutes
      )} more minute(s).`,
      cart
    );
  }

  // ── Did this person already buy, or already hear from us? ────────────────
  // Shared with the order flow. Chasing a cart on one device and an order on
  // another is the same customer twice, and only a check that reads both
  // tables can see it.
  const verdict = await checkCustomerWindow({
    phoneNorm: cart.phone_norm ?? null,
    email: cart.email ?? null,
    at: cart.last_activity_at,
    excludeSessionId: sessionId,
    channel,
  });

  if (verdict.blocked) {
    return shell(false, verdict.code, verdict.message, cart);
  }

  return shell(true, "ok", "Ready to send.", cart);
}


/**
 * Records that this cart has been chased, whichever channel carried it.
 *
 * "contacted" is what mark_cart_converted later turns into "recovered" — the
 * one number that shows whether chasing carts earns its keep, so it has to be
 * written on the WhatsApp path exactly as on the email one.
 */
async function markCartContacted(
  sessionId: string,
  cart: CartRow,
  token: string,
  promoCode: string | null,
  percent: number,
  actorId?: string | null
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("abandoned_carts")
    .update({
      recovery_token: token,
      recovery_promo_code: promoCode,
      recovery_discount_percent: percent || null,
      recovery_sent_by: actorId || null,
      status:
        cart.status === "active" || cart.status === "abandoned"
          ? "contacted"
          : cart.status,
      contacted_at: new Date().toISOString(),
      contact_count: Number(cart.contact_count || 0) + 1,
    })
    .eq("session_id", sessionId);

  if (error) console.error("Cart contact bookkeeping failed:", error.message);
}

// ── Sending ────────────────────────────────────────────────────────────────

export type SendCartRecoveryResult =
  | {
      sent: true;
      channel: "email" | "whatsapp";
      promoCode: string | null;
      percent: number;
      /** Only for the whatsapp channel: the link the admin's browser opens. */
      whatsappUrl?: string;
    }
  | { sent: false; code: string; message: string };

/**
 * Mints a code nobody can guess from another one.
 *
 * Ambiguous characters are left out of the alphabet: this gets read off a
 * phone screen and typed into a form, and a code that turns 0 into O at the
 * keyboard is a support message rather than a sale.
 */
function generateCode(percent: number): string {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `BACK${percent}-${suffix}`;
}

/**
 * Creates a single-use promo code for one cart.
 *
 * usage_limit = 1 is what stops the code being passed around: the existing
 * checkout validation already refuses a code whose usage_count has reached its
 * limit, so nothing new has to be enforced here.
 */
function codeMinimum(subtotal: number): number {
  return Math.max(0, Math.floor(subtotal * 0.5));
}

async function mintCode(percent: number, minSubtotal: number): Promise<string | null> {
  const expires = new Date(Date.now() + CART_CODE_VALID_DAYS * 86_400_000).toISOString();

  // The alphabet gives ~10^9 combinations, so a collision is a lottery win —
  // but `code` is UNIQUE, and one retry costs nothing next to a failed send.
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode(percent);
    const { error } = await supabaseAdmin.from("promo_codes").insert({
      code,
      discount_type: "percentage",
      discount_value: percent,
      // Guards against the cart being emptied down to one cheap item and the
      // code still applying — it was offered for this basket.
      min_order_amount: codeMinimum(minSubtotal),
      usage_limit: 1,
      usage_count: 0,
      end_date: expires,
      is_active: 1,
    });

    if (!error) return code;
    if (error.code !== "23505") {
      console.error("Cart recovery: promo code insert failed", error.message);
      return null;
    }
  }

  return null;
}

/**
 * Emails the person behind an abandoned cart, optionally with a code.
 *
 * Unlike the order flow there is no price to change — the cart isn't a
 * commitment — so the discount takes the only form that can survive until they
 * come back: a real, single-use promo code.
 */
export async function sendCartRecoveryEmail(
  sessionId: string,
  options: {
    discountPercent?: number;
    actorId?: string | null;
    /**
     * WhatsApp shares this whole path — eligibility, code minting, and the
     * one-per-customer claim — and only swaps who delivers the message. That
     * shared claim is what stops a customer being messaged and then emailed.
     */
    channel?: "email" | "whatsapp";
  } = {}
): Promise<SendCartRecoveryResult> {
  const channel: "email" | "whatsapp" =
    options.channel === "whatsapp" ? "whatsapp" : "email";
  const claimColumn =
    channel === "whatsapp" ? "recovery_whatsapp_sent_at" : "recovery_email_sent_at";

  const eligibility = await checkCartRecoveryEligibility(sessionId, channel);
  if (!eligibility.canSend) {
    return { sent: false, code: eligibility.code, message: eligibility.message };
  }

  const requested = Number(options.discountPercent ?? 0);
  const percent =
    RECOVERY_DISCOUNT_ENABLED && Number.isFinite(requested) && requested > 0
      ? Math.min(Math.round(requested), RECOVERY_DISCOUNT_MAX_PERCENT)
      : 0;

  const cart = await loadCart(sessionId);
  if (!cart) return { sent: false, code: "cart-not-found", message: "This cart no longer exists." };

  // Claim first, atomically — two admins on the same row can't both send.
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("abandoned_carts")
    .update({ [claimColumn]: new Date().toISOString() })
    .eq("session_id", sessionId)
    .is(claimColumn, null)
    .select("session_id");

  if (claimError) {
    console.error("Cart recovery claim failed:", claimError.message);
    return { sent: false, code: "check-failed", message: "Couldn't reserve the send. Try again." };
  }

  if (!claimed?.length) {
    return {
      sent: false,
      code: "already-sent",
      message: "A reminder on this channel was just sent by someone else.",
    };
  }

  let promoCode: string | null = cart.recovery_promo_code ?? null;
  if (percent > 0 && !promoCode) {
    promoCode = await mintCode(percent, Number(cart.subtotal || 0));

    if (!promoCode) {
      await supabaseAdmin
        .from("abandoned_carts")
        .update({ [claimColumn]: null })
        .eq("session_id", sessionId);
      return {
        sent: false,
        code: "check-failed",
        message: "Couldn't create the discount code, so nothing was sent. Try again.",
      };
    }
  }

  // Written before the email goes out, not after: the link in the message is
  // only useful if the token it carries already exists to be looked up.
  const token = (cart.recovery_token as string | null) || randomUUID();
  if (!cart.recovery_token) {
    const { error: tokenError } = await supabaseAdmin
      .from("abandoned_carts")
      .update({ recovery_token: token })
      .eq("session_id", sessionId);

    if (tokenError) {
      console.error("Cart recovery: token write failed", tokenError.message);
      await supabaseAdmin
        .from("abandoned_carts")
        .update({ [claimColumn]: null })
        .eq("session_id", sessionId);
      return {
        sent: false,
        code: "check-failed",
        message: "Couldn't prepare the cart link, so nothing was sent. Try again.",
      };
    }
  }

  // No locale segment: the storefront serves one language from unprefixed
  // paths, and /ar/cart stopped resolving when that changed.
  //
  // `restore` rebuilds the basket on whatever device opens the link; `code`
  // is parked for checkout so the customer never types it.
  const cartUrl = `${siteUrl}/cart?restore=${token}${
    promoCode ? `&code=${encodeURIComponent(promoCode)}` : ""
  }`;

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  // On WhatsApp the customer is almost always holding the phone that built the
  // cart, so the plain cart URL is enough — no restore round trip needed.
  if (channel === "whatsapp") {
    const whatsapp = buildCartWhatsAppMessage({
      customerName: cart.customer_name,
      phone: cart.phone_norm || cart.phone,
      subtotal: Number(cart.subtotal || 0),
      productNames: (Array.isArray(cart.items) ? cart.items : []).map(
        (i: any) => i?.name
      ),
      cartUrl,
      discountPercent: promoCode ? percent : undefined,
      promoCode,
      minOrder: promoCode ? codeMinimum(Number(cart.subtotal || 0)) : undefined,
    });

    await markCartContacted(sessionId, cart, token, promoCode, percent, options.actorId);

    return {
      sent: true,
      channel: "whatsapp" as const,
      promoCode,
      percent,
      whatsappUrl: whatsapp.url,
    };
  }

  const built = cartRecoveryEmail(
    cart as EmailCart,
    cartUrl,
    promoCode
      ? {
          percent,
          code: promoCode,
          expiresInDays: CART_CODE_VALID_DAYS,
          // Stated in the email because the code silently refuses below this,
          // and a customer who trims their basket would otherwise hit a
          // rejection they were never warned about.
          minOrder: codeMinimum(Number(cart.subtotal || 0)),
        }
      : undefined
  );

  const result = await sendEmail({
    to: String(cart.email),
    subject: built.subject,
    html: built.html,
    text: built.text,
    kind: "cart_recovery",
    orderId: null,
  });

  if (!result.sent) {
    // Hand the claim back. The code stays in place — it is harmless unused,
    // expires on its own, and reusing it on the retry beats minting a second.
    await supabaseAdmin
      .from("abandoned_carts")
      .update({ [claimColumn]: null, recovery_promo_code: promoCode })
      .eq("session_id", sessionId);

    return {
      sent: false,
      code: "send-failed",
      message: result.error || "The mail provider rejected the message. Nothing was sent.",
    };
  }

  await markCartContacted(sessionId, cart, token, promoCode, percent, options.actorId);

  return { sent: true, channel: "email", promoCode, percent };
}
