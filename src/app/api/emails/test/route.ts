import { NextRequest, NextResponse } from "next/server";
import { sendEmail, emailEnabled } from "@/lib/email";
import {
  orderConfirmationEmail,
  orderRecoveryEmail,
  type EmailOrder,
} from "@/lib/email-templates";
import { siteUrl } from "@/lib/site";

const CRON_SECRET = process.env.CRON_SECRET;

/** Stand-in order, shaped like a real one so the template is exercised fully. */
const SAMPLE: EmailOrder = {
  order_number: "SK-TEST-0001",
  customer_name: "Test Customer",
  government: "Cairo",
  city: "Nasr City",
  detailed_address: "12 Mostafa El-Nahas St., 3rd floor",
  phone_number: "+20 101 688 7251",
  subtotal: 2400,
  shipping_cost: 70,
  discount_amount: 200,
  total: 2270,
  payment_plan: "deposit",
  deposit_amount: 1100,
  remaining_amount: 1170,
  items: [
    {
      product_name: "Amara Tote",
      product_image: null,
      color_name: "Sand Beige",
      size_name: "Large",
      quantity: 1,
      unit_price: 1500,
      total_price: 1500,
    },
    {
      product_name: "Nour Mini Bag",
      product_image: null,
      color_name: "Black",
      size_name: null,
      quantity: 2,
      unit_price: 450,
      total_price: 900,
    },
  ],
};

/**
 * Sends the order emails to an address of your choosing, without needing a real
 * order or a real payment. For checking that Resend is wired up and that the
 * templates survive whichever mail client you actually use.
 *
 * Nothing is written to the orders table — only email_log records the sends.
 *
 * GET /api/emails/test?to=you@example.com&kind=both
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // Behind the same secret as the reconcile sweep: an open endpoint that sends
  // mail from a verified domain is a spam relay with extra steps.
  if (!CRON_SECRET) {
    return NextResponse.json(
      { succeeded: false, message: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ succeeded: false, message: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const to = params.get("to")?.trim() || "";
  const kind = params.get("kind") || "both";

  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(to)) {
    return NextResponse.json(
      { succeeded: false, message: "Pass a valid ?to= address" },
      { status: 400 }
    );
  }

  if (!emailEnabled) {
    return NextResponse.json(
      {
        succeeded: false,
        message:
          "Email is not configured — set RESEND_API_KEY and EMAIL_FROM, then restart the server",
      },
      { status: 503 }
    );
  }

  const results: Record<string, unknown> = {};

  if (kind === "both" || kind === "confirmation") {
    const built = orderConfirmationEmail(SAMPLE, `${siteUrl}/order-success?ref=0`);
    results.confirmation = await sendEmail({
      to,
      subject: `[TEST] ${built.subject}`,
      html: built.html,
      text: built.text,
      kind: "order_confirmation",
      orderId: null,
    });
  }

  if (kind === "both" || kind === "recovery") {
    const built = orderRecoveryEmail(SAMPLE, `${siteUrl}/api/pay/resume?t=test`);
    results.recovery = await sendEmail({
      to,
      subject: `[TEST] ${built.subject}`,
      html: built.html,
      text: built.text,
      kind: "order_recovery",
      orderId: null,
    });
  }

  return NextResponse.json({ succeeded: true, to, results });
}
