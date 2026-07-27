import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabaseClient";

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
    if (EASYKASH_HMAC_SECRET) {
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

      if (calculatedSig !== signatureHash) {
        console.warn("EasyKash callback: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const { easykashRef, status, customerReference, Amount, PaymentMethod } = payload;

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

    // Try to find by customerReference first (our order's internal ref), then easykashRef
    let updateError: any = null;

    if (customerReference) {
      const { error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("easykash_customer_ref", String(customerReference));
      updateError = error;
    }

    if (updateError && easykashRef) {
      const { error } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("easykash_ref", easykashRef);
      updateError = error;
    }

    if (updateError) {
      console.error("Supabase update error (callback):", updateError);
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

function mapEasykashStatus(status: string | undefined): string {
  switch ((status || "").toUpperCase()) {
    case "PAID":
      return "paid";
    case "NEW":
    case "PENDING":
      return "pending";
    case "EXPIRED":
      return "expired";
    case "FAILED":
    case "CANCELLED":
    case "CANCELED":
      return "failed";
    case "REFUNDED":
      return "refunded";
    case "DELIVERED":
      return "delivered";
    default:
      return "pending";
  }
}
