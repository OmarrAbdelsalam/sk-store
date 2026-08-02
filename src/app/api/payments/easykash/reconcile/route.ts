import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { mapEasykashStatus } from "@/lib/easykash";
import { inquireEasykash, easykashUpdateFields } from "@/lib/easykash-api";

const CRON_SECRET = process.env.CRON_SECRET;

/** Leave the live checkout flow alone — the success page is already polling it. */
const MIN_AGE_MINUTES = 15;
/** Cash vouchers are created with cashExpiry=48h, so a week covers every case. */
const MAX_AGE_DAYS = 7;
/** Cap the work per run so a backlog can't blow the function's time limit. */
const BATCH_SIZE = 50;
/** Requests in flight against EasyKash at once. */
const CONCURRENCY = 4;

/**
 * Sweeps orders whose payment never resolved.
 *
 * The callback only fires on success (its status is always "PAID"), so a
 * customer who abandons the gateway — or closes the tab before being redirected
 * back — leaves an order stuck at "unpaid" with nothing to correct it. This
 * asks EasyKash directly what happened to each one.
 *
 * GET /api/payments/easykash/reconcile
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // This route reads and writes payment state, so it is never public.
  if (!CRON_SECRET) {
    console.error("CRON_SECRET is not configured — refusing to run reconcile");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const olderThan = new Date(now - MIN_AGE_MINUTES * 60_000).toISOString();
  const newerThan = new Date(now - MAX_AGE_DAYS * 86_400_000).toISOString();

  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, easykash_customer_ref, payment_status")
      .in("payment_status", ["unpaid", "pending"])
      .not("easykash_customer_ref", "is", null)
      .lt("created_at", olderThan)
      .gt("created_at", newerThan)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) throw error;

    if (!orders?.length) {
      return NextResponse.json({ succeeded: true, checked: 0, updated: 0 });
    }

    const changes: Array<{ orderNumber: string; from: string; to: string }> = [];
    let unresolved = 0;

    for (let i = 0; i < orders.length; i += CONCURRENCY) {
      const batch = orders.slice(i, i + CONCURRENCY);

      await Promise.all(
        batch.map(async (order) => {
          const transaction = await inquireEasykash(String(order.easykash_customer_ref));

          // No answer tells us nothing — leave the order for the next run
          // rather than recording a status we didn't actually get.
          if (!transaction) {
            unresolved++;
            return;
          }

          const mapped = mapEasykashStatus(transaction.status);
          const extraFields = easykashUpdateFields(transaction);

          // Skip the write when nothing moved, so `updated_at` keeps meaning
          // "when this order last actually changed".
          if (mapped === order.payment_status && Object.keys(extraFields).length === 0) {
            return;
          }

          const { error: updateError } = await supabase
            .from("orders")
            .update({
              ...extraFields,
              payment_status: mapped,
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          if (updateError) {
            console.error(
              `Reconcile update failed for ${order.order_number}:`,
              updateError
            );
            return;
          }

          if (mapped !== order.payment_status) {
            changes.push({
              orderNumber: order.order_number,
              from: order.payment_status,
              to: mapped,
            });
          }
        })
      );
    }

    console.log(
      `EasyKash reconcile: checked ${orders.length}, changed ${changes.length}, unresolved ${unresolved}`
    );

    return NextResponse.json({
      succeeded: true,
      checked: orders.length,
      updated: changes.length,
      unresolved,
      changes,
    });
  } catch (error: any) {
    console.error("EasyKash reconcile error:", error);
    return NextResponse.json(
      { succeeded: false, message: error.message || "Reconcile failed" },
      { status: 500 }
    );
  }
}
