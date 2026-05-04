-- Add type column to marquee_items and marquee_settings tables

-- Add type to marquee_items
ALTER TABLE marquee_items 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'top_banner';

-- Add type to marquee_settings
ALTER TABLE marquee_settings 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'top_banner';

-- Update RLS policies to include type check if necessary (existing policies likely cover all rows)
