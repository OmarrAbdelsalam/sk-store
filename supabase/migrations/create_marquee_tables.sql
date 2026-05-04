-- Create marquee_items table for the scrolling banner
CREATE TABLE IF NOT EXISTS marquee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marquee_settings table for global settings
CREATE TABLE IF NOT EXISTS marquee_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color VARCHAR(20) DEFAULT '#000000',
  text_color VARCHAR(20) DEFAULT '#ffffff',
  scroll_speed INTEGER DEFAULT 30, -- pixels per second
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO marquee_settings (background_color, text_color, scroll_speed, is_active)
VALUES ('#000000', '#ffffff', 30, true)
ON CONFLICT DO NOTHING;

-- Insert some default items
INSERT INTO marquee_items (text, display_order) VALUES
  ('SHIPPING ACROSS ALL EGYPT', 1),
  ('100% HANDMADE PRODUCTS', 2),
  ('PREMIUM QUALITY MATERIALS', 3),
  ('FREE SHIPPING OVER 500 EGP', 4)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marquee_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read marquee_items" ON marquee_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public read marquee_settings" ON marquee_settings
  FOR SELECT USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Allow authenticated insert marquee_items" ON marquee_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update marquee_items" ON marquee_items
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete marquee_items" ON marquee_items
  FOR DELETE USING (true);

CREATE POLICY "Allow authenticated update marquee_settings" ON marquee_settings
  FOR UPDATE USING (true);
