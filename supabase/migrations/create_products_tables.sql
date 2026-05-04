-- =============================================================
-- PRODUCTS MIGRATION (Add Badge support)
-- Run this in Supabase SQL Editor
-- =============================================================

-- Add badge column to products table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'badge'
  ) THEN
    ALTER TABLE products ADD COLUMN badge TEXT;
  END IF;
END $$;

-- Ensure products table exists with all required columns
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_at_price DECIMAL(10,2),
  material_en TEXT,
  material_ar TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  badge TEXT,  -- new_arrival, best_seller, sold_out, last_piece, sale
  is_active INTEGER DEFAULT 1,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure product_images table exists
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
  is_main INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure product_colors table exists
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
  UNIQUE(product_id, color_id)
);

-- Ensure colors table exists
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  hex_code TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure categories table exists
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Related products table
CREATE TABLE IF NOT EXISTS related_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, related_product_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;

-- Products policies
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow insert products" ON products;
DROP POLICY IF EXISTS "Allow update products" ON products;
DROP POLICY IF EXISTS "Allow delete products" ON products;
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow delete products" ON products FOR DELETE USING (true);

-- Product images policies
DROP POLICY IF EXISTS "Allow public read product_images" ON product_images;
DROP POLICY IF EXISTS "Allow insert product_images" ON product_images;
DROP POLICY IF EXISTS "Allow update product_images" ON product_images;
DROP POLICY IF EXISTS "Allow delete product_images" ON product_images;
CREATE POLICY "Allow public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow insert product_images" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update product_images" ON product_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete product_images" ON product_images FOR DELETE USING (true);

-- Product colors policies
DROP POLICY IF EXISTS "Allow public read product_colors" ON product_colors;
DROP POLICY IF EXISTS "Allow insert product_colors" ON product_colors;
DROP POLICY IF EXISTS "Allow delete product_colors" ON product_colors;
CREATE POLICY "Allow public read product_colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Allow insert product_colors" ON product_colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete product_colors" ON product_colors FOR DELETE USING (true);

-- Colors policies
DROP POLICY IF EXISTS "Allow public read colors" ON colors;
DROP POLICY IF EXISTS "Allow insert colors" ON colors;
DROP POLICY IF EXISTS "Allow update colors" ON colors;
DROP POLICY IF EXISTS "Allow delete colors" ON colors;
CREATE POLICY "Allow public read colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Allow insert colors" ON colors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update colors" ON colors FOR UPDATE USING (true);
CREATE POLICY "Allow delete colors" ON colors FOR DELETE USING (true);

-- Categories policies
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow insert categories" ON categories;
DROP POLICY IF EXISTS "Allow update categories" ON categories;
DROP POLICY IF EXISTS "Allow delete categories" ON categories;
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow delete categories" ON categories FOR DELETE USING (true);

-- Related products policies
DROP POLICY IF EXISTS "Allow public read related_products" ON related_products;
DROP POLICY IF EXISTS "Allow insert related_products" ON related_products;
DROP POLICY IF EXISTS "Allow delete related_products" ON related_products;
CREATE POLICY "Allow public read related_products" ON related_products FOR SELECT USING (true);
CREATE POLICY "Allow insert related_products" ON related_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete related_products" ON related_products FOR DELETE USING (true);

-- Insert default colors if empty
INSERT INTO colors (name_en, hex_code) 
SELECT 'Beige', '#d4a574' WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name_en = 'Beige');
INSERT INTO colors (name_en, hex_code) 
SELECT 'Brown', '#8B4513' WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name_en = 'Brown');
INSERT INTO colors (name_en, hex_code) 
SELECT 'Black', '#000000' WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name_en = 'Black');
INSERT INTO colors (name_en, hex_code) 
SELECT 'White', '#FFFFFF' WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name_en = 'White');
INSERT INTO colors (name_en, hex_code) 
SELECT 'Cream', '#FFFDD0' WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name_en = 'Cream');
INSERT INTO colors (name_en, hex_code) 
SELECT 'Tan', '#D2B48C' WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name_en = 'Tan');

-- Insert default categories if empty
INSERT INTO categories (name_en, display_order) 
SELECT 'Clutches', 1 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_en = 'Clutches');
INSERT INTO categories (name_en, display_order) 
SELECT 'Shoulder Bags', 2 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_en = 'Shoulder Bags');
INSERT INTO categories (name_en, display_order) 
SELECT 'Crossbody Bags', 3 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_en = 'Crossbody Bags');
INSERT INTO categories (name_en, display_order) 
SELECT 'Tote Bags', 4 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_en = 'Tote Bags');

-- =============================================================
-- DONE! Products tables ready.
-- =============================================================
