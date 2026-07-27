import { NextRequest, NextResponse } from "next/server";

const EASYKASH_API_KEY = process.env.EASYKASH_API_KEY;
const EASYKASH_DIRECT_URL = "https://back.easykash.net/api/directpayv1/pay";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://skbags.com";

/**
 * Creates an EasyKash Direct Payment link.
 * Supports: Credit Card, Debit Card, Mobile Wallets, Fawry, Aman, Meeza.
 *
 * paymentOptions:
 *   1 = Aman cash, 2 = Credit/Debit Card, 4 = Mobile Wallet,
 *   5 = Fawry cash, 6 = Meeza
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      mobile,
      amount,
      customerReference,
      locale = "en",
      paymentType = "full", // "full" | "deposit"
    } = body;

    if (!mobile || !name || !amount || !customerReference) {
      return NextResponse.json(
        {
          succeeded: false,
          message: "Missing required fields: name, mobile, amount, customerReference",
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

    const numericAmount = parseFloat(String(amount));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { succeeded: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    // Deposit = 50% of total, rest is paid on delivery
    const chargeAmount =
      paymentType === "deposit"
        ? parseFloat((numericAmount * 0.5).toFixed(2))
        : numericAmount;

    const redirectUrl = `${SITE_URL}/${locale}/order-success?ref=${customerReference}&paymentType=${paymentType}`;

    const payload = {
      amount: chargeAmount,
      currency: "EGP",
      // All non-installment payment options
      paymentOptions: [1, 2, 4, 5, 6],
      cashExpiry: 48,
      name,
      email: email || `${mobile}@skbags.com`,
      mobile: String(mobile),
      redirectUrl,
      customerReference: Number(customerReference),
    };

    const response = await fetch(EASYKASH_DIRECT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: EASYKASH_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.redirectUrl) {
      console.error("EasyKash Direct Pay error:", data);
      return NextResponse.json(
        {
          succeeded: false,
          message: data?.message || "Failed to create payment link",
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      succeeded: true,
      data: {
        // The hosted payment page URL — redirect the user here
        paymentUrl: data.redirectUrl,
        chargeAmount,
        remainingAmount:
          paymentType === "deposit"
            ? parseFloat((numericAmount * 0.5).toFixed(2))
            : 0,
        paymentType,
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
