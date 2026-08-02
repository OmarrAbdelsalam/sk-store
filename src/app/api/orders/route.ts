import { NextRequest, NextResponse } from "next/server";
import { createOrderService, CreateOrderInput } from "@/services/orders";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { priceOrder, PricingError } from "@/lib/server-pricing";

// Checkout is unauthenticated by design, so orders are written with the
// service-role key after this route has validated the request — the anon key is
// denied all access to the orders table.
const orderService = createOrderService(supabaseAdmin);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      sessionId,
      customerName,
      phoneNumber,
      email,
      paymentMethod,
      government,
      city,
      detailedAddress,
      notes,
    } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !government) {
      return NextResponse.json(
        {
          succeeded: false,
          message: "Missing required fields: customerName, phoneNumber, government"
        },
        { status: 400 }
      );
    }

    // Email is required at checkout, so it is enforced here too — the form can
    // be bypassed, and an order without it breaks the confirmation we promised
    // the customer on that very screen.
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(normalizedEmail)) {
      return NextResponse.json(
        { succeeded: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    // ── Pricing ─────────────────────────────────────────────────────────────
    // Everything about money is recomputed from the database. The request body
    // only says *what* the customer wants and *where* it's going; the prices,
    // shipping, discounts and total it claims are discarded. Trusting them let
    // a tampered request order anything for any amount.
    let priced;
    try {
      priced = await priceOrder({
        items: body.items || [],
        governorate: government,
        city,
        discountCode: body.discountCode,
        sessionId,
        phoneNumber,
      });
    } catch (err: any) {
      if (err instanceof PricingError) {
        return NextResponse.json(
          { succeeded: false, message: err.message },
          { status: 400 }
        );
      }
      throw err;
    }

    const {
      subtotal,
      shippingCost,
      discountAmount,
      discountCode,
      total,
      appliedPromotions,
      bogoDiscount,
    } = priced;

    // Payment plan — computed from the server's own numbers, not the client's.
    // Shipping is never charged online under either plan; it is collected on
    // delivery. So the online charge is a share of the goods value only:
    // the full goods value, or half of it for a deposit. This must match the
    // rule in CheckoutForm exactly, or the customer is charged an amount other
    // than the one the button promised.
    const paymentPlan = body.paymentPlan === 'deposit' ? 'deposit' : 'full';
    const goodsTotal = Math.max(0, total - shippingCost);
    const onlineCharge =
      paymentPlan === 'deposit'
        ? Math.round(goodsTotal * 50) / 100
        : goodsTotal;
    // deposit_amount holds what is taken online; remaining_amount is what the
    // courier collects, which always includes shipping.
    const depositAmount = onlineCharge;
    const remainingAmount = Math.round((total - onlineCharge) * 100) / 100;

    // Note: no EasyKash fields are read from the body. Payment state is written
    // only by the HMAC-verified gateway callback and the status route; accepting
    // it here would let a caller declare its own order paid. The order is
    // therefore always created unpaid, and easykash_customer_ref is allocated by
    // the database sequence.

    // Create order input
    const orderInput: CreateOrderInput = {
      sessionId: sessionId || `web_${Date.now()}`,
      customerName,
      phoneNumber,
      email: normalizedEmail,
      paymentMethod: paymentMethod || 'cash',
      paymentPlan,
      depositAmount,
      remainingAmount,
      government,
      city,
      detailedAddress,
      notes,
      // Names and unit prices come from the products table via priceOrder, so
      // the stored line items match what was actually charged.
      items: priced.items,
      subtotal,
      shippingCost,
      discountAmount,
      discountCode,
      total,
      appliedPromotions,
      bogoDiscount,
    };

    // Create order in database
    const order = await orderService.create(orderInput);

    // Link the cart to the order it produced, but leave it in the recovery
    // list: the order is still unpaid at this point, and someone who reached
    // the gateway and left is exactly who we most want to follow up with.
    // mark_cart_converted runs later, from the verified payment callback.
    if (sessionId) {
      const { error: cartLinkError } = await supabaseAdmin
        .from("abandoned_carts")
        .update({
          order_id: order.id,
          furthest_stage: "order_submitted",
          last_activity_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId);

      if (cartLinkError) {
        // Never fail a paid-for order over bookkeeping.
        console.error("orders: cart link failed", cartLinkError.message);
      }
    }

    return NextResponse.json({
      succeeded: true,
      message: "Order created successfully",
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        createdAt: order.created_at,
        // Allocated by the database sequence — the caller needs it to open the
        // payment, and it's already persisted, so there's nothing to save back.
        easykashCustomerRef: order.easykash_customer_ref,
      },
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { 
        succeeded: false, 
        message: error.message || "Failed to create order" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    // This route runs with the service-role key, so it must never serve a query
    // the caller hasn't proved they're entitled to. A session id scopes the
    // result to that one browser's orders; without it there is nothing to scope
    // by, and the previous "return everything" branch handed the full customer
    // list — names, phones, addresses — to anyone who called it.
    if (!sessionId) {
      return NextResponse.json(
        { succeeded: false, message: "sessionId is required" },
        { status: 400 }
      );
    }

    const orders = await orderService.getBySessionId(sessionId);
    return NextResponse.json({
      succeeded: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { succeeded: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
