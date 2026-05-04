-- Create hero_settings table for the hero section
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

-- Insert default settings
INSERT INTO hero_settings (
  title, 
  subtitle, 
  description, 
  button_text, 
  button_link, 
  image_url, 
  is_active
)
VALUES (
  'The Maison Clutch',
  'Introducing The Maison Clutch — a celebration of refined simplicity and timeless design.',
  'Handwoven with precision, kissed by soft beige tones, and crafted to complement every mood and moment, for autumn vibes. It''s not just an accessory, it''s the definition of effortless sophistication.',
  'SHOP NOW',
  '/products',
  '/hero.webp',
  true
)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read hero_settings" ON hero_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated update hero_settings" ON hero_settings
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert hero_settings" ON hero_settings
  FOR INSERT WITH CHECK (true);
