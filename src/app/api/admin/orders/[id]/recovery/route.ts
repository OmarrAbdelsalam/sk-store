import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  checkRecoveryEligibility,
  sendRecoveryEmail,
  undoRecoveryDiscount,
} from "@/lib/order-recovery";
import {
  RECOVERY_DISCOUNT_ENABLED,
  RECOVERY_DISCOUNT_DEFAULT_PERCENT,
  RECOVERY_DISCOUNT_MAX_PERCENT,
  RECOVERY_DISCOUNT_PRESETS,
} from "@/lib/order-emails-config";

type Context = { params: Promise<{ id: string }> };

/**
 * GET — may this order be chased, and if not, why.
 *
 * The panel calls this to decide whether the button is live and what to say
 * when it isn't. The answer is computed fresh every time: an order can be paid
 * between opening the page and reading it.
 */
export async function GET(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ succeeded: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;

  // Both channels answered in one call. They can disagree — a customer already
  // emailed can still be messaged — and the panel needs to say so per button
  // rather than greying both out for one channel's reason.
  const [email, whatsapp] = await Promise.all([
    checkRecoveryEligibility(id, "email"),
    checkRecoveryEligibility(id, "whatsapp"),
  ]);

  return NextResponse.json({
    succeeded: true,
    ...email,
    channels: {
      email: { canSend: email.canSend, code: email.code, message: email.message },
      whatsapp: {
        canSend: whatsapp.canSend,
        code: whatsapp.code,
        message: whatsapp.message,
      },
    },
    discountOptions: {
      enabled: RECOVERY_DISCOUNT_ENABLED,
      defaultPercent: RECOVERY_DISCOUNT_DEFAULT_PERCENT,
      maxPercent: RECOVERY_DISCOUNT_MAX_PERCENT,
      presets: RECOVERY_DISCOUNT_PRESETS,
    },
  });
}

/**
 * POST — grant the discount and send the follow-up.
 *
 * Body: { discountPercent?: number }
 *
 * Eligibility is re-checked inside sendRecoveryEmail rather than trusted from
 * whatever the panel last saw, so a stale tab can't chase a customer who has
 * since paid.
 */
export async function POST(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ succeeded: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // An empty body means "no discount" — not an error.
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

  // WhatsApp runs the identical path and returns a link instead of sending.
  // Anything other than the literal "whatsapp" is email, so a malformed value
  // can never quietly skip the send.
  const channel = body?.channel === "whatsapp" ? "whatsapp" : "email";

  const result = await sendRecoveryEmail(id, {
    discountPercent: raw,
    actorId: auth.admin.userId,
    channel,
  });

  if (!result.sent) {
    // 409, not 400: the request was well formed, the order's state just doesn't
    // allow it. The panel shows `message` verbatim.
    return NextResponse.json(
      { succeeded: false, code: result.code, message: result.message },
      { status: result.code === "send-failed" ? 502 : 409 }
    );
  }

  const moneyNote =
    result.discountApplied > 0
      ? ` ${result.discountApplied.toFixed(2)} EGP taken off — new total ${result.newTotal.toFixed(2)} EGP.`
      : "";

  return NextResponse.json({
    succeeded: true,
    channel: result.channel,
    message:
      result.channel === "whatsapp"
        ? `WhatsApp message ready.${moneyNote}`
        : `Follow-up sent.${moneyNote}`,
    whatsappUrl: result.whatsappUrl,
    discountApplied: result.discountApplied,
    newTotal: result.newTotal,
  });
}

/**
 * DELETE — reverse the discount that went out with a follow-up.
 *
 * The contact marks stay: the message was sent and cannot be unsent. This only
 * puts the price back, which is why the panel makes the consequence explicit
 * before calling it.
 */
export async function DELETE(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ succeeded: false, message: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  const result = await undoRecoveryDiscount(id);

  return NextResponse.json(
    { succeeded: result.undone, message: result.message, restoredTotal: result.restoredTotal },
    { status: result.undone ? 200 : 409 }
  );
}
