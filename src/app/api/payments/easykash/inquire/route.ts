import { NextRequest, NextResponse } from "next/server";

const EASYKASH_API_KEY = process.env.EASYKASH_API_KEY;

/**
 * Inquire about a specific EasyKash transaction by customerReference.
 * GET /api/payments/easykash/inquire?ref=<customerReference>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerReference = searchParams.get("ref");

  if (!customerReference) {
    return NextResponse.json(
      { succeeded: false, message: "Missing ref parameter" },
      { status: 400 }
    );
  }

  if (!EASYKASH_API_KEY) {
    return NextResponse.json(
      { succeeded: false, message: "Payment gateway not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://back.easykash.net/api/cash-api/inquire",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: EASYKASH_API_KEY,
        },
        body: JSON.stringify({ customerReference }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      succeeded: response.ok,
      data: response.ok ? data : null,
      message: response.ok ? undefined : data?.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { succeeded: false, message: error.message || "Inquiry failed" },
      { status: 500 }
    );
  }
}
