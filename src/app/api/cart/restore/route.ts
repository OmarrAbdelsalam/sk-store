import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Hands back the contents of one abandoned cart, so the reminder email can put
 * a basket back together on a device that never had it.
 *
 * Carts live in the customer's browser. Someone who filled one on their phone
 * and opens the email on a laptop would otherwise land on an empty page holding
 * a discount code for nothing — the products are listed in the email, but
 * re-finding and re-picking every one of them is exactly the friction the
 * reminder was meant to remove.
 *
 * The token is the only credential, so it is a random UUID rather than the
 * session id: session ids appear in the customer's own storage and analytics
 * payloads, and one that leaked would expose a stranger's basket.
 *
 * GET /api/cart/restore?t=<recovery_token>
 */
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("t") || "";

  if (!UUID.test(token)) {
    return NextResponse.json({ succeeded: false, message: "Invalid link" }, { status: 400 });
  }

  try {
    const { data: cart, error } = await supabaseAdmin
      .from("abandoned_carts")
      .select("session_id, items, customer_name, recovery_promo_code, status")
      .eq("recovery_token", token)
      .maybeSingle();

    if (error) throw error;

    if (!cart) {
      return NextResponse.json({ succeeded: false, message: "Link expired" }, { status: 404 });
    }

    // They already came back and bought. Rebuilding the basket now would put a
    // duplicate order in front of someone who is done.
    if (["converted", "recovered"].includes(String(cart.status))) {
      return NextResponse.json({
        succeeded: true,
        alreadyOrdered: true,
        items: [],
        promoCode: null,
      });
    }

    // Explicit shape rather than the raw JSONB: the snapshot is written from
    // the browser, and nothing that arrives there should be handed back out
    // without being named here first.
    const snapshot = (Array.isArray(cart.items) ? cart.items : [])
      .map((item: any) => ({
        productId: typeof item?.productId === "string" ? item.productId : null,
        name: typeof item?.name === "string" ? item.name : "",
        color: typeof item?.color === "string" ? item.color : null,
        colorId: typeof item?.colorId === "string" ? item.colorId : null,
        sizeId: typeof item?.sizeId === "string" ? item.sizeId : null,
        sizeName: typeof item?.sizeName === "string" ? item.sizeName : null,
        quantity: Math.max(1, Math.min(20, Number(item?.quantity) || 1)),
        price: Number(item?.price) || 0,
        image: typeof item?.image === "string" ? item.image : null,
      }))
      .filter((item) => item.productId);

    // The snapshot can be weeks old. Checkout re-prices everything from the
    // products table and throws if one has been retired, so restoring a
    // discontinued product would hand the customer a cart that refuses to
    // check out — with no clue which item is the problem. Drop them here, and
    // say how many so the page can explain the gap.
    let items = snapshot;
    let unavailable = 0;

    if (snapshot.length) {
      const { data: live } = await supabaseAdmin
        .from("products")
        .select("id")
        .in("id", snapshot.map((item) => item.productId as string))
        // is_active is an INTEGER flag, not a boolean — matching the exact test
        // server-pricing applies, so this can never disagree with checkout.
        .neq("is_active", 0)
        .is("deleted_at", null);

      const available = new Set((live || []).map((p: any) => p.id));
      items = snapshot.filter((item) => available.has(item.productId));
      unavailable = snapshot.length - items.length;
    }

    return NextResponse.json({
      succeeded: true,
      alreadyOrdered: false,
      customerName: cart.customer_name || null,
      items,
      unavailable,
      promoCode: cart.recovery_promo_code || null,
    });
  } catch (err: any) {
    console.error("Cart restore error:", err?.message);
    return NextResponse.json(
      { succeeded: false, message: "Could not restore the cart" },
      { status: 500 }
    );
  }
}
