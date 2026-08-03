import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { siteUrl } from "@/lib/site";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The "complete your payment" link from the recovery email.
 *
 * Opens a fresh EasyKash payment page for one order and sends the customer
 * straight to it — one tap from the inbox, no re-entering the checkout form.
 *
 * The token is the only credential, which is why it is a random UUID rather
 * than the order's easykash_customer_ref: that reference comes from a sequence,
 * so a guessable link would let anyone open the payment page of any order.
 *
 * GET /api/pay/resume?t=<recovery_token>
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const home = (locale: string) => `${siteUrl}/${locale}`;

  // A malformed token is never worth a database round trip.
  if (!UUID.test(token)) {
    return NextResponse.redirect(home("ar"), { status: 302 });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, locale, payment_status, easykash_customer_ref, easykash_voucher")
      .eq("recovery_token", token)
      .maybeSingle();

    if (error) throw error;

    const locale = order?.locale === "en" ? "en" : "ar";

    if (!order) {
      return NextResponse.redirect(home(locale), { status: 302 });
    }

    const ref = order.easykash_customer_ref
      ? encodeURIComponent(String(order.easykash_customer_ref))
      : "";
    const orderPage = ref
      ? `${siteUrl}/${locale}/order-success?ref=${ref}`
      : home(locale);

    // Settled for good — most likely the customer paid between the follow-up
    // and opening the link. Show them the order instead of charging them twice.
    //
    // Only these three are final. "expired" and "failed" are not: a Fawry code
    // that ran out, or a card that was declined, is precisely the customer who
    // needs a fresh payment page. Treating those as final was sending a
    // "Pay now" button that quietly bounced to the order page instead.
    const FINAL = ["paid", "delivered", "refunded"];
    if (FINAL.includes(String(order.payment_status)) || !ref) {
      return NextResponse.redirect(orderPage, { status: 302 });
    }

    // A cash voucher is already an open obligation: the customer holds a code
    // that a Fawry or Aman till will accept for 48 hours. Opening a second
    // payment page here is how someone pays for one order twice, so send them
    // to the order — where the code they already have is displayed.
    if (order.easykash_voucher) {
      return NextResponse.redirect(orderPage, { status: 302 });
    }

    // Reuse the checkout's own payment endpoint rather than rebuilding the
    // EasyKash payload here: it recomputes the charge from the stored order,
    // and two copies of that arithmetic would eventually disagree.
    const response = await fetch(`${siteUrl}/api/payments/easykash/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerReference: order.easykash_customer_ref,
        locale,
      }),
      cache: "no-store",
    });

    const payment = await response.json().catch(() => null);

    if (!response.ok || !payment?.data?.paymentUrl) {
      console.error(
        "Resume payment: could not create payment link",
        payment?.message || response.status
      );
      return NextResponse.redirect(orderPage, { status: 302 });
    }

    return NextResponse.redirect(payment.data.paymentUrl, { status: 302 });
  } catch (err: any) {
    console.error("Resume payment error:", err?.message);
    return NextResponse.redirect(home("ar"), { status: 302 });
  }
}
