import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { mapEasykashStatus } from "@/lib/easykash";

const EASYKASH_HMAC_SECRET = process.env.EASYKASH_HMAC_SECRET;

/**
 * Write one purchase event per line item and close out the abandoned cart.
 *
 * Runs only after the HMAC check has passed, so these are the one set of
 * numbers in the reports that cannot be forged from a browser. Everything here
 * is best-effort — the payment is already recorded, and no reporting failure
 * may turn a successful callback into a retry.
 */
async function recordPurchase(orderId: string, sessionId: string | null) {
  try {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, product_name, color_name, quantity, total_price")
      .eq("order_id", orderId);

    if (items?.length && sessionId) {
      await supabase.from("analytics_events").insert(
        items.map((item: any) => ({
          session_id: sessionId,
          event_name: "purchase",
          product_id: item.product_id,
          product_name: item.product_name,
          color_name: item.color_name,
          quantity: item.quantity,
          value: item.total_price,
          order_id: orderId,
        }))
      );
    }

    if (sessionId) {
      // A cart that was chased and then paid is "recovered"; one that converted
      // on its own is "converted". The distinction is what proves whether the
      // follow-up is worth the effort.
      await supabase.rpc("mark_cart_converted", {
        p_session_id: sessionId,
        p_order_id: orderId,
      });
    }
  } catch (error: any) {
    console.error("recordPurchase failed:", error?.message);
  }
}

/**
 * EasyKash Callback endpoint.
 *
 * EasyKash sends a POST after every successful payment with:
 * {
 *   ProductCode, PaymentMethod, ProductType, Amount,
 *   BuyerEmail, BuyerMobile, BuyerName, Timestamp,
 *   status, voucher, easykashRef, VoucherData,
 *   customerReference, signatureHash
 * }
 *
 * Per the docs this fires on successful payments only — `status` is always
 * "PAID". Failures and expiries never reach here, which is why the order-success
 * page reconciles through the inquire API instead of waiting on this.
 *
 * HMAC verification (SHA-512):
 *   Concatenate in order: ProductCode + Amount + ProductType + PaymentMethod
 *                        + status + easykashRef + customerReference
 *   Hash with HMAC-SHA512 + HMAC secret key → compare with signatureHash
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: Record<string, any>;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // ── HMAC Verification ──────────────────────────────────────────────────
    // This endpoint marks orders as paid, so an unverifiable request must be
    // rejected. Skipping verification when the secret is unset would let anyone
    // who knows the URL mark any order paid.
    if (!EASYKASH_HMAC_SECRET) {
      console.error("EASYKASH_HMAC_SECRET is not configured — rejecting callback");
      return NextResponse.json(
        { error: "Callback verification unavailable" },
        { status: 503 }
      );
    }

    {
      const {
        ProductCode,
        Amount,
        ProductType,
        PaymentMethod,
        status,
        easykashRef,
        customerReference,
        signatureHash,
      } = payload;

      if (!signatureHash) {
        console.warn("EasyKash callback: missing signatureHash");
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      // Exact order and field names from EasyKash docs
      const dataStr = [
        ProductCode,
        Amount,
        ProductType,
        PaymentMethod,
        status,
        easykashRef,
        customerReference,
      ].join("");

      const calculatedSig = crypto
        .createHmac("sha512", EASYKASH_HMAC_SECRET)
        .update(dataStr)
        .digest("hex");

      const signatureBuffer = Buffer.from(String(signatureHash), "utf8");
      const calculatedBuffer = Buffer.from(calculatedSig, "utf8");

      if (
        signatureBuffer.length !== calculatedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, calculatedBuffer)
      ) {
        console.warn("EasyKash callback: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const { easykashRef, status, customerReference, PaymentMethod, voucher, VoucherData } =
      payload;

    if (!easykashRef && !customerReference) {
      return NextResponse.json(
        { error: "Missing easykashRef and customerReference" },
        { status: 400 }
      );
    }

    const paymentStatus = mapEasykashStatus(status);

    // Build update object
    const updateFields: Record<string, any> = {
      payment_status: paymentStatus,
      easykash_payment_method: PaymentMethod || null,
      updated_at: new Date().toISOString(),
    };
    if (easykashRef) updateFields.easykash_ref = easykashRef;
    // Cash payments (Fawry/Aman) carry the code the buyer pays with — without
    // storing it the voucher card on the success page has nothing to show.
    if (voucher) updateFields.easykash_voucher = String(voucher);
    if (VoucherData) updateFields.easykash_provider = String(VoucherData);

    // Match on customerReference (our own ref) first, then easykashRef. A filter
    // that matches nothing is not a Postgres error, so check the affected rows
    // rather than the error to decide whether to fall back.
    let matched = 0;
    let updateError: any = null;
    let matchedOrder: { id: string; session_id: string | null } | null = null;

    if (customerReference) {
      const { data, error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("easykash_customer_ref", String(customerReference))
        .select("id, session_id");
      matched = data?.length || 0;
      matchedOrder = data?.[0] ?? null;
      updateError = error;
    }

    if (matched === 0 && easykashRef) {
      const { data, error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("easykash_ref", easykashRef)
        .select("id, session_id");
      matched = data?.length || 0;
      matchedOrder = data?.[0] ?? null;
      updateError = error || updateError;
    }

    // Purchase is recorded here rather than in the browser: this is the only
    // point where the payment is HMAC-verified, and the customer's tab is on
    // the gateway's domain by now and may never come back.
    if (matchedOrder && paymentStatus === "paid") {
      await recordPurchase(matchedOrder.id, matchedOrder.session_id);
    }

    if (updateError) {
      console.error("Supabase update error (callback):", updateError);
    } else if (matched === 0) {
      console.error(
        `EasyKash callback matched no order: customerRef=${customerReference}, ref=${easykashRef}`
      );
    }

    console.log(
      `EasyKash callback: ref=${easykashRef}, customerRef=${customerReference}, status=${status} → ${paymentStatus}`
    );

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("EasyKash callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
