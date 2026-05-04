import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { succeeded: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    const orders = await orderService.getBySessionId(sessionId);
    
    // Transform orders to match the expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      sessionId: order.session_id,
      customerName: order.customer_name,
      phoneNumber: order.phone_number,
      government: order.government,
      city: order.city || "",
      detailedAddress: order.detailed_address || "",
      notes: order.notes || "",
      paymentMethod: order.payment_method || "cash",
      orderStatus: order.status,
      discountCode: order.discount_code || null,
      discountPercentage: 0,
      discountAmount: order.discount_amount || 0,
      shippingCost: order.shipping_cost || 0,
      subTotal: order.subtotal || 0,
      totalAmount: order.total || 0,
      orderDate: order.created_at,
      items: (order.items || []).map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productNameAr: item.product_name_ar,
        colorNameAr: item.color_name || "",
        colorNameEn: item.color_name || "",
        sizeName: item.size_name || "",
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.total_price,
        review: null,
      })),
    }));

    return NextResponse.json({
      succeeded: true,
      data: transformedOrders,
    });
  } catch (error: any) {
    console.error("Error fetching orders by session:", error);
    return NextResponse.json(
      { succeeded: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
