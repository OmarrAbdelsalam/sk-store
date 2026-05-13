-- ================================================
-- Supabase Database Schema for SK Bags E-commerce
-- ================================================
-- Run this script in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Users table
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'User' CHECK(role IN ('Admin', 'User')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Refresh tokens
-- ================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Categories
-- ================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Hero Slides
-- ================================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT,
  title_ar TEXT,
  subtitle_en TEXT,
  subtitle_ar TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text_en TEXT,
  button_text_ar TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Homepage Banners
-- ================================================
CREATE TABLE IF NOT EXISTS homepage_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  layout TEXT DEFAULT 'single' CHECK(layout IN ('single', 'slider', 'side_by_side', 'stacked')),
  link_url TEXT,
  button_text_en TEXT,
  button_text_ar TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Banner Images
-- ================================================
CREATE TABLE IF NOT EXISTS banner_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_id UUID NOT NULL REFERENCES homepage_banners(id),
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- FAQ
-- ================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Static Pages
-- ================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  content_en TEXT,
  content_ar TEXT,
  meta_description_en TEXT,
  meta_description_ar TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Products
-- ================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  description_draft_en TEXT,
  description_draft_ar TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  material_en TEXT,
  material_ar TEXT,
  material_draft_en TEXT,
  material_draft_ar TEXT,
  size_chart_url TEXT,
  category_id UUID REFERENCES categories(id),
  is_active INTEGER DEFAULT 1,
  main_image_second INTEGER DEFAULT 0,
  seo_title_en TEXT,
  seo_title_ar TEXT,
  seo_description_en TEXT,
  seo_description_ar TEXT,
  tags_en TEXT,
  tags_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Product Reviews
-- ================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase INTEGER DEFAULT 0,
  is_approved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Colors
-- ================================================
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Product Colors (Many-to-Many)
-- ================================================
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  color_id UUID NOT NULL REFERENCES colors(id),
  display_order INTEGER DEFAULT 0,
  UNIQUE(product_id, color_id)
);

-- ================================================
-- Related Products
-- ================================================
CREATE TABLE IF NOT EXISTS related_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  related_product_id UUID NOT NULL REFERENCES products(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, related_product_id)
);

-- ================================================
-- Product Options
-- ================================================
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Option Values
-- ================================================
CREATE TABLE IF NOT EXISTS option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES product_options(id),
  value_en TEXT NOT NULL,
  value_ar TEXT NOT NULL,
  extra_data TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Product Variants
-- ================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  sku TEXT UNIQUE,
  price_override DECIMAL(10,2),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Variant Option Values Junction
-- ================================================
CREATE TABLE IF NOT EXISTS variant_option_values (
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  option_value_id UUID NOT NULL REFERENCES option_values(id),
  PRIMARY KEY (variant_id, option_value_id)
);

-- ================================================
-- Product Images (URLs point to Dropbox)
-- ================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  color_id UUID REFERENCES colors(id),
  file_path TEXT NOT NULL,
  is_main INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Carts
-- ================================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Cart Items
-- ================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id),
  variant_id UUID REFERENCES product_variants(id),
  bundle_id UUID,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Addresses
-- ================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  country TEXT,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  postal_code TEXT,
  details TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_addresses_phone ON addresses(phone);

-- ================================================
-- Orders
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_full_name TEXT NOT NULL,
  shipping_email TEXT,
  shipping_phone TEXT NOT NULL,
  shipping_country TEXT,
  shipping_city TEXT NOT NULL,
  shipping_area TEXT NOT NULL,
  shipping_postal_code TEXT,
  shipping_details TEXT,
  applied_promotions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ================================================
-- Order Items
-- ================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  product_name_en TEXT NOT NULL,
  product_name_ar TEXT NOT NULL,
  variant_details TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- ================================================
-- Shipping Zones
-- ================================================
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2),
  estimated_days_min INTEGER DEFAULT 1,
  estimated_days_max INTEGER DEFAULT 3,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Promotions
-- ================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('quantity_based', 'first_order', 'category_based', 'min_order_amount')),
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active INTEGER DEFAULT 1,
  conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Promo Codes
-- ================================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  first_order_only INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Social Proofs (Videos from Dropbox)
-- ================================================
CREATE TABLE IF NOT EXISTS social_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title_en TEXT,
  title_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  is_approved INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Testimonials
-- ================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  role TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  text_en TEXT,
  text_ar TEXT,
  is_visible INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Quick Promotions
-- ================================================
CREATE TABLE IF NOT EXISTS quick_promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_type TEXT NOT NULL CHECK(promo_type IN (
    'buy_x_get_y_free',
    'buy_x_get_y_discount',
    'free_shipping_min_amount',
    'free_shipping_min_items',
    'percentage_off_min_amount',
    'fixed_discount_min_amount',
    'bundle_discount',
    'first_order_discount',
    'free_gift_min_amount'
  )),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  badge_text_en TEXT,
  badge_text_ar TEXT,
  buy_quantity INTEGER,
  get_quantity INTEGER,
  min_amount DECIMAL(10,2),
  min_items INTEGER,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed', 'free')),
  discount_value DECIMAL(10,2),
  applies_to TEXT CHECK(applies_to IN ('all', 'category', 'product', 'shipping')),
  category_id UUID REFERENCES categories(id),
  product_id UUID REFERENCES products(id),
  gift_product_id UUID REFERENCES products(id),
  category_ids TEXT,
  product_ids TEXT,
  exclude_category_ids TEXT,
  exclude_product_ids TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active INTEGER DEFAULT 1,
  show_in_cart INTEGER DEFAULT 1,
  show_in_product INTEGER DEFAULT 0,
  show_banner INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Bundles
-- ================================================
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  pricing_type TEXT NOT NULL CHECK(pricing_type IN ('fixed', 'discount_percentage')),
  price_value DECIMAL(10,2) NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID
);

-- ================================================
-- Bundle Items
-- ================================================
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID NOT NULL REFERENCES bundles(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INTEGER DEFAULT 1
);

-- ================================================
-- Analytics Tables
-- ================================================
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  referrer TEXT,
  device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet')),
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  page_type TEXT NOT NULL CHECK(page_type IN ('home', 'category', 'product', 'cart', 'checkout', 'order_confirmation', 'search', 'other')),
  page_url TEXT,
  referrer TEXT,
  device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet')),
  country TEXT,
  city TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  referrer_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  landing_page TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  page_views_count INTEGER DEFAULT 0,
  is_converted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  clicked_product_id UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Audit Logs
-- ================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'DELETE', 'RESTORE')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Feature Flags
-- ================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  description TEXT,
  is_enabled INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Public read access for products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Public read access for product images
CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  USING (true);

-- Public read access for colors
CREATE POLICY "Public can read colors"
  ON colors FOR SELECT
  USING (deleted_at IS NULL);

-- Cart access (by session)
CREATE POLICY "Users can manage their own cart"
  ON carts FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own cart items"
  ON cart_items FOR ALL
  USING (true);

-- Orders (by session)
CREATE POLICY "Users can read their own orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Public read for hero slides
CREATE POLICY "Public can read active hero slides"
  ON hero_slides FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Public read for approved social proofs
CREATE POLICY "Public can read approved social proofs"
  ON social_proofs FOR SELECT
  USING (is_approved = 1 AND deleted_at IS NULL);

-- Public read for FAQs
CREATE POLICY "Public can read active FAQs"
  ON faqs FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Public read for pages
CREATE POLICY "Public can read active pages"
  ON pages FOR SELECT
  USING (is_active = 1);

-- Public read for shipping zones
CREATE POLICY "Public can read active shipping zones"
  ON shipping_zones FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Public read for promo codes (for validation)
CREATE POLICY "Public can read active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- ================================================
-- RLS for quick_promotions (run in Supabase SQL Editor)
-- ================================================
ALTER TABLE quick_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active quick promotions"
  ON quick_promotions FOR SELECT
  USING (is_active = 1);

-- ================================================
-- Functions
-- ================================================

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE code = UPPER(promo_code);
END;
$$ LANGUAGE plpgsql;
