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

-- Cart access
CREATE POLICY "Users can manage their own cart"
  ON carts FOR ALL
  USING (true);

CREATE POLICY "Users can manage their own cart items"
  ON cart_items FOR ALL
  USING (true);

-- Orders
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

-- Hero slides
CREATE POLICY "Public can read active hero slides"
  ON hero_slides FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Social proofs
CREATE POLICY "Public can read approved social proofs"
  ON social_proofs FOR SELECT
  USING (is_approved = 1 AND deleted_at IS NULL);

-- FAQs
CREATE POLICY "Public can read active FAQs"
  ON faqs FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Pages
CREATE POLICY "Public can read active pages"
  ON pages FOR SELECT
  USING (is_active = 1);

-- Shipping zones
CREATE POLICY "Public can read active shipping zones"
  ON shipping_zones FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Promo codes
CREATE POLICY "Public can read active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = 1 AND deleted_at IS NULL);

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE code = UPPER(promo_code);
END;
$$ LANGUAGE plpgsql;;
