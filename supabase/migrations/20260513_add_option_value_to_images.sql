-- Add option_value_id to product_images to link images to specific option values (e.g., Chain Type: Gold/Silver)
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS option_value_id UUID REFERENCES option_values(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_images_option_value_id ON product_images(option_value_id);
