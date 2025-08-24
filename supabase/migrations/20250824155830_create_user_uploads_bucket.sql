-- Create the user-uploads bucket with appropriate public access settings
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the bucket for link icons and other user uploads
INSERT INTO storage.buckets (id, name, public)
SELECT 'user-uploads', 'user-uploads', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-uploads');

-- Set file size limit to 2MB
UPDATE storage.buckets
SET file_size_limit = 2097152,  -- 2MB in bytes
    allowed_mime_types = '{"image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/gif"}'
WHERE id = 'user-uploads';


-- Set up policies for the user-uploads bucket
-- Policy for inserting files into link-icons folder
DROP POLICY IF EXISTS "Users can upload their own link icons" ON storage.objects;
CREATE POLICY "Users can upload their own link icons" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'link-icons'
);

-- Policy for selecting own files
DROP POLICY IF EXISTS "Users can view their own link icons" ON storage.objects;
CREATE POLICY "Users can view their own link icons" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'link-icons'
);

-- Policy for deleting own files
DROP POLICY IF EXISTS "Users can delete their own link icons" ON storage.objects;
CREATE POLICY "Users can delete their own link icons" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'link-icons'
);

-- Public read access for all user-uploaded icons
DROP POLICY IF EXISTS "Public can view link icons" ON storage.objects;
CREATE POLICY "Public can view link icons" ON storage.objects
FOR SELECT TO public
USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = 'link-icons'
);