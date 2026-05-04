import { supabase } from "@/lib/supabaseClient";

export type Order = {
  id: string;
  order_number: string;
  session_id?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  
  // Customer info
  customer_name: string;
  phone_number: string;
  whatsapp_number?: string;
  payment_method?: 'cash' | 'visa';
  
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
  paymentMethod?: 'cash' | 'visa';
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
};

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SK-${timestamp}-${random}`;
};

export const orderService = {
  async create(input: CreateOrderInput): Promise<Order> {
    const orderNumber = generateOrderNumber();
    
    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        session_id: input.sessionId,
        status: 'pending',
        customer_name: input.customerName,
        phone_number: input.phoneNumber,
        payment_method: input.paymentMethod || 'cash',
        government: input.government,
        city: input.city,
        detailed_address: input.detailedAddress,
        notes: input.notes,
        subtotal: input.subtotal,
        shipping_cost: input.shippingCost,
        discount_amount: input.discountAmount || 0,
        discount_code: input.discountCode,
        total: input.total,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    if (input.items.length > 0) {
      const orderItems = input.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_name_ar: item.productNameAr,
        product_image: item.productImage,
        color_id: item.colorId,
        color_name: item.colorName,
        size_id: item.sizeId,
        size_name: item.sizeName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
      }
    }

    return order as Order;
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
};
