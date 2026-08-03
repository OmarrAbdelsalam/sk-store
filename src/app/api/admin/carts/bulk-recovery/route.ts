import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendCartRecoveryEmail } from "@/lib/cart-recovery";
import { RECOVERY_DISCOUNT_MAX_PERCENT } from "@/lib/order-emails-config";

/** Capped so one click can't fire off a hundred emails by accident. */
const MAX_BATCH = 25;

/**
 * Sends the cart reminder to several carts in one go.
 *
 * Runs them one at a time rather than in parallel: each send re-checks
 * eligibility, and two carts belonging to the same customer must see each
 * other's result. Fired concurrently they would both pass the "already
 * chased" check and both go out.
 *
 * Body: { sessionIds: string[], discountPercent?: number }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ succeeded: false, message: auth.message }, { status: auth.status });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ succeeded: false, message: "Invalid body" }, { status: 400 });
  }

  const sessionIds: string[] = Array.isArray(body?.sessionIds)
    ? body.sessionIds.filter((id: unknown) => typeof id === "string").slice(0, MAX_BATCH)
    : [];

  if (!sessionIds.length) {
    return NextResponse.json({ succeeded: false, message: "Nothing selected." }, { status: 400 });
  }

  const raw = Number(body?.discountPercent ?? 0);
  if (raw && (!Number.isFinite(raw) || raw < 0 || raw > RECOVERY_DISCOUNT_MAX_PERCENT)) {
    return NextResponse.json(
      {
        succeeded: false,
        message: `The discount has to be between 0 and ${RECOVERY_DISCOUNT_MAX_PERCENT}%.`,
      },
      { status: 400 }
    );
  }

  // WhatsApp is deliberately not offered here: it opens a browser tab per
  // message, which is not something a batch can do.
  const results: Array<{ sessionId: string; sent: boolean; message: string }> = [];

  for (const sessionId of sessionIds) {
    const result = await sendCartRecoveryEmail(sessionId, {
      discountPercent: raw,
      actorId: auth.admin.userId,
      channel: "email",
    });

    results.push({
      sessionId,
      sent: result.sent,
      message: result.sent
        ? result.promoCode
          ? `Sent with code ${result.promoCode}`
          : "Sent"
        : result.message,
    });
  }

  const sent = results.filter((r) => r.sent).length;

  return NextResponse.json({
    succeeded: true,
    sent,
    skipped: results.length - sent,
    // Every skip carries its reason, so a batch that mostly does nothing can
    // be understood rather than just looking broken.
    results,
  });
}
