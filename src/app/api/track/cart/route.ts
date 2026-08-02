import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Abandoned cart capture — cart contents plus whatever the customer has typed
 * at checkout before submitting.
 *
 * Half-typed values are the whole risk here: the form sends on blur, so "ahm"
 * and "010" arrive constantly. Storing them would fill the recovery list with
 * rows nobody can act on, so contact details are validated before they are
 * persisted and dropped otherwise.
 */

const BOT_UA = /bot|crawler|spider|crawling|headless|lighthouse|pingdom|gtmetrix|preview/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const STAGES = new Set([
  "cart",
  "checkout_viewed",
  "contact_entered",
  "address_entered",
  "order_submitted",
  "payment_started",
]);

const MAX_ITEMS = 50;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asUuid(v: unknown): string | null {
  return typeof v === "string" && UUID_RE.test(v) ? v : null;
}

function asText(v: unknown, max = 300): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/** Only a plausible address gets stored — otherwise it is unusable for recovery. */
function asEmail(v: unknown): string | null {
  const t = asText(v, 200);
  if (!t) return null;
  return EMAIL_RE.test(t) ? t.toLowerCase() : null;
}

/** Egyptian mobiles are 10 digits after the country code; anything shorter is mid-typing. */
function asPhone(v: unknown): string | null {
  const t = asText(v, 30);
  if (!t) return null;
  const digits = t.replace(/\D/g, "");
  return digits.length >= 10 ? t : null;
}

function asMoney(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") || "";
    if (BOT_UA.test(ua)) {
      return NextResponse.json({ succeeded: true, skipped: "bot" });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ succeeded: false }, { status: 400 });
    }

    const sessionId = asText(body.sessionId, 100);
    if (!sessionId || sessionId.length < 8) {
      return NextResponse.json({ succeeded: false }, { status: 400 });
    }

    // Items are only part of the payload when the cart itself changed; a bare
    // field-blur snapshot must leave the stored cart alone, hence null.
    let items: unknown = null;
    let itemCount: number | null = null;
    if (Array.isArray(body.items)) {
      items = body.items.slice(0, MAX_ITEMS).map((i: any) => ({
        // Stored as text, but the product report casts it to uuid — keep
        // anything that isn't one out of the column in the first place.
        productId: asUuid(i?.productId),
        name: asText(i?.name, 200),
        color: asText(i?.color, 100),
        quantity: Number(i?.quantity) || 1,
        price: asMoney(i?.price) ?? 0,
        image: asText(i?.image, 500),
      }));
      itemCount = (items as any[]).reduce(
        (sum, i) => sum + (Number(i.quantity) || 0),
        0
      );
    }

    const stage = STAGES.has(body.stage) ? body.stage : "cart";

    const { error } = await supabaseAdmin.rpc("upsert_abandoned_cart", {
      p_session_id: sessionId,
      p_items: items,
      p_item_count: itemCount,
      p_subtotal: asMoney(body.subtotal),
      p_customer_name: asText(body.customerName, 200),
      p_phone: asPhone(body.phone),
      p_email: asEmail(body.email),
      p_government: asText(body.government, 100),
      p_city: asText(body.city, 100),
      p_address: asText(body.address, 500),
      p_promo_code: asText(body.promoCodeTried, 60),
      p_stage: stage,
      p_device: ["desktop", "mobile", "tablet"].includes(body.deviceType)
        ? body.deviceType
        : null,
    });

    if (error) {
      console.error("track/cart: upsert failed", error.message);
      return NextResponse.json({ succeeded: false }, { status: 500 });
    }

    return NextResponse.json({ succeeded: true });
  } catch (error: any) {
    console.error("track/cart: unexpected error", error?.message);
    return NextResponse.json({ succeeded: false }, { status: 500 });
  }
}
