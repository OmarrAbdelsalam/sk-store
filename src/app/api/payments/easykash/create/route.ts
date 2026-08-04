import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { siteUrl } from "@/lib/site";

const EASYKASH_API_KEY = process.env.EASYKASH_API_KEY;
const EASYKASH_DIRECT_URL = "https://back.easykash.net/api/directpayv1/pay";
// One source of truth for the address we hand to EasyKash. It used to fall back
// to skbags.com — a parked domain nobody here owns — and on a host without
// NEXT_PUBLIC_SITE_URL that is where paying customers were sent.
const SITE_URL = siteUrl;

/**
 * Creates an EasyKash Direct Payment link.
 * Supports: Credit Card, Debit Card, Mobile Wallets, Fawry, Aman, Meeza.
 *
 * paymentOptions:
 *   1 = Aman cash, 2 = Credit/Debit Card, 4 = Mobile Wallet,
 *   5 = Fawry cash, 6 = Meeza
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { customerReference, locale = "en" } = body;

    if (!customerReference) {
      return NextResponse.json(
        { succeeded: false, message: "Missing required field: customerReference" },
        { status: 400 }
      );
    }

    if (!EASYKASH_API_KEY) {
      console.error("EASYKASH_API_KEY is not configured");
      return NextResponse.json(
        { succeeded: false, message: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // ── Amount and buyer come from the stored order, never the request ───────
    // This is what the customer is actually charged. Reading it from the request
    // body meant a tampered call could pay 1 EGP for a 5000 EGP order — the
    // callback marks whatever was paid as settled.
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, phone_number, total, shipping_cost, payment_plan, deposit_amount, payment_status")
      .eq("easykash_customer_ref", String(customerReference))
      .maybeSingle();

    if (orderError) {
      console.error("Failed to load order for payment:", orderError);
      return NextResponse.json(
        { succeeded: false, message: "Could not load order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { succeeded: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Refuse to open a second payment for something already settled.
    if (order.payment_status === "paid" || order.payment_status === "refunded") {
      return NextResponse.json(
        { succeeded: false, message: "This order has already been paid" },
        { status: 409 }
      );
    }

    const orderTotal = Number(order.total);
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      return NextResponse.json(
        { succeeded: false, message: "Invalid order total" },
        { status: 400 }
      );
    }

    // Recomputed from the stored money columns rather than trusting a single
    // cached figure. Shipping is never charged online under either plan — the
    // courier collects it — so the charge is a share of the goods value only.
    const goodsTotal = Math.max(0, orderTotal - (Number(order.shipping_cost) || 0));
    const chargeAmount =
      order.payment_plan === "deposit"
        ? Math.round(goodsTotal * 50) / 100
        : goodsTotal;

    if (chargeAmount <= 0) {
      return NextResponse.json(
        { succeeded: false, message: "Nothing to charge for this order" },
        { status: 400 }
      );
    }

    const name = order.customer_name;
    const mobile = order.phone_number;
    const email = `${mobile}@skbags.com`;

    // Deliberately query-string free: EasyKash appends its own params
    // (status, providerRefNum, customerReference, voucher) to this URL, and a
    // gateway that concatenates with "?" instead of "&" would mangle anything
    // we put here. customerReference comes back on its own, and paymentType is
    // already stored on the order as payment_plan.
    // No locale segment: routing is set to `localePrefix: 'never'`, so a
    // prefixed URL is a 307 at best (/en/…) and a 404 at worst (/ar/…). The
    // customer coming back from a payment is the last place to spend a redirect.
    const redirectUrl = `${SITE_URL}/order-success`;

    const payload = {
      amount: chargeAmount,
      currency: "EGP",
      // All non-installment payment options
      paymentOptions: [1, 2, 4, 5, 6],
      cashExpiry: 48,
      name,
      email,
      mobile: String(mobile),
      redirectUrl,
      customerReference: Number(customerReference),
    };

    const response = await fetch(EASYKASH_DIRECT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: EASYKASH_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.redirectUrl) {
      console.error("EasyKash Direct Pay error:", data);
      return NextResponse.json(
        {
          succeeded: false,
          message: data?.message || "Failed to create payment link",
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      succeeded: true,
      data: {
        // The hosted payment page URL — redirect the user here
        paymentUrl: data.redirectUrl,
        chargeAmount,
        // Always includes shipping, and under a deposit plan the other half of
        // the goods as well.
        remainingAmount: Math.round((orderTotal - chargeAmount) * 100) / 100,
        paymentType: order.payment_plan || "full",
      },
    });
  } catch (error: any) {
    console.error("EasyKash create payment error:", error);
    return NextResponse.json(
      {
        succeeded: false,
        message: error.message || "Failed to create payment",
      },
      { status: 500 }
    );
  }
}
