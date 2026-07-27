import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabaseClient";

const EASYKASH_HMAC_SECRET = process.env.EASYKASH_HMAC_SECRET;

/**
 * EasyKash Callback endpoint.
 * EasyKash POSTs payment confirmations here. We verify the HMAC signature
 * (when a secret is configured) and update the order's payment status.
 *
 * Expected payload from EasyKash (shape may vary — log and adjust as needed):
 * {
 *   easykashRef: string,
 *   status: string,       // e.g. "PAID", "EXPIRED", "FAILED"
 *   amount: number,
 *   voucher: string,
 *   signature?: string,   // HMAC-SHA256 of the payload
 * }
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

    // Verify HMAC signature when a secret is configured
    if (EASYKASH_HMAC_SECRET) {
      const signature =
        request.headers.get("x-easykash-signature") || payload.signature;

      if (!signature) {
        console.warn("EasyKash callback: missing signature");
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 }
        );
      }

      const expectedSig = crypto
        .createHmac("sha256", EASYKASH_HMAC_SECRET)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSig) {
        console.warn("EasyKash callback: invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const { easykashRef, status } = payload;

    if (!easykashRef) {
      return NextResponse.json(
        { error: "Missing easykashRef" },
        { status: 400 }
      );
    }

    // Map EasyKash status to our internal payment_status
    const paymentStatus = mapEasykashStatus(status);

    // Update the order matching this easykash reference
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("easykash_ref", easykashRef);

    if (error) {
      console.error("Supabase update error (callback):", error);
      // Still return 200 so EasyKash doesn't keep retrying with a bad ref
    }

    console.log(
      `EasyKash callback processed: ref=${easykashRef}, status=${status} → ${paymentStatus}`
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
    case "SUCCESS":
    case "SUCCESSFUL":
      return "paid";
    case "EXPIRED":
      return "expired";
    case "FAILED":
    case "CANCELLED":
      return "failed";
    default:
      return "pending";
  }
}
