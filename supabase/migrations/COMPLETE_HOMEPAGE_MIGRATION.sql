-- =============================================================
-- COMPLETE HOMEPAGE SECTIONS MIGRATION
-- Run this in Supabase SQL Editor to create all tables
-- =============================================================

-- =============================================================
-- 1. HERO SETTINGS
-- =============================================================
CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'The Maison Clutch',
  subtitle TEXT DEFAULT 'Introducing The Maison Clutch — a celebration of refined simplicity and timeless design.',
  description TEXT DEFAULT 'Handwoven with precision, kissed by soft beige tones, and crafted to complement every mood and moment, for autumn vibes. It''s not just an accessory, it''s the definition of effortless sophistication.',
  button_text TEXT DEFAULT 'SHOP NOW',
  button_link TEXT DEFAULT '/products',
  image_url TEXT DEFAULT '/hero.webp',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO hero_settings (title, subtitle, description, button_text, button_link, image_url, is_active)
SELECT 'The Maison Clutch',
       'Introducing The Maison Clutch — a celebration of refined simplicity and timeless design.',
       'Handwoven with precision, kissed by soft beige tones, and crafted to complement every mood and moment, for autumn vibes. It''s not just an accessory, it''s the definition of effortless sophistication.',
       'SHOP NOW', '/products', '/hero.webp', true
WHERE NOT EXISTS (SELECT 1 FROM hero_settings LIMIT 1);

ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read hero_settings" ON hero_settings;
DROP POLICY IF EXISTS "Allow update hero_settings" ON hero_settings;
DROP POLICY IF EXISTS "Allow insert hero_settings" ON hero_settings;
CREATE POLICY "Allow public read hero_settings" ON hero_settings FOR SELECT USING (true);
CREATE POLICY "Allow update hero_settings" ON hero_settings FOR UPDATE USING (true);
CREATE POLICY "Allow insert hero_settings" ON hero_settings FOR INSERT WITH CHECK (true);

-- =============================================================
-- 2. CUSTOMER LOVE (Testimonial Images)
-- =============================================================
CREATE TABLE IF NOT EXISTS customer_love (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  video_url TEXT,
  customer_name TEXT,
  rating INTEGER DEFAULT 5,
  review_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_love_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT 'Customer Love',
  subtitle TEXT DEFAULT 'See what our customers are saying about their SK Bags',
  instagram_handle TEXT DEFAULT '@skbags',
  cta_text TEXT DEFAULT 'Share your SK Bags moment with us!',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO customer_love_settings (title, subtitle, instagram_handle, cta_text, is_active)
SELECT 'Customer Love', 'See what our customers are saying about their SK Bags', '@skbags', 'Share your SK Bags moment with us!', true
WHERE NOT EXISTS (SELECT 1 FROM customer_love_settings LIMIT 1);

ALTER TABLE customer_love ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_love_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read customer_love" ON customer_love;
DROP POLICY IF EXISTS "Allow insert customer_love" ON customer_love;
DROP POLICY IF EXISTS "Allow update customer_love" ON customer_love;
DROP POLICY IF EXISTS "Allow delete customer_love" ON customer_love;
DROP POLICY IF EXISTS "Allow public read customer_love_settings" ON customer_love_settings;
DROP POLICY IF EXISTS "Allow update customer_love_settings" ON customer_love_settings;
CREATE POLICY "Allow public read customer_love" ON customer_love FOR SELECT USING (true);
CREATE POLICY "Allow insert customer_love" ON customer_love FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update customer_love" ON customer_love FOR UPDATE USING (true);
CREATE POLICY "Allow delete customer_love" ON customer_love FOR DELETE USING (true);
CREATE POLICY "Allow public read customer_love_settings" ON customer_love_settings FOR SELECT USING (true);
CREATE POLICY "Allow update customer_love_settings" ON customer_love_settings FOR UPDATE USING (true);

-- =============================================================
-- 3. MORE TO DISCOVER (Gallery Images)
-- =============================================================
CREATE TABLE IF NOT EXISTS more_to_discover (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  link TEXT DEFAULT '/products',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS more_to_discover_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT DEFAULT 'More to Discover',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO more_to_discover_settings (section_title, is_active)
SELECT 'More to Discover', true
WHERE NOT EXISTS (SELECT 1 FROM more_to_discover_settings LIMIT 1);

ALTER TABLE more_to_discover ENABLE ROW LEVEL SECURITY;
ALTER TABLE more_to_discover_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read more_to_discover" ON more_to_discover;
DROP POLICY IF EXISTS "Allow insert more_to_discover" ON more_to_discover;
DROP POLICY IF EXISTS "Allow update more_to_discover" ON more_to_discover;
DROP POLICY IF EXISTS "Allow delete more_to_discover" ON more_to_discover;
DROP POLICY IF EXISTS "Allow public read more_to_discover_settings" ON more_to_discover_settings;
DROP POLICY IF EXISTS "Allow update more_to_discover_settings" ON more_to_discover_settings;
CREATE POLICY "Allow public read more_to_discover" ON more_to_discover FOR SELECT USING (true);
CREATE POLICY "Allow insert more_to_discover" ON more_to_discover FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update more_to_discover" ON more_to_discover FOR UPDATE USING (true);
CREATE POLICY "Allow delete more_to_discover" ON more_to_discover FOR DELETE USING (true);
CREATE POLICY "Allow public read more_to_discover_settings" ON more_to_discover_settings FOR SELECT USING (true);
CREATE POLICY "Allow update more_to_discover_settings" ON more_to_discover_settings FOR UPDATE USING (true);

-- =============================================================
-- 4. OUR VIBES (Video Reels)
-- =============================================================
CREATE TABLE IF NOT EXISTS our_vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT NOT NULL,
  product_id UUID,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS our_vibes_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT DEFAULT 'Our Vibes',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO our_vibes_settings (section_title, is_active)
SELECT 'Our Vibes', true
WHERE NOT EXISTS (SELECT 1 FROM our_vibes_settings LIMIT 1);

ALTER TABLE our_vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_vibes_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read our_vibes" ON our_vibes;
DROP POLICY IF EXISTS "Allow insert our_vibes" ON our_vibes;
DROP POLICY IF EXISTS "Allow update our_vibes" ON our_vibes;
DROP POLICY IF EXISTS "Allow delete our_vibes" ON our_vibes;
DROP POLICY IF EXISTS "Allow public read our_vibes_settings" ON our_vibes_settings;
DROP POLICY IF EXISTS "Allow update our_vibes_settings" ON our_vibes_settings;
CREATE POLICY "Allow public read our_vibes" ON our_vibes FOR SELECT USING (true);
CREATE POLICY "Allow insert our_vibes" ON our_vibes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update our_vibes" ON our_vibes FOR UPDATE USING (true);
CREATE POLICY "Allow delete our_vibes" ON our_vibes FOR DELETE USING (true);
CREATE POLICY "Allow public read our_vibes_settings" ON our_vibes_settings FOR SELECT USING (true);
CREATE POLICY "Allow update our_vibes_settings" ON our_vibes_settings FOR UPDATE USING (true);

-- =============================================================
-- 5. MARQUEE (Scrolling Banner)
-- =============================================================
CREATE TABLE IF NOT EXISTS marquee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marquee_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color VARCHAR(20) DEFAULT '#000000',
  text_color VARCHAR(20) DEFAULT '#ffffff',
  scroll_speed INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO marquee_settings (background_color, text_color, scroll_speed, is_active)
SELECT '#000000', '#ffffff', 30, true
WHERE NOT EXISTS (SELECT 1 FROM marquee_settings LIMIT 1);

INSERT INTO marquee_items (text, display_order) 
SELECT 'SHIPPING ACROSS ALL EGYPT', 1 WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE text = 'SHIPPING ACROSS ALL EGYPT');
INSERT INTO marquee_items (text, display_order) 
SELECT '100% HANDMADE PRODUCTS', 2 WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE text = '100% HANDMADE PRODUCTS');
INSERT INTO marquee_items (text, display_order) 
SELECT 'PREMIUM QUALITY MATERIALS', 3 WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE text = 'PREMIUM QUALITY MATERIALS');
INSERT INTO marquee_items (text, display_order) 
SELECT 'FREE SHIPPING OVER 500 EGP', 4 WHERE NOT EXISTS (SELECT 1 FROM marquee_items WHERE text = 'FREE SHIPPING OVER 500 EGP');

ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marquee_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read marquee_items" ON marquee_items;
DROP POLICY IF EXISTS "Allow insert marquee_items" ON marquee_items;
DROP POLICY IF EXISTS "Allow update marquee_items" ON marquee_items;
DROP POLICY IF EXISTS "Allow delete marquee_items" ON marquee_items;
DROP POLICY IF EXISTS "Allow public read marquee_settings" ON marquee_settings;
DROP POLICY IF EXISTS "Allow update marquee_settings" ON marquee_settings;
CREATE POLICY "Allow public read marquee_items" ON marquee_items FOR SELECT USING (true);
CREATE POLICY "Allow insert marquee_items" ON marquee_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update marquee_items" ON marquee_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete marquee_items" ON marquee_items FOR DELETE USING (true);
CREATE POLICY "Allow public read marquee_settings" ON marquee_settings FOR SELECT USING (true);
CREATE POLICY "Allow update marquee_settings" ON marquee_settings FOR UPDATE USING (true);

-- =============================================================
-- 6. MOBILE HERO (Full-screen Mobile Banner)
-- =============================================================
CREATE TABLE IF NOT EXISTS mobile_hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  button_text TEXT DEFAULT 'SHOP BAGS',
  button_link TEXT DEFAULT '/products',
  text_color TEXT DEFAULT '#ffffff',
  media_url TEXT DEFAULT '/hero.webp',
  media_type TEXT DEFAULT 'image',  -- 'image' or 'video'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO mobile_hero (button_text, button_link, text_color, media_url, media_type, is_active)
SELECT 'SHOP BAGS', '/products', '#ffffff', '/hero.webp', 'image', true
WHERE NOT EXISTS (SELECT 1 FROM mobile_hero LIMIT 1);

ALTER TABLE mobile_hero ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read mobile_hero" ON mobile_hero;
DROP POLICY IF EXISTS "Allow update mobile_hero" ON mobile_hero;
DROP POLICY IF EXISTS "Allow insert mobile_hero" ON mobile_hero;
CREATE POLICY "Allow public read mobile_hero" ON mobile_hero FOR SELECT USING (true);
CREATE POLICY "Allow update mobile_hero" ON mobile_hero FOR UPDATE USING (true);
CREATE POLICY "Allow insert mobile_hero" ON mobile_hero FOR INSERT WITH CHECK (true);

-- =============================================================
-- DONE! All tables created successfully.
-- =============================================================
