-- Create more_to_discover table for gallery images
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

-- Create more_to_discover_settings table
CREATE TABLE IF NOT EXISTS more_to_discover_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT DEFAULT 'More to Discover',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO more_to_discover_settings (section_title, is_active)
VALUES ('More to Discover', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE more_to_discover ENABLE ROW LEVEL SECURITY;
ALTER TABLE more_to_discover_settings ENABLE ROW LEVEL SECURITY;

-- Policies for more_to_discover
CREATE POLICY "Allow public read more_to_discover" ON more_to_discover FOR SELECT USING (true);
CREATE POLICY "Allow insert more_to_discover" ON more_to_discover FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update more_to_discover" ON more_to_discover FOR UPDATE USING (true);
CREATE POLICY "Allow delete more_to_discover" ON more_to_discover FOR DELETE USING (true);

-- Policies for more_to_discover_settings
CREATE POLICY "Allow public read more_to_discover_settings" ON more_to_discover_settings FOR SELECT USING (true);
CREATE POLICY "Allow update more_to_discover_settings" ON more_to_discover_settings FOR UPDATE USING (true);
