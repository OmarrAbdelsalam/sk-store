-- Create customer_love table for customer testimonials/social proof
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

-- Create customer_love_settings table for section settings
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

-- Insert default settings
INSERT INTO customer_love_settings (title, subtitle, instagram_handle, cta_text, is_active)
VALUES ('Customer Love', 'See what our customers are saying about their SK Bags', '@skbags', 'Share your SK Bags moment with us!', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE customer_love ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_love_settings ENABLE ROW LEVEL SECURITY;

-- Policies for customer_love
CREATE POLICY "Allow public read customer_love" ON customer_love FOR SELECT USING (true);
CREATE POLICY "Allow insert customer_love" ON customer_love FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update customer_love" ON customer_love FOR UPDATE USING (true);
CREATE POLICY "Allow delete customer_love" ON customer_love FOR DELETE USING (true);

-- Policies for customer_love_settings
CREATE POLICY "Allow public read customer_love_settings" ON customer_love_settings FOR SELECT USING (true);
CREATE POLICY "Allow update customer_love_settings" ON customer_love_settings FOR UPDATE USING (true);
