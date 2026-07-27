import { NextRequest, NextResponse } from "next/server";
import { orderService, CreateOrderInput } from "@/services/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      sessionId,
      customerName,
      phoneNumber,
      paymentMethod,
      government,
      city,
      detailedAddress,
      notes,
    } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !government) {
      return NextResponse.json(
        { 
          succeeded: false, 
          message: "Missing required fields: customerName, phoneNumber, government" 
        },
        { status: 400 }
      );
    }

    const items = body.items || [];
    const subtotal = body.subtotal || 0;
    const shippingCost = body.shippingCost || 50; // Default shipping
    const discountAmount = body.discountAmount || 0;
    const discountCode = body.discountCode;
    const total = body.total || (subtotal + shippingCost - discountAmount);
    const appliedPromotions = body.appliedPromotions || [];
    const bogoDiscount = body.bogoDiscount || 0;

    // EasyKash payment data (if present)
    const easykashRef = body.easykashRef || undefined;
    const easykashVoucher = body.easykashVoucher || undefined;
    const easykashProvider = body.easykashProvider || undefined;
    const easykashExpiry = body.easykashExpiry || undefined;

    // Create order input
    const orderInput: CreateOrderInput = {
      sessionId: sessionId || `web_${Date.now()}`,
      customerName,
      phoneNumber,
      paymentMethod: paymentMethod || 'cash',
      government,
      city,
      detailedAddress,
      notes,
      items: items.map((item: any) => ({
        productId: item.productId || undefined,
        productName: item.name || item.productName || '',
        productNameAr: item.nameAr || item.productNameAr || undefined,
        productImage: item.image || item.productImage || undefined,
        colorId: item.colorId || undefined,
        colorName: item.colorName || undefined,
        sizeId: item.sizeId || undefined,
        sizeName: item.sizeName || undefined,
        quantity: item.quantity || 1,
        unitPrice: parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0,
      })),
      subtotal,
      shippingCost,
      discountAmount,
      discountCode,
      total,
      appliedPromotions,
      bogoDiscount,
      easykashRef,
      easykashVoucher,
      easykashProvider,
      easykashExpiry,
    };

    // Create order in database
    const order = await orderService.create(orderInput);

    return NextResponse.json({
      succeeded: true,
      message: "Order created successfully",
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        createdAt: order.created_at,
      },
    });

  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { 
        succeeded: false, 
        message: error.message || "Failed to create order" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const orders = await orderService.getBySessionId(sessionId);
      return NextResponse.json({
        succeeded: true,
        data: orders,
      });
    }

    // Return all orders (for admin)
    const orders = await orderService.getAll();
    return NextResponse.json({
      succeeded: true,
      data: orders,
    });

  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { succeeded: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
