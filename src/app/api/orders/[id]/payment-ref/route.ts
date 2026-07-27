import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * PATCH /api/orders/[id]/payment-ref
 * Saves the EasyKash customerReference to the order so the callback
 * can look up the order by easykash_customer_ref.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { easykashCustomerRef } = body;

    if (!id || !easykashCustomerRef) {
      return NextResponse.json(
        { succeeded: false, message: "Missing id or easykashCustomerRef" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("orders")
      .update({
        easykash_customer_ref: String(easykashCustomerRef),
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to save payment ref:", error);
      return NextResponse.json(
        { succeeded: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ succeeded: true });
  } catch (error: any) {
    return NextResponse.json(
      { succeeded: false, message: error.message },
      { status: 500 }
    );
  }
}
