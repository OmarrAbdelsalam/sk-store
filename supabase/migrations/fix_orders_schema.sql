-- =============================================================
-- COMPLETE ORDERS TABLE SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================================

-- Drop old tables if they exist (WARNING: This will delete existing orders!)
-- Comment these lines if you want to keep existing data
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  session_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  
  -- Customer info
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cash', -- cash, visa
  
  -- Shipping address
  government TEXT NOT NULL,
  city TEXT,
  detailed_address TEXT,
  notes TEXT,
  
  -- Totals
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_name_ar TEXT,
  product_image TEXT,
  color_id UUID,
  color_name TEXT,
  size_id UUID,
  size_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
DROP POLICY IF EXISTS "Allow public read orders" ON orders;
DROP POLICY IF EXISTS "Allow insert orders" ON orders;
DROP POLICY IF EXISTS "Allow update orders" ON orders;
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update orders" ON orders FOR UPDATE USING (true);

-- Order items policies
DROP POLICY IF EXISTS "Allow public read order_items" ON order_items;
DROP POLICY IF EXISTS "Allow insert order_items" ON order_items;
CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Verify the schema
SELECT 'Orders table created successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
