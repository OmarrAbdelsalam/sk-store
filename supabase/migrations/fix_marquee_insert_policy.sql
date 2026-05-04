-- Fix marquee tables - add type column and INSERT policy

-- Step 1: Add type column to marquee_items (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marquee_items' AND column_name = 'type') THEN
        ALTER TABLE marquee_items ADD COLUMN type TEXT NOT NULL DEFAULT 'top_banner';
    END IF;
END $$;

-- Step 2: Add type column to marquee_settings (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marquee_settings' AND column_name = 'type') THEN
        ALTER TABLE marquee_settings ADD COLUMN type TEXT NOT NULL DEFAULT 'top_banner';
    END IF;
END $$;

-- Step 3: Add INSERT policy for marquee_settings (was missing)
DROP POLICY IF EXISTS "Allow insert marquee_settings" ON marquee_settings;
CREATE POLICY "Allow insert marquee_settings" ON marquee_settings 
  FOR INSERT WITH CHECK (true);

-- Step 4: Ensure default settings exist for both types
INSERT INTO marquee_settings (background_color, text_color, scroll_speed, is_active, type)
SELECT '#000000', '#ffffff', 30, true, 'top_banner'
WHERE NOT EXISTS (SELECT 1 FROM marquee_settings WHERE type = 'top_banner');

INSERT INTO marquee_settings (background_color, text_color, scroll_speed, is_active, type)
SELECT '#000000', '#ffffff', 40, true, 'features_ticker'
WHERE NOT EXISTS (SELECT 1 FROM marquee_settings WHERE type = 'features_ticker');
