-- Create images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'images' );

-- Allow authenticated and anon to upload images
CREATE POLICY "Anon/Auth Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'images' );

-- Allow authenticated and anon to update/delete their images (or just allow anyone since it's a front store right now)
CREATE POLICY "Anon/Auth Update Access" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'images' );

CREATE POLICY "Anon/Auth Delete Access" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'images' );
