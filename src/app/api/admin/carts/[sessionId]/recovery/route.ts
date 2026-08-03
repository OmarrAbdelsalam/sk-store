import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  checkCartRecoveryEligibility,
  sendCartRecoveryEmail,
} from "@/lib/cart-recovery";
import {
  RECOVERY_DISCOUNT_ENABLED,
  RECOVERY_DISCOUNT_DEFAULT_PERCENT,
  RECOVERY_DISCOUNT_MAX_PERCENT,
  RECOVERY_DISCOUNT_PRESETS,
} from "@/lib/order-emails-config";

type Context = { params: Promise<{ sessionId: string }> };

const discountOptions = {
  enabled: RECOVERY_DISCOUNT_ENABLED,
  defaultPercent: RECOVERY_DISCOUNT_DEFAULT_PERCENT,
  maxPercent: RECOVERY_DISCOUNT_MAX_PERCENT,
  presets: RECOVERY_DISCOUNT_PRESETS,
};

/** GET — may this cart be chased, and if not, why. */
export async function GET(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ succeeded: false, message: auth.message }, { status: auth.status });
  }

  const { sessionId } = await params;

  // Both channels in one call — see the order route for why.
  const [email, whatsapp] = await Promise.all([
    checkCartRecoveryEligibility(sessionId, "email"),
    checkCartRecoveryEligibility(sessionId, "whatsapp"),
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
    discountOptions,
  });
}

/**
 * POST — mint the code and send the reminder.
 *
 * Body: { discountPercent?: number }
 */
export async function POST(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ succeeded: false, message: auth.message }, { status: auth.status });
  }

  const { sessionId } = await params;

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // No body means no discount, which is a valid choice.
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

  const result = await sendCartRecoveryEmail(sessionId, {
    discountPercent: raw,
    actorId: auth.admin.userId,
    channel,
  });

  if (!result.sent) {
    // 409, not 400: the request was fine, the cart's state just doesn't allow
    // it. The panel shows `message` verbatim.
    return NextResponse.json(
      { succeeded: false, code: result.code, message: result.message },
      { status: result.code === "send-failed" ? 502 : 409 }
    );
  }

  const codeNote = result.promoCode
    ? ` Single-use ${result.percent}% code: ${result.promoCode}`
    : "";

  return NextResponse.json({
    succeeded: true,
    channel: result.channel,
    message:
      result.channel === "whatsapp"
        ? `WhatsApp message ready.${codeNote}`
        : `Reminder sent.${codeNote}`,
    whatsappUrl: result.whatsappUrl,
    promoCode: result.promoCode,
  });
}
