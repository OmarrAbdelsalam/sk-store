import { NextRequest, NextResponse } from "next/server";

const EASYKASH_API_KEY = process.env.EASYKASH_API_KEY;
const EASYKASH_BASE_URL =
  process.env.EASYKASH_BASE_URL || "https://back.easykash.net/api/cash-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      payerEmail,
      payerMobile,
      payerName,
      amount,
      expiryDuration,
      voucherData,
      type = "in",
    } = body;

    // Validate required fields
    if (!payerMobile || !payerName || !amount) {
      return NextResponse.json(
        {
          succeeded: false,
          message: "Missing required fields: payerMobile, payerName, amount",
        },
        { status: 400 }
      );
    }

    if (!EASYKASH_API_KEY) {
      console.error("EASYKASH_API_KEY is not configured");
      return NextResponse.json(
        { succeeded: false, message: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Valid expiry durations: cash-in = {3, 6, 12, 48}, cash-out = {48}
    const validDurations = type === "out" ? [48] : [3, 6, 12, 48];
    const resolvedExpiry = validDurations.includes(Number(expiryDuration))
      ? Number(expiryDuration)
      : 48;

    const payload = {
      payerEmail: payerEmail || `${payerMobile}@skbags.com`,
      payerMobile,
      payerName,
      amount: Number(amount),
      expiryDuration: resolvedExpiry,
      apiKey: EASYKASH_API_KEY,
      VoucherData: voucherData || "SK Bags Order",
      type,
    };

    const response = await fetch(`${EASYKASH_BASE_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("EasyKash API error:", data);
      return NextResponse.json(
        {
          succeeded: false,
          message: data?.message || "Payment creation failed",
        },
        { status: response.status }
      );
    }

    // EasyKash returns: voucher, expiryDate, provider, easykashRef
    return NextResponse.json({
      succeeded: true,
      data: {
        voucher: data.voucher,
        expiryDate: data.expiryDate,
        provider: data.provider,
        easykashRef: data.easykashRef,
      },
    });
  } catch (error: any) {
    console.error("EasyKash create payment error:", error);
    return NextResponse.json(
      {
        succeeded: false,
        message: error.message || "Failed to create payment",
      },
      { status: 500 }
    );
  }
}
