import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { mapEasykashStatus } from "@/lib/easykash";
import { inquireEasykash, easykashUpdateFields } from "@/lib/easykash-api";
import { sendOrderConfirmation } from "@/lib/order-emails";

/**
 * Authoritative payment status for an order.
 *
 * Landing on /order-success proves nothing — it's just where EasyKash sends the
 * browser, and anyone can type that URL. This route is the source of truth: it
 * reads the status the HMAC-verified callback wrote, and when that hasn't landed
 * yet (or was missed) it reconciles against EasyKash's inquire API.
 *
 * GET /api/payments/easykash/status?ref=<customerReference>
 */
export async function GET(request: NextRequest) {
  const ref = new URL(request.url).searchParams.get("ref");

  if (!ref) {
    return NextResponse.json(
      { succeeded: false, message: "Missing ref parameter" },
      { status: 400 }
    );
  }

  try {
    // customerReference is derived from the order number's digits, so a
    // collision is possible — take the most recent match rather than letting
    // .single() turn a duplicate into a 500.
    // Explicit column list, never `*`. This endpoint is unauthenticated and
    // references are sequential, so anything selected here can be walked by
    // incrementing ref. customer_name, phone_number, government, city,
    // detailed_address and notes are deliberately excluded — the browser that
    // placed the order already has them cached locally and nobody else has any
    // business reading them.
    const { data: rows, error } = await supabase
      .from("orders")
      .select(
        `id, order_number, payment_status, payment_plan, total, subtotal,
         shipping_cost, discount_amount, deposit_amount,
         remaining_amount, easykash_ref, easykash_voucher, easykash_provider,
         easykash_expiry, easykash_payment_method, created_at,
         items:order_items (product_name, product_name_ar, product_image,
           color_name, size_name, quantity, unit_price, total_price)`
      )
      .eq("easykash_customer_ref", String(ref))
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    const order = rows?.[0];

    if (!order) {
      return NextResponse.json(
        { succeeded: false, message: "Order not found" },
        { status: 404 }
      );
    }

    let paymentStatus = order.payment_status || "unpaid";
    let reconciled = order;

    // Only reconcile while the outcome is still open — a paid/failed/refunded
    // order was already settled by the callback and must not be walked back.
    if (paymentStatus === "unpaid" || paymentStatus === "pending") {
      const transaction = await inquireEasykash(String(ref));

      if (transaction) {
        const mapped = mapEasykashStatus(transaction.status);

        const updateFields: Record<string, any> = {
          ...easykashUpdateFields(transaction),
          payment_status: mapped,
          updated_at: new Date().toISOString(),
        };

        paymentStatus = mapped;
        reconciled = { ...order, ...updateFields };

        const { error: updateError } = await supabase
          .from("orders")
          .update(updateFields)
          .eq("id", order.id);

        if (updateError) {
          console.error("Supabase update error (status reconcile):", updateError);
        } else if (mapped === "paid") {
          // This poll is sometimes the first place a payment is seen — the
          // callback can be missed or delayed. Claiming is atomic, so the
          // usual case (callback already sent it) costs one no-op UPDATE and
          // the customer never gets a second copy.
          await sendOrderConfirmation(order.id);
        }
      }
    }

    return NextResponse.json({
      succeeded: true,
      data: {
        paymentStatus,
        order: { ...reconciled, payment_status: paymentStatus },
      },
    });
  } catch (error: any) {
    console.error("EasyKash status error:", error);
    return NextResponse.json(
      {
        succeeded: false,
        message: error.message || "Failed to resolve payment status",
      },
      { status: 500 }
    );
  }
}
