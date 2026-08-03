import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { checkRecoveryEligibilityBulk } from "@/lib/order-recovery";

/**
 * Which of these orders can be chased, and why not for the rest.
 *
 * POST rather than GET because the list is long — fifty ids do not belong in a
 * query string. Body: { orderIds: string[], channel?: "email" | "whatsapp" }
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

  const ids = Array.isArray(body?.orderIds)
    ? body.orderIds.filter((id: unknown) => typeof id === "string").slice(0, 200)
    : [];

  if (!ids.length) {
    return NextResponse.json({ succeeded: true, results: {} });
  }

  const channel = body?.channel === "whatsapp" ? "whatsapp" : "email";
  const results = await checkRecoveryEligibilityBulk(ids, channel);

  return NextResponse.json({ succeeded: true, results });
}
