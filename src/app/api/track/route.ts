import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Event ingestion.
 *
 * Written with the service-role key because the anon key is denied all access
 * to analytics_events — if visitors could insert directly, anyone could forge
 * a million add_to_cart rows and every product report would be worthless.
 *
 * The trade-off is that this route is the only gate, so it validates hard:
 * a fixed event whitelist, a per-request cap, and no free-form table access.
 */

const ALLOWED_EVENTS = new Set([
  "add_to_cart",
  "remove_from_cart",
  "whatsapp_click",
  "begin_checkout",
  "contact_info_entered",
  "order_submitted",
  "payment_started",
  "purchase",
]);

const MAX_EVENTS_PER_REQUEST = 50;
const BOT_UA = /bot|crawler|spider|crawling|headless|lighthouse|pingdom|gtmetrix|preview/i;

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

function asNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
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

    const deviceType = ["desktop", "mobile", "tablet"].includes(body.deviceType)
      ? body.deviceType
      : null;

    const incoming = Array.isArray(body.events) ? body.events : [];
    const rows = incoming
      .slice(0, MAX_EVENTS_PER_REQUEST)
      .filter((e: any) => e && ALLOWED_EVENTS.has(e.eventName))
      .map((e: any) => ({
        session_id: sessionId,
        event_name: e.eventName,
        occurred_at: asText(e.occurredAt, 40) || new Date().toISOString(),
        product_id: asUuid(e.productId),
        product_name: asText(e.productName, 200),
        color_name: asText(e.colorName, 100),
        quantity: asNumber(e.quantity),
        value: asNumber(e.value),
        order_id: asUuid(e.orderId),
        page_url: asText(e.pageUrl, 500),
        device_type: deviceType,
        props:
          e.props && typeof e.props === "object" && !Array.isArray(e.props)
            ? e.props
            : {},
      }));

    if (rows.length === 0) {
      return NextResponse.json({ succeeded: true, inserted: 0 });
    }

    const { error } = await supabaseAdmin.from("analytics_events").insert(rows);
    if (error) {
      console.error("track: insert failed", error.message);
      return NextResponse.json({ succeeded: false }, { status: 500 });
    }

    return NextResponse.json({ succeeded: true, inserted: rows.length });
  } catch (error: any) {
    console.error("track: unexpected error", error?.message);
    // Never surface a tracking failure to the storefront.
    return NextResponse.json({ succeeded: false }, { status: 500 });
  }
}
