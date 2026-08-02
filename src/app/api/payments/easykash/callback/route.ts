import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { mapEasykashStatus } from "@/lib/easykash";

const EASYKASH_HMAC_SECRET = process.env.EASYKASH_HMAC_SECRET;

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

    if (customerReference) {
      const { data, error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("easykash_customer_ref", String(customerReference))
        .select("id");
      matched = data?.length || 0;
      updateError = error;
    }

    if (matched === 0 && easykashRef) {
      const { data, error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("easykash_ref", easykashRef)
        .select("id");
      matched = data?.length || 0;
      updateError = error || updateError;
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
