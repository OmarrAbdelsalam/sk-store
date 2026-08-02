import { supabase } from "@/lib/supabaseClient";
import type { AppliedPromotion } from "@/lib/localStorage";
import { promotionService } from "@/services/promotions";

export type Order = {
  id: string;
  order_number: string;
  session_id?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  
  // Customer info
  customer_name: string;
  phone_number: string;
  whatsapp_number?: string;
  payment_method?: 'cash' | 'visa' | 'easykash';
  
  // Payment tracking
  payment_status?: 'unpaid' | 'pending' | 'paid' | 'expired' | 'failed' | 'refunded' | 'delivered';
  payment_plan?: 'full' | 'deposit';
  deposit_amount?: number;
  remaining_amount?: number;
  easykash_ref?: string;
  easykash_voucher?: string;
  easykash_provider?: string;
  easykash_expiry?: string;
  easykash_payment_method?: string;
  easykash_customer_ref?: string;
  
  // Shipping address
  government: string;
  city?: string;
  detailed_address?: string;
  notes?: string;
  
  // Totals
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  discount_code?: string;
  total: number;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  is_read?: boolean;
  
  // Relations
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_name_ar?: string;
  product_image?: string;
  color_id?: string;
  color_name?: string;
  size_id?: string;
  size_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type CreateOrderInput = {
  sessionId: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  paymentMethod?: 'cash' | 'visa' | 'easykash';
  paymentPlan?: 'full' | 'deposit';
  depositAmount?: number;
  remainingAmount?: number;
  government: string;
  city?: string;
  detailedAddress?: string;
  notes?: string;
  items: {
    productId?: string;
    productName: string;
    productNameAr?: string;
    productImage?: string;
    colorId?: string;
    colorName?: string;
    sizeId?: string;
    sizeName?: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  shippingCost: number;
  discountAmount?: number;
  discountCode?: string;
  total: number;
  appliedPromotions?: AppliedPromotion[];
  bogoDiscount?: number;
  // EasyKash payment data (if applicable)
  easykashRef?: string;
  easykashVoucher?: string;
  easykashProvider?: string;
  easykashExpiry?: string;
  easykashCustomerRef?: string;
};

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SK-${timestamp}-${random}`;
};

type SupabaseLike = typeof supabase;

/**
 * Orders live behind row level security, so which key runs the query decides
 * what it can see. The browser gets the anon key and is allowed nothing unless
 * signed in as an admin; trusted server routes pass the service-role client.
 */
export const createOrderService = (db: SupabaseLike) => ({
  async create(input: CreateOrderInput): Promise<Order> {
    const orderNumber = generateOrderNumber();

    const paymentStatus = input.easykashRef ? 'pending' : 'unpaid';

    // easykash_customer_ref defaults to a sequence value in the database, and an
    // explicit null would override that default — so the key is only included
    // when a reference was actually supplied.
    const customerRefField = input.easykashCustomerRef
      ? { easykash_customer_ref: input.easykashCustomerRef }
      : {};

    // 1. Create order
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        order_number: orderNumber,
        session_id: input.sessionId,
        status: 'pending',
        customer_name: input.customerName,
        phone_number: input.phoneNumber,
        email: input.email || null,
        payment_method: input.paymentMethod || 'cash',
        payment_status: paymentStatus,
        payment_plan: input.paymentPlan || 'full',
        deposit_amount: input.depositAmount || null,
        remaining_amount: input.remainingAmount || null,
        easykash_ref: input.easykashRef || null,
        easykash_voucher: input.easykashVoucher || null,
        easykash_provider: input.easykashProvider || null,
        easykash_expiry: input.easykashExpiry || null,
        ...customerRefField,
        government: input.government,
        city: input.city,
        detailed_address: input.detailedAddress,
        notes: input.notes,
        subtotal: input.subtotal,
        shipping_cost: input.shippingCost,
        discount_amount: input.discountAmount || 0,
        discount_code: input.discountCode,
        total: input.total,
        applied_promotions: input.appliedPromotions ? JSON.stringify(input.appliedPromotions) : null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    if (input.items.length > 0) {
      const orderItems = input.items.map(item => ({
        order_id: order.id,
        product_id: item.productId || null,
        product_name: item.productName || '',
        product_name_ar: item.productNameAr || null,
        product_image: item.productImage || null,
        color_id: item.colorId || null,
        color_name: item.colorName || null,
        size_id: item.sizeId || null,
        size_name: item.sizeName || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }));

      const { error: itemsError } = await db
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
      }
    }

    // 3. Increment promo code usage (non-blocking)
    if (input.appliedPromotions?.length) {
      const promoCodeEntry = input.appliedPromotions.find(p => p.type === 'promo_code');
      if (promoCodeEntry) {
        // Same client as the order write, so a server-side checkout increments
        // with the service-role key instead of being blocked by RLS.
        promotionService.incrementUsage(promoCodeEntry.promotionId, db)
          .catch(err => console.error('Failed to increment promo code usage:', err));
      }
    }

    return order as Order;
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await db
      .from("orders")
      .select(`
        *,
        items:order_items (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Order;
  },

  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await db
      .from("orders")
      .select(`
        *,
        items:order_items (*)
      `)
      .eq("order_number", orderNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Order | null;
  },

  async getBySessionId(sessionId: string): Promise<Order[]> {
    const { data, error } = await db
      .from("orders")
      .select(`
        *,
        items:order_items (*)
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await db
      .from("orders")
      .select(`
        *,
        items:order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await db
      .from("orders")
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await db
      .from("orders")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllRead(): Promise<void> {
    const { error } = await db
      .from("orders")
      .update({ is_read: true })
      .eq("is_read", false);
    if (error) throw error;
  },
});

/**
 * Browser-side instance. Every call carries the anon key — or the signed-in
 * admin's token once they log in — so row level security decides what comes
 * back. Server routes should build their own with the service-role client
 * instead of reaching for this one.
 */
export const orderService = createOrderService(supabase);
