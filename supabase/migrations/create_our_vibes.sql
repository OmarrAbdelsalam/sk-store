-- Create our_vibes table for video reels/testimonials
CREATE TABLE IF NOT EXISTS our_vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,              -- Required: Dropbox path for video
  thumbnail_url TEXT,                   -- Optional: Dropbox path for thumbnail image
  caption TEXT NOT NULL,                -- Required: English caption
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,  -- Optional: Link to product
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create our_vibes_settings table
CREATE TABLE IF NOT EXISTS our_vibes_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT DEFAULT 'Our Vibes',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO our_vibes_settings (section_title, is_active)
VALUES ('Our Vibes', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE our_vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_vibes_settings ENABLE ROW LEVEL SECURITY;

-- Policies for our_vibes
CREATE POLICY "Allow public read our_vibes" ON our_vibes FOR SELECT USING (true);
CREATE POLICY "Allow insert our_vibes" ON our_vibes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update our_vibes" ON our_vibes FOR UPDATE USING (true);
CREATE POLICY "Allow delete our_vibes" ON our_vibes FOR DELETE USING (true);

-- Policies for our_vibes_settings
CREATE POLICY "Allow public read our_vibes_settings" ON our_vibes_settings FOR SELECT USING (true);
CREATE POLICY "Allow update our_vibes_settings" ON our_vibes_settings FOR UPDATE USING (true);
